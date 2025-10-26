import * as fs from 'fs';
import * as path from 'path';

interface ModelWithCard {
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

interface ModelRegistry {
  id: string;
  name: string;
  downloads: number;
  task: string;
  description: string;
  license: string;
  tags: string[];
  endpoint: string;
  category: string;
}

async function fetchModels(page = 0, limit = 100, sortBy = 'downloads', task?: string): Promise<ModelWithCard[]> {
  try {
    let url = `https://huggingface.co/api/models?pagination=true&limit=${limit}&p=${page}&sort=${sortBy}&direction=-1`;
    
    if (task) {
      url += `&filter=${task}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching models page ${page}${task ? ` for task ${task}` : ''}:`, error);
    return [];
  }
}

async function getModelCard(modelId: string): Promise<any> {
  try {
    const response = await fetch(`https://huggingface.co/api/models/${modelId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching model card for ${modelId}:`, error);
    return null;
  }
}

function getCategoryForTask(task: string): string {
  const taskCategories: Record<string, string> = {
    'text-generation': 'text-generation',
    'text2text-generation': 'text-generation',
    'text-classification': 'text-classification',
    'token-classification': 'text-classification',
    'zero-shot-classification': 'text-classification',
    'question-answering': 'question-answering',
    'table-question-answering': 'question-answering',
    'document-question-answering': 'question-answering',
    'summarization': 'summarization',
    'translation': 'translation',
    'text-to-image': 'image-generation',
    'image-classification': 'image-classification',
    'image-to-text': 'image-classification',
    'image-captioning': 'image-classification',
    'object-detection': 'object-detection',
    'image-segmentation': 'object-detection',
    'automatic-speech-recognition': 'speech',
    'text-to-speech': 'speech',
    'audio-classification': 'speech',
    'feature-extraction': 'feature-extraction',
    'fill-mask': 'feature-extraction',
    'conversational': 'conversational',
    'visual-question-answering': 'visual-qa',
  };
  
  return taskCategories[task] || 'other';
}

async function generateModelRegistry() {
  console.log('🚀 Generating model registry...');
  
  const modelsPerTask = 200; // Top 200 models per task type
  const registry: ModelRegistry[] = [];
  const seenModelIds = new Set<string>();
  
  // Define task categories
  const taskCategories = {
    'text-generation': ['text-generation', 'text2text-generation'],
    'text-classification': ['text-classification', 'token-classification', 'zero-shot-classification'],
    'question-answering': ['question-answering', 'table-question-answering', 'document-question-answering'],
    'summarization': ['summarization'],
    'translation': ['translation'],
    'image-generation': ['text-to-image'],
    'image-classification': ['image-classification', 'image-to-text', 'image-captioning'],
    'object-detection': ['object-detection', 'image-segmentation'],
    'speech': ['automatic-speech-recognition', 'text-to-speech', 'audio-classification'],
    'feature-extraction': ['feature-extraction', 'fill-mask'],
    'conversational': ['conversational'],
    'visual-qa': ['visual-question-answering'],
  };

  // Get top models for each task category
  for (const [categoryName, tasks] of Object.entries(taskCategories)) {
    console.log(`\n📋 Processing category: ${categoryName} (${tasks.join(', ')})`);
    
    for (const task of tasks) {
      console.log(`  🔍 Fetching top ${modelsPerTask} models for task: ${task}`);
      
      const models = await fetchModels(0, modelsPerTask, 'downloads', task);
      
      if (models.length === 0) {
        console.log(`  ⚠️  No models found for task: ${task}`);
        continue;
      }

      console.log(`  📊 Found ${models.length} models for ${task}`);

      // Process each model
      for (const model of models) {
        if (seenModelIds.has(model.id)) continue;
        
        try {
          const modelCard = await getModelCard(model.id);
          
          if (!modelCard) {
            console.log(`  ⚠️  Skipping ${model.id} - no model card`);
            continue;
          }

          const registryEntry: ModelRegistry = {
            id: model.id,
            name: model.id.split('/')[1] || model.id,
            downloads: model.downloads,
            task: model.pipeline_tag || 'unknown',
            description: modelCard.cardData?.description || '',
            license: modelCard.cardData?.license || 'unknown',
            tags: [...(modelCard.cardData?.tags || []), ...(model.tags || [])],
            endpoint: `https://api-inference.huggingface.co/models/${model.id}`,
            category: getCategoryForTask(model.pipeline_tag || 'unknown'),
          };

          registry.push(registryEntry);
          seenModelIds.add(model.id);
          
          console.log(`  ✅ Added ${model.id} (${model.downloads.toLocaleString()} downloads)`);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`  ❌ Error processing ${model.id}:`, error);
        }
      }

      // Delay between tasks
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Sort by downloads
  registry.sort((a, b) => b.downloads - a.downloads);

  // Generate statistics
  const stats = {
    total: registry.length,
    byCategory: {} as Record<string, number>,
    byTask: {} as Record<string, number>,
    top10: registry.slice(0, 10),
  };

  registry.forEach(model => {
    stats.byCategory[model.category] = (stats.byCategory[model.category] || 0) + 1;
    stats.byTask[model.task] = (stats.byTask[model.task] || 0) + 1;
  });

  // Save registry to autorouter-package data folder
  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const registryPath = path.join(outputDir, 'model-registry.json');
  const statsPath = path.join(outputDir, 'model-stats.json');

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  console.log(`\n📊 Registry Statistics:`);
  console.log(`  Total models: ${stats.total}`);
  console.log(`\n📋 By Category:`);
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} models`);
  });
  console.log(`\n🏆 Top 10 Models:`);
  stats.top10.forEach((model, i) => {
    console.log(`  ${i + 1}. ${model.id} - ${model.downloads.toLocaleString()} downloads (${model.task})`);
  });

  console.log(`\n💾 Registry saved to: ${registryPath}`);
  console.log(`📈 Statistics saved to: ${statsPath}`);
  console.log(`\n🎉 Registry generation complete!`);
}

// Run the registry generation
const isMainModule = import.meta.url === `file://${process.argv[1]}` || require.main === module;
if (isMainModule) {
  generateModelRegistry().catch(console.error);
}

export { generateModelRegistry };

