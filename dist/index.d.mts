interface ModelResult {
    id: string;
    name: string;
    description: string;
    task: string;
    provider: string;
    license: string;
    downloads?: number;
    score: number;
    endpoint?: string;
}
interface SearchOptions {
    limit?: number;
    filter?: {
        license?: string;
    };
}
interface AutoRouterConfig {
    openaiKey: string;
    pineconeKey: string;
    pineconeIndexName?: string;
}

declare class AutoRouter {
    private openaiKey;
    private pineconeKey;
    private pineconeIndexName;
    constructor(config: AutoRouterConfig);
    selectModel(query: string, options?: SearchOptions): Promise<ModelResult[]>;
}

export { AutoRouter, type AutoRouterConfig, type ModelResult, type SearchOptions };
