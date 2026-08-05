export declare class RefreshingCache<T> {
    private readonly loader;
    private readonly ttlMs;
    private cached?;
    private refresh?;
    constructor(loader: () => Promise<T>, ttlMs: number);
    get(): Promise<T>;
    invalidate(): void;
    private startRefresh;
}
