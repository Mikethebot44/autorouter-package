"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AutoRouter: () => AutoRouter
});
module.exports = __toCommonJS(index_exports);

// src/pinecone.ts
var import_pinecone = require("@pinecone-database/pinecone");
var getPineconeClient = (apiKey) => {
  return new import_pinecone.Pinecone({
    apiKey
  });
};
var getPineconeIndex = (apiKey, indexName) => {
  const client = getPineconeClient(apiKey);
  return client.index(indexName);
};

// src/openai.ts
var import_openai = __toESM(require("openai"));
var getOpenAIClient = (apiKey) => {
  return new import_openai.default({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutoRouter
});
//# sourceMappingURL=index.js.map