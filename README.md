# AutoRouter SDK

Auto-select the best AI model based on your query. This SDK automatically finds the most suitable models from Hugging Face based on semantic similarity to your task description.

## Installation

```bash
npm install autorouter-sdk
```

## Setup

AutoRouter requires OpenAI and Pinecone credentials. You'll need:
- OpenAI API key for generating embeddings
- Pinecone API key for vector database storage

Set them as environment variables:

```bash
export OPENAI_API_KEY='your-openai-key'
export PINECONE_API_KEY='your-pinecone-key'
```

Or use a `.env` file:

```
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=autorouter-models
```

## Initial Setup - Index Models

Before using the SDK, you need to index models into your Pinecone database. Run:

```bash
npx autorouter-sdk index-models
```

Or using the CLI directly:

```bash
autorouter-sdk index-models \
  --openai-key your-openai-key \
  --pinecone-key your-pinecone-key \
  --index-name autorouter-models
```

This will:
1. Load the bundled model registry (12,000+ models)
2. Generate embeddings for each model
3. Index them into your Pinecone database

The process takes about 10-15 minutes. You only need to run this once.

## Usage

### Basic Usage

```typescript
import { AutoRouter } from 'autorouter-sdk';

const router = new AutoRouter({
  openaiKey: 'your-openai-key',
  pineconeKey: 'your-pinecone-key',
  pineconeIndexName: 'autorouter-models' // optional, defaults to 'autorouter-models'
});

const models = await router.selectModel('build a chatbot');

console.log(models);
// [
//   {
//     id: 'meta-llama/Llama-2-7b-chat-hf',
//     name: 'Llama-2-7b-chat-hf',
//     description: 'A conversational AI model...',
//     task: 'text-generation',
//     provider: 'huggingface',
//     license: 'apache-2.0',
//     downloads: 5000000,
//     score: 0.95,
//     endpoint: 'https://api-inference.huggingface.co/models/...'
//   },
//   ...
// ]
```

### Advanced Usage

```typescript
// With options
const models = await router.selectModel('summarize text', {
  limit: 10,
  filter: { license: 'apache-2.0' }
});

// Get top 5 models
const topModels = await router.selectModel('generate images', { limit: 5 });
```

## API Reference

### AutoRouter

#### Constructor

```typescript
new AutoRouter(config: AutoRouterConfig)
```

- `config.openaiKey` (string): Your OpenAI API key
- `config.pineconeKey` (string): Your Pinecone API key
- `config.pineconeIndexName` (string, optional): Pinecone index name (defaults to 'autorouter-models')

#### Methods

##### selectModel(query, options?)

Returns an array of model recommendations sorted by relevance.

- `query` (string): Description of your task (e.g., "build a chatbot", "generate images")
- `options` (object, optional):
  - `limit` (number): Maximum number of results (default: 10)
  - `filter` (object): Filter options
    - `license` (string): Filter by license type (e.g., "apache-2.0", "mit")

### ModelResult

```typescript
interface ModelResult {
  id: string;           // Model identifier
  name: string;         // Model name
  description: string;  // Model description
  task: string;         // Task type (e.g., 'text-generation')
  provider: string;     // Provider (e.g., 'huggingface')
  license: string;      // License type
  downloads?: number;   // Download count
  score: number;        // Similarity score (0-1)
  endpoint?: string;    // Inference endpoint URL
}
```

## Examples

### Text Generation

```typescript
const models = await router.selectModel('generate creative stories');
```

### Image Generation

```typescript
const models = await router.selectModel('generate anime artwork');
```

### Text Classification

```typescript
const models = await router.selectModel('sentiment analysis');
```

### Open Source Only

```typescript
const models = await router.selectModel('summarize documents', {
  filter: { license: 'apache-2.0' }
});
```

## CLI Commands

### Index Models

```bash
autorouter-sdk index-models
```

Options:
- `--openai-key <key>`: OpenAI API key (or use OPENAI_API_KEY env var)
- `--pinecone-key <key>`: Pinecone API key (or use PINECONE_API_KEY env var)
- `--index-name <name>`: Pinecone index name (default: 'autorouter-models')
- `--registry-path <path>`: Path to custom model registry JSON file

## Error Handling

```typescript
try {
  const models = await router.selectModel('build a chatbot');
} catch (error) {
  console.error('Failed to select model:', error);
}
```

## License

MIT
