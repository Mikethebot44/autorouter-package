import OpenAI from 'openai';

export const getOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey,
  });
};

export const generateEmbedding = async (apiKey: string, text: string): Promise<number[]> => {
  const client = getOpenAIClient(apiKey);
  const response = await client.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });
  return response.data[0].embedding;
};

