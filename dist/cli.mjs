#!/usr/bin/env node
import {
  generateEmbedding,
  getPineconeIndex
} from "./chunk-AOL3Q2GT.mjs";

// src/cli.ts
import { Command } from "commander";
import * as dotenv from "dotenv";

// src/index-models.ts
import fs from "fs";
import path from "path";
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
  if (!fs.existsSync(registryPath)) {
    console.error("Registry file not found. Please ensure model-registry.json exists.");
    process.exit(1);
  }
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  console.log(`Loaded ${registry.length} models from registry`);
  return registry;
}
async function indexModels(openaiKey, pineconeKey, pineconeIndexName, registryPath) {
  console.log("Starting model indexing...");
  if (!registryPath) {
    const possiblePaths = [
      path.join(__dirname, "..", "data", "model-registry.json"),
      path.join(process.cwd(), "data", "model-registry.json"),
      path.join(process.cwd(), "node_modules", "autorouter-sdk", "data", "model-registry.json")
    ];
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
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
var program = new Command();
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
//# sourceMappingURL=cli.mjs.map