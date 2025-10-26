import {
  generateEmbedding,
  getPineconeIndex
} from "./chunk-AOL3Q2GT.mjs";

// src/index.ts
var AutoRouter = class {
  constructor(config) {
    this.openaiKey = config.openaiKey;
    this.pineconeKey = config.pineconeKey;
    this.pineconeIndexName = config.pineconeIndexName || "autorouter-models";
  }
  async selectModel(query, options) {
    try {
      const queryEmbedding = await generateEmbedding(this.openaiKey, query);
      const index = getPineconeIndex(this.pineconeKey, this.pineconeIndexName);
      const pineconeFilter = {};
      if (options?.filter?.license) {
        pineconeFilter.license = { $eq: options.filter.license };
      }
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: options?.limit || 10,
        includeMetadata: true,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : void 0
      });
      const models = queryResponse.matches?.map((match) => ({
        id: match.metadata?.id,
        name: match.metadata?.name,
        description: match.metadata?.description,
        task: match.metadata?.task,
        provider: match.metadata?.provider,
        license: match.metadata?.license,
        downloads: match.metadata?.downloads,
        score: match.score || 0,
        endpoint: match.metadata?.endpoint
      })) || [];
      return models;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to select model");
    }
  }
};
export {
  AutoRouter
};
//# sourceMappingURL=index.mjs.map