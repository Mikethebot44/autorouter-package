# AutoRouter SDK

Auto-select the best AI model based on your query. This SDK automatically finds the most suitable models from Hugging Face based on semantic similarity to your task description.

## Installation

```bash
npm install autorouter-sdk
```

## Usage

### Basic Usage

```typescript
import { AutoRouter } from 'autorouter-sdk';

const router = new AutoRouter({ apiKey: 'ar_live_your_api_key_here' });

const models = await router.selectModel('build a chatbot');

console.log(models);
// [
//   {
//     id: 'meta-llama/Llama-2-7b-chat-hf',
//     name: 'Llama-2-7b-chat-hf',
//     description: 'A conversational AI model...',
//     task: 'text-generation',
//     provider: 'huggingface',
//     license: 'llama2',
//     downloads: 5000000,
//     score: 0.95
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

// Health check
const isHealthy = await router.healthCheck();
```

## API Reference

### AutoRouter

#### Constructor

```typescript
new AutoRouter(config: AutoRouterConfig)
```

- `config.apiKey` (string): Your AutoRouter API key
- `config.baseUrl` (string, optional): Custom server URL (defaults to production)

#### Methods

##### selectModel(query, options?)

Returns an array of model recommendations sorted by relevance.

- `query` (string): Description of your task (e.g., "build a chatbot", "generate images")
- `options` (object, optional):
  - `limit` (number): Maximum number of results (default: 10)
  - `filter` (object): Filter options
    - `license` (string): Filter by license type (e.g., "apache-2.0", "mit")

##### healthCheck()

Returns a boolean indicating if the service is healthy.

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

## Error Handling

```typescript
try {
  const models = await router.selectModel('build a chatbot');
} catch (error) {
  if (error.message === 'Invalid API key') {
    // Handle authentication error
  } else {
    // Handle other errors
  }
}
```

## License

MIT
# autorouter-package
