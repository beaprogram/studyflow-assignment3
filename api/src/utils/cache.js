// Minimal in-memory TTL cache for read-heavy endpoints.
// Keyed by a string; each entry expires after ttlMs. Because it lives in the
// Node process memory, reads that hit the cache skip MongoDB entirely.

const store = new Map(); // key -> { value, expiresAt }

function get(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    store.delete(key); // lazily evict expired entries
    return undefined;
  }
  return hit.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Invalidate every entry whose key starts with the given prefix. Used after a
// write so a user's cached list can never go stale.
function delByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

function clear() {
  store.clear();
}

module.exports = { get, set, delByPrefix, clear };
