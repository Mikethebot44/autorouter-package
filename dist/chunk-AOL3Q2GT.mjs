// src/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";
var getPineconeClient = (apiKey) => {
  return new Pinecone({
    apiKey
  });
};
var getPineconeIndex = (apiKey, indexName) => {
  const client = getPineconeClient(apiKey);
  return client.index(indexName);
};

// src/openai.ts
import OpenAI from "openai";
var getOpenAIClient = (apiKey) => {
  return new OpenAI({
    apiKey
  });
};
var generateEmbedding = async (apiKey, text) => {
  const client = getOpenAIClient(apiKey);
  const response = await client.embeddings.create({
    model: "text-embedding-3-large",
    input: text
  });
  return response.data[0].embedding;
};

export {
  getPineconeIndex,
  generateEmbedding
};
//# sourceMappingURL=chunk-AOL3Q2GT.mjs.map