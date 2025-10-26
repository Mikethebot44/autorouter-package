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
    apiKey: string;
    baseUrl?: string;
}

declare class AutoRouter {
    private apiKey;
    private baseUrl;
    constructor(config: AutoRouterConfig);
    selectModel(query: string, options?: SearchOptions): Promise<ModelResult[]>;
    /**
     * Health check method to verify the service is running
     */
    healthCheck(): Promise<boolean>;
}

export { AutoRouter };
