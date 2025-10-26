import { ModelResult, SearchOptions, AutoRouterConfig } from './types';
import { getPineconeIndex } from './pinecone';
import { generateEmbedding } from './openai';

export class AutoRouter {
  private openaiKey: string;
  private pineconeKey: string;
  private pineconeIndexName: string;

  constructor(config: AutoRouterConfig) {
    this.openaiKey = config.openaiKey;
    this.pineconeKey = config.pineconeKey;
    this.pineconeIndexName = config.pineconeIndexName || 'autorouter-models';
  }

  async selectModel(
    query: string,
    options?: SearchOptions
  ): Promise<ModelResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(this.openaiKey, query);

      // Get Pinecone index
      const index = getPineconeIndex(this.pineconeKey, this.pineconeIndexName);

      // Build filter for Pinecone
      const pineconeFilter: Record<string, { $eq: string }> = {};
      if (options?.filter?.license) {
        pineconeFilter.license = { $eq: options.filter.license };
      }

      // Query Pinecone
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: options?.limit || 10,
        includeMetadata: true,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
      });

      // Transform results to ModelResult format
      const models: ModelResult[] = queryResponse.matches?.map((match) => ({
        id: match.metadata?.id as string,
        name: match.metadata?.name as string,
        description: match.metadata?.description as string,
        task: match.metadata?.task as string,
        provider: match.metadata?.provider as string,
        license: match.metadata?.license as string,
        downloads: match.metadata?.downloads as number,
        score: match.score || 0,
        endpoint: match.metadata?.endpoint as string,
      })) || [];

      return models;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to select model');
    }
  }
}

export { ModelResult, SearchOptions, AutoRouterConfig } from './types';
