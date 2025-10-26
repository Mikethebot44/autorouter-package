import { ModelResult, SearchOptions, SearchResponse, AutoRouterConfig } from './types';

export class AutoRouter {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AutoRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://autorouter-server.vercel.app';
  }

  async selectModel(
    query: string,
    options?: SearchOptions
  ): Promise<ModelResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          limit: options?.limit,
          filter: options?.filter,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || 'Bad request');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      return data.models;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Health check method to verify the service is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
