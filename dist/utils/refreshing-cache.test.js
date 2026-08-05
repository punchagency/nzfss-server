"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const refreshing_cache_1 = require("./refreshing-cache");
const tick = () => new Promise((resolve) => setImmediate(resolve));
(0, node_test_1.describe)("RefreshingCache", () => {
    (0, node_test_1.it)("computes once and serves the cached value while fresh", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => ++calls, 10000);
        node_assert_1.default.equal(await cache.get(), 1);
        node_assert_1.default.equal(await cache.get(), 1);
        node_assert_1.default.equal(calls, 1);
    });
    (0, node_test_1.it)("dedupes concurrent cold reads into one computation", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => {
            calls++;
            await tick();
            return "value";
        }, 10000);
        const results = await Promise.all([cache.get(), cache.get(), cache.get()]);
        node_assert_1.default.deepEqual(results, ["value", "value", "value"]);
        node_assert_1.default.equal(calls, 1);
    });
    (0, node_test_1.it)("serves a stale value immediately and refreshes behind it", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => ++calls, 0);
        node_assert_1.default.equal(await cache.get(), 1);
        node_assert_1.default.equal(await cache.get(), 1);
        await tick();
        await tick();
        node_assert_1.default.equal(await cache.get(), 2);
    });
    (0, node_test_1.it)("recomputes after invalidate", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => ++calls, 10000);
        node_assert_1.default.equal(await cache.get(), 1);
        cache.invalidate();
        node_assert_1.default.equal(await cache.get(), 2);
    });
    (0, node_test_1.it)("propagates a cold-load failure and retries on the next read", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => {
            calls++;
            if (calls === 1)
                throw new Error("boom");
            return "recovered";
        }, 10000);
        await node_assert_1.default.rejects(() => cache.get(), /boom/);
        node_assert_1.default.equal(await cache.get(), "recovered");
    });
    (0, node_test_1.it)("keeps serving the last good value when a background refresh fails", async () => {
        let calls = 0;
        const cache = new refreshing_cache_1.RefreshingCache(async () => {
            calls++;
            if (calls > 1)
                throw new Error("upstream down");
            return "good";
        }, 0);
        node_assert_1.default.equal(await cache.get(), "good");
        node_assert_1.default.equal(await cache.get(), "good");
        await tick();
        await tick();
        node_assert_1.default.equal(await cache.get(), "good");
    });
});
//# sourceMappingURL=refreshing-cache.test.js.map