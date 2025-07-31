import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { LlmProvider, LlmModel } from "../llm/entities";
import { TranscriberProvider, TranscriberModel } from "../transcriber/entities";
import {
  SynthesizerProvider,
  SynthesizerModel,
  SynthesizerVoice,
} from "../synthesizer/entities";
import { Assistant } from "../assistant/entities";

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseType = configService.get("DATABASE_TYPE") || "postgres";
  
  if (databaseType === "sqlite") {
    return {
      type: "sqlite",
      database: configService.get("DATABASE_PATH") || "./database.sqlite",
      entities: [
        User,
        LlmProvider,
        LlmModel,
        TranscriberProvider,
        TranscriberModel,
        SynthesizerProvider,
        SynthesizerModel,
        SynthesizerVoice,
        Assistant,
      ],
      synchronize: configService.get("NODE_ENV") === "development",
      logging: configService.get("NODE_ENV") === "development",
    };
  }
  
  return {
    type: "postgres",
    host: configService.get("DATABASE_HOST"),
    port: configService.get("DATABASE_PORT"),
    username: configService.get("DATABASE_USERNAME"),
    password: configService.get("DATABASE_PASSWORD"),
    database: configService.get("DATABASE_NAME"),
    entities: [
      User,
      LlmProvider,
      LlmModel,
      TranscriberProvider,
      TranscriberModel,
      SynthesizerProvider,
      SynthesizerModel,
      SynthesizerVoice,
      Assistant,
    ],
    synchronize: configService.get("NODE_ENV") === "development",
    logging: configService.get("NODE_ENV") === "development",
    ssl:
      configService.get("NODE_ENV") === "production"
        ? { rejectUnauthorized: false }
        : false,
    migrations: ["dist/database/migrations/*.js"],
    migrationsRun: true,
  };
};
