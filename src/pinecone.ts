import { Pinecone } from '@pinecone-database/pinecone';

export const getPineconeClient = (apiKey: string) => {
  return new Pinecone({
    apiKey,
  });
};

export const getPineconeIndex = (apiKey: string, indexName: string) => {
  const client = getPineconeClient(apiKey);
  return client.index(indexName);
};

