import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { GeneratePromptDto } from './dto/generate-prompt.dto';
import { PromptResponseDto } from './dto/prompt-response.dto';

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      // Avoid crashing the entire application when the API key is not provided.
      // The service will operate in a "disabled" mode and return stubbed responses.
      this.logger.warn('OPENAI_API_KEY is not configured. Prompt generation will return stub data.');
      // @ts-ignore – OpenAI type expects a key but we intentionally leave it undefined.
      this.openai = undefined as unknown as OpenAI;
    } else {
      this.openai = new OpenAI({
        apiKey,
      });
    }

    this.logger.log('PromptService initialized with OpenAI client');
  }

  async generatePromptStructure(generatePromptDto: GeneratePromptDto): Promise<PromptResponseDto> {
    const { taskDescription } = generatePromptDto;

    try {
      this.logger.log(`Generating prompt structure for task: ${taskDescription}`);

      const prompt = `
You are an expert AI assistant prompt engineer.

Given the following user request: "${taskDescription}", generate a well-structured AI system prompt in the following format:

[Identity]
Define the assistant's role clearly.

[Style]
Describe the tone, language style, and interaction manner.

[Response Guidelines]
List how the assistant should respond, including formatting or interaction rules.

[Task & Goals]
Break down the interaction into step-by-step instructions.
Use "< wait for user response >" wherever the assistant should pause for user input.

[Error Handling / Fallback]
Explain how the assistant should handle unclear input or tool/API failure.

Return the result in a markdown-style block (with no explanations or headers).
`;

      // If OpenAI client is disabled due to missing API key, return a deterministic stub.
      let generatedPrompt: string | undefined;

      if (!this.openai) {
        generatedPrompt = `# Stub Prompt\n\nIdentity: Stub AI Assistant\n\nStyle: Friendly and helpful\n\nResponse Guidelines: Always provide a helpful answer.\n\nTask & Goals: ${taskDescription}`;
      } else {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
        });

        generatedPrompt = completion.choices[0]?.message?.content;
      }

      if (!generatedPrompt) {
        throw new InternalServerErrorException('Failed to generate prompt from OpenAI');
      }

      this.logger.log('Prompt structure generated successfully');

      return {
        generatedPrompt: generatedPrompt.trim(),
        originalTask: taskDescription,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Error generating prompt structure: ${error.message}`, error.stack);

      if (error.code === 'insufficient_quota') {
        throw new BadRequestException('OpenAI API quota exceeded. Please try again later.');
      }

      if (error.code === 'invalid_api_key') {
        throw new InternalServerErrorException('Invalid OpenAI API key configuration');
      }

      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to generate prompt structure');
    }
  }
}
