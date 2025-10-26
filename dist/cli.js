#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/cli.ts
var import_commander = require("commander");
var dotenv = __toESM(require("dotenv"));

// src/index-models.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));

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

// src/index-models.ts
function constructSearchableText(model) {
  const parts = [
    model.id,
    model.task || "",
    model.description || "",
    ...model.tags || []
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}
async function loadModelsFromRegistry(registryPath) {
  if (!import_fs.default.existsSync(registryPath)) {
    console.error("Registry file not found. Please ensure model-registry.json exists.");
    process.exit(1);
  }
  const registry = JSON.parse(import_fs.default.readFileSync(registryPath, "utf-8"));
  console.log(`Loaded ${registry.length} models from registry`);
  return registry;
}
async function indexModels(openaiKey, pineconeKey, pineconeIndexName, registryPath) {
  console.log("Starting model indexing...");
  if (!registryPath) {
    const possiblePaths = [
      import_path.default.join(__dirname, "..", "data", "model-registry.json"),
      import_path.default.join(process.cwd(), "data", "model-registry.json"),
      import_path.default.join(process.cwd(), "node_modules", "autorouter-sdk", "data", "model-registry.json")
    ];
    for (const possiblePath of possiblePaths) {
      if (import_fs.default.existsSync(possiblePath)) {
        registryPath = possiblePath;
        break;
      }
    }
    if (!registryPath) {
      console.error("Registry file not found. Please ensure model-registry.json exists.");
      console.error("Tried:", possiblePaths);
      process.exit(1);
    }
  }
  const index = getPineconeIndex(pineconeKey, pineconeIndexName);
  let totalIndexed = 0;
  const allModels = await loadModelsFromRegistry(registryPath);
  console.log(`
Total models to index: ${allModels.length}`);
  console.log(`
Top 10 models by downloads:`);
  allModels.slice(0, 10).forEach((model, i) => {
    console.log(`  ${i + 1}. ${model.id} - ${model.downloads.toLocaleString()} downloads (${model.task || "unknown"})`);
  });
  console.log(`
Processing ${allModels.length} models...`);
  for (const model of allModels) {
    try {
      const searchableText = constructSearchableText(model);
      if (!searchableText.trim()) {
        console.log(`Skipping ${model.id} - no searchable content`);
        continue;
      }
      const embedding = await generateEmbedding(openaiKey, searchableText);
      const metadata = {
        id: model.id,
        name: model.name || model.id.split("/")[1] || model.id,
        description: model.description || "",
        task: model.task || "unknown",
        provider: "huggingface",
        license: model.license || "unknown",
        downloads: model.downloads,
        endpoint: model.endpoint || `https://api-inference.huggingface.co/models/${model.id}`
      };
      await index.upsert([
        {
          id: model.id,
          values: embedding,
          metadata
        }
      ]);
      totalIndexed++;
      if (totalIndexed % 10 === 0) {
        console.log(`Progress: ${totalIndexed}/${allModels.length} models indexed`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing model ${model.id}:`, error);
    }
  }
  console.log(`
Indexing complete! Total models indexed: ${totalIndexed}`);
}

// src/cli.ts
dotenv.config();
var program = new import_commander.Command();
program.name("autorouter-sdk").description("AutoRouter SDK - AI model selection toolkit").version("1.0.0");
program.command("index-models").description("Index models from registry into Pinecone").option("-o, --openai-key <key>", "OpenAI API key (or use OPENAI_API_KEY env var)").option("-p, --pinecone-key <key>", "Pinecone API key (or use PINECONE_API_KEY env var)").option("-i, --index-name <name>", "Pinecone index name", "autorouter-models").option("-r, --registry-path <path>", "Path to model registry JSON file").action(async (options) => {
  const openaiKey = options.openaiKey || process.env.OPENAI_API_KEY;
  const pineconeKey = options.pineconeKey || process.env.PINECONE_API_KEY;
  const indexName = options.indexName || "autorouter-models";
  if (!openaiKey) {
    console.error("\u274C OpenAI API key is required. Set OPENAI_API_KEY or use --openai-key");
    process.exit(1);
  }
  if (!pineconeKey) {
    console.error("\u274C Pinecone API key is required. Set PINECONE_API_KEY or use --pinecone-key");
    process.exit(1);
  }
  console.log("\u{1F511} Using OpenAI key:", openaiKey.substring(0, 10) + "...");
  console.log("\u{1F511} Using Pinecone key:", pineconeKey.substring(0, 10) + "...");
  console.log("\u{1F4DD} Index name:", indexName);
  console.log("");
  try {
    await indexModels(openaiKey, pineconeKey, indexName, options.registryPath);
  } catch (error) {
    console.error("Failed to index models:", error);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=cli.js.map