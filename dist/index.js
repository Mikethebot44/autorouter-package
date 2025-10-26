"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AutoRouter: () => AutoRouter
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutoRouter
});
//# sourceMappingURL=index.js.map