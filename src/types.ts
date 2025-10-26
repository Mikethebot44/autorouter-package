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

export interface SearchResponse {
  models: ModelResult[];
  total: number;
}

export interface AutoRouterConfig {
  apiKey: string;
  baseUrl?: string;
}
