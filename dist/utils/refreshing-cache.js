"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshingCache = void 0;
class RefreshingCache {
    constructor(loader, ttlMs) {
        this.loader = loader;
        this.ttlMs = ttlMs;
    }
    async get() {
        if (this.cached) {
            if (Date.now() >= this.cached.freshUntil)
                void this.startRefresh();
            return this.cached.value;
        }
        return this.startRefresh();
    }
    invalidate() {
        this.cached = undefined;
    }
    startRefresh() {
        if (this.refresh)
            return this.refresh;
        const run = this.loader()
            .then((value) => {
            this.cached = { value, freshUntil: Date.now() + this.ttlMs };
            return value;
        })
            .finally(() => {
            this.refresh = undefined;
        });
        this.refresh = run;
        run.catch(() => undefined);
        return run;
    }
}
exports.RefreshingCache = RefreshingCache;
//# sourceMappingURL=refreshing-cache.js.map