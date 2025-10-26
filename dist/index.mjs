// src/index.ts
var AutoRouter = class {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://autorouter-server.vercel.app";
  }
  async selectModel(query, options) {
    try {
      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          limit: options?.limit,
          filter: options?.filter
        })
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key");
        }
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || "Bad request");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }
  /**
   * Health check method to verify the service is running
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
export {
  AutoRouter
};
//# sourceMappingURL=index.mjs.map