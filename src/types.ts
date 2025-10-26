export interface ModelResult {
  id: string;
  name: string;
  description: string;
  task: string;
  provider: string;
  license: string;
  downloads?: number;
  score: number;
  endpoint?: string;
}

export interface SearchOptions {
  limit?: number;
  filter?: {
    license?: string;
  };
}

export interface AutoRouterConfig {
  openaiKey: string;
  pineconeKey: string;
  pineconeIndexName?: string;
}

export interface HuggingFaceModel {
  id: string;
  downloads: number;
  pipeline_tag?: string;
  cardData?: {
    description?: string;
    license?: string;
    tags?: string[];
  };
  tags?: string[];
}
