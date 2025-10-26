#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { indexModels } from './index-models';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('autorouter-sdk')
  .description('AutoRouter SDK - AI model selection toolkit')
  .version('1.0.0');

program
  .command('index-models')
  .description('Index models from registry into Pinecone')
  .option('-o, --openai-key <key>', 'OpenAI API key (or use OPENAI_API_KEY env var)')
  .option('-p, --pinecone-key <key>', 'Pinecone API key (or use PINECONE_API_KEY env var)')
  .option('-i, --index-name <name>', 'Pinecone index name', 'autorouter-models')
  .option('-r, --registry-path <path>', 'Path to model registry JSON file')
  .action(async (options) => {
    const openaiKey = options.openaiKey || process.env.OPENAI_API_KEY;
    const pineconeKey = options.pineconeKey || process.env.PINECONE_API_KEY;
    const indexName = options.indexName || 'autorouter-models';

    if (!openaiKey) {
      console.error('❌ OpenAI API key is required. Set OPENAI_API_KEY or use --openai-key');
      process.exit(1);
    }

    if (!pineconeKey) {
      console.error('❌ Pinecone API key is required. Set PINECONE_API_KEY or use --pinecone-key');
      process.exit(1);
    }

    console.log('🔑 Using OpenAI key:', openaiKey.substring(0, 10) + '...');
    console.log('🔑 Using Pinecone key:', pineconeKey.substring(0, 10) + '...');
    console.log('📝 Index name:', indexName);
    console.log('');

    try {
      await indexModels(openaiKey, pineconeKey, indexName, options.registryPath);
    } catch (error) {
      console.error('Failed to index models:', error);
      process.exit(1);
    }
  });

program.parse();

