import fs from 'fs';
import path from 'path';
import { getPineconeIndex } from './pinecone';
import { generateEmbedding } from './openai';
import { HuggingFaceModel } from './types';

function constructSearchableText(model: any): string {
  const parts = [
    model.id,
    model.task || '',
    model.description || '',
    ...(model.tags || []),
  ];
  
  return parts.filter(Boolean).join(' ').toLowerCase();
}

async function loadModelsFromRegistry(registryPath: string): Promise<any[]> {
  if (!fs.existsSync(registryPath)) {
    console.error('⚠️  Registry file not found. Please ensure model-registry.json exists.');
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  console.log(`📚 Loaded ${registry.length} models from registry`);
  
  return registry;
}

export async function indexModels(
  openaiKey: string,
  pineconeKey: string,
  pineconeIndexName: string,
  registryPath?: string
) {
  console.log('Starting model indexing...');
  
  // Get registry path
  if (!registryPath) {
    // Try multiple possible locations
    const possiblePaths = [
      path.join(__dirname, '..', 'data', 'model-registry.json'),
      path.join(process.cwd(), 'data', 'model-registry.json'),
      path.join(process.cwd(), 'node_modules', 'autorouter-sdk', 'data', 'model-registry.json'),
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        registryPath = possiblePath;
        break;
      }
    }
    
    if (!registryPath) {
      console.error('⚠️  Registry file not found. Please ensure model-registry.json exists.');
      console.error('Tried:', possiblePaths);
      process.exit(1);
    }
  }

  const index = getPineconeIndex(pineconeKey, pineconeIndexName);
  let totalIndexed = 0;

  // Load models from registry file
  const allModels = await loadModelsFromRegistry(registryPath);

  // Show statistics
  console.log(`\n📊 Total models to index: ${allModels.length}`);
  console.log(`\n🏆 Top 10 models by downloads:`);
  allModels.slice(0, 10).forEach((model, i) => {
    console.log(`  ${i + 1}. ${model.id} - ${model.downloads.toLocaleString()} downloads (${model.task || 'unknown'})`);
  });

  console.log(`\n🚀 Processing ${allModels.length} models...`);

  // Now index the models
  for (const model of allModels) {
    try {
      // Construct searchable text from registry data
      const searchableText = constructSearchableText(model);

      if (!searchableText.trim()) {
        console.log(`⏭️  Skipping ${model.id} - no searchable content`);
        continue;
      }

      // Generate embedding
      const embedding = await generateEmbedding(openaiKey, searchableText);

      // Prepare metadata
      const metadata = {
        id: model.id,
        name: model.name || model.id.split('/')[1] || model.id,
        description: model.description || '',
        task: model.task || 'unknown',
        provider: 'huggingface',
        license: model.license || 'unknown',
        downloads: model.downloads,
        endpoint: model.endpoint || `https://api-inference.huggingface.co/models/${model.id}`,
      };

      // Upsert to Pinecone
      await index.upsert([
        {
          id: model.id,
          values: embedding,
          metadata,
        },
      ]);

      totalIndexed++;
      if (totalIndexed % 100 === 0) {
        console.log(`📊 Progress: ${totalIndexed}/${allModels.length} models indexed`);
      }

      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error processing model ${model.id}:`, error);
    }
  }

  console.log(`\n🎉 Indexing complete! Total models indexed: ${totalIndexed}`);
}

