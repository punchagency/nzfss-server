import { describe, it } from "node:test";
import assert from "node:assert";
import { RefreshingCache } from "./refreshing-cache";

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe("RefreshingCache", () => {
  it("computes once and serves the cached value while fresh", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => ++calls, 10_000);

    assert.equal(await cache.get(), 1);
    assert.equal(await cache.get(), 1);
    assert.equal(calls, 1);
  });

  it("dedupes concurrent cold reads into one computation", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => {
      calls++;
      await tick();
      return "value";
    }, 10_000);

    const results = await Promise.all([cache.get(), cache.get(), cache.get()]);
    assert.deepEqual(results, ["value", "value", "value"]);
    assert.equal(calls, 1);
  });

  it("serves a stale value immediately and refreshes behind it", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => ++calls, 0); // always stale

    assert.equal(await cache.get(), 1);
    // Still the old value — the caller is not made to wait for the refresh.
    assert.equal(await cache.get(), 1);

    await tick();
    await tick();
    assert.equal(await cache.get(), 2);
  });

  it("recomputes after invalidate", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => ++calls, 10_000);

    assert.equal(await cache.get(), 1);
    cache.invalidate();
    assert.equal(await cache.get(), 2);
  });

  it("propagates a cold-load failure and retries on the next read", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => {
      calls++;
      if (calls === 1) throw new Error("boom");
      return "recovered";
    }, 10_000);

    await assert.rejects(() => cache.get(), /boom/);
    assert.equal(await cache.get(), "recovered");
  });

  it("keeps serving the last good value when a background refresh fails", async () => {
    let calls = 0;
    const cache = new RefreshingCache(async () => {
      calls++;
      if (calls > 1) throw new Error("upstream down");
      return "good";
    }, 0); // always stale, so every read triggers a refresh

    assert.equal(await cache.get(), "good");
    assert.equal(await cache.get(), "good");
    await tick();
    await tick();
    assert.equal(await cache.get(), "good");
  });
});
