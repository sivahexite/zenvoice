import os
import asyncio
import uuid
import traceback
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

# In-memory storage fallback
in_memory_storage = {}

# Try to connect to Redis, fallback to in-memory storage
try:
    redis_pool = redis.ConnectionPool.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'), decode_responses=True)
    redis_client = redis.Redis.from_pool(redis_pool)
    # Test the connection
    redis_client.ping()
    use_redis = True
    print("Connected to Redis successfully")
except Exception as e:
    print(f"Redis connection failed, using in-memory storage: {e}")
    use_redis = False
    redis_client = None

active_websockets: List[WebSocket] = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class AgentModel(BaseModel):
    name: str
    description: str
    tasks: List[Dict] = []

class CreateAgentPayload(BaseModel):
    agent_config: AgentModel
    agent_prompts: Optional[Dict[str, Dict[str, str]]] = None

@app.get("/")
async def root():
    return {"message": "AI Agent Server is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "storage": "redis" if use_redis else "memory"}

@app.get("/agent/{agent_id}")
async def get_agent(agent_id: str):
    """Fetches an agent's information by ID."""
    try:
        if use_redis:
            agent_data = await redis_client.get(agent_id)
        else:
            agent_data = in_memory_storage.get(agent_id)
            
        if not agent_data:
            raise HTTPException(status_code=404, detail="Agent not found")

        return json.loads(agent_data) if isinstance(agent_data, str) else agent_data

    except Exception as e:
        print(f"Error fetching agent {agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/agent")
async def create_agent(agent_data: CreateAgentPayload):
    agent_uuid = str(uuid.uuid4())
    data_for_db = agent_data.agent_config.model_dump()
    data_for_db["assistant_status"] = "created"
    agent_prompts = agent_data.agent_prompts
    print(f'Data for DB {data_for_db}')

    if use_redis:
        await redis_client.set(agent_uuid, json.dumps(data_for_db))
    else:
        in_memory_storage[agent_uuid] = data_for_db

    return {"agent_id": agent_uuid, "state": "created"}

@app.get("/all")
async def get_all_agents():
    """Fetches all agents stored in Redis or memory."""
    try:
        if use_redis:
            agent_keys = await redis_client.keys("*")
            if not agent_keys:
                return {"agents": []}
            agents_data = []
            for key in agent_keys:
                try:
                    data = await redis_client.get(key)
                    agents_data.append(data)
                except Exception as e:
                    print(f"An error occurred with key {key}: {e}")

            agents = [{ "agent_id": key, "data": json.loads(data) } for key, data in zip(agent_keys, agents_data) if data]
        else:
            agents = [{ "agent_id": key, "data": data } for key, data in in_memory_storage.items()]

        return {"agents": agents}

    except Exception as e:
        print(f"Error fetching all agents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Simple test endpoint to debug WebSocket connection
@app.websocket("/test")
async def test_websocket(websocket: WebSocket):
    print("TEST: WebSocket connection attempt")
    await websocket.accept()
    print("TEST: WebSocket connection accepted")
    try:
        await websocket.send_text("Hello from server!")
        print("TEST: Test message sent")
        while True:
            data = await websocket.receive_text()
            print(f"TEST: Received: {data}")
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print("TEST: WebSocket disconnected")

@app.websocket("/chat/v1/{agent_id}")
async def websocket_endpoint(agent_id: str, websocket: WebSocket, user_agent: str = Query(None)):
    print(f"MAIN: WebSocket connection attempt for agent {agent_id}")
    await websocket.accept()
    print("MAIN: WebSocket connection accepted")
    active_websockets.append(websocket)
    
    try:
        if use_redis:
            retrieved_agent_config = await redis_client.get(agent_id)
        else:
            retrieved_agent_config = in_memory_storage.get(agent_id)
            
        print(f"MAIN: Retrieved agent config: {retrieved_agent_config is not None}")
        
        if not retrieved_agent_config:
            await websocket.send_text(json.dumps({"error": "Agent not found"}))
            return
            
        agent_config = json.loads(retrieved_agent_config) if isinstance(retrieved_agent_config, str) else retrieved_agent_config

        # Send a simple response
        await websocket.send_text(json.dumps({
            "type": "text",
            "data": f"Hello! I'm agent {agent_config.get('name', 'Unknown')}. How can I help you?"
        }))

        # Keep connection alive and echo messages
        while True:
            try:
                data = await websocket.receive_text()
                print(f"MAIN: Received: {data}")
                
                # Echo back the message
                await websocket.send_text(json.dumps({
                    "type": "text",
                    "data": f"You said: {data}"
                }))
                
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        print("MAIN: WebSocket disconnected")
        active_websockets.remove(websocket)
    except Exception as e:
        print(f"MAIN: Error in websocket: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Agent Server...")
    print(f"📊 Storage: {'Redis' if use_redis else 'In-Memory'}")
    uvicorn.run(app, host="0.0.0.0", port=5001)