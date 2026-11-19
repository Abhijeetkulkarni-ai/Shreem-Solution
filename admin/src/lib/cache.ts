
const CACHE_PREFIX = "shreem_cache_v1:";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();
const requestVersions = new Map<string, number>();

const getStorageKey = (key: string) => `${CACHE_PREFIX}${key}`;

function getVersion(key: string) {
  return requestVersions.get(key) ?? 0;
}

function bumpVersion(key: string) {
  requestVersions.set(key, getVersion(key) + 1);
}

// CACHE FETCH
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000
): Promise<T> {
  const storageKey = getStorageKey(key);
  const now = Date.now();

  const memoryEntry = memoryCache.get(storageKey) as
    | CacheEntry<T>
    | undefined;

  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.data;
  }

  if (memoryEntry) {
    memoryCache.delete(storageKey);
  }

  try {
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const entry = JSON.parse(stored) as CacheEntry<T>;

      if (entry.expiresAt > now) {
        memoryCache.set(storageKey, entry);
        return entry.data;
      }

      localStorage.removeItem(storageKey);
    }
  } catch {
    // Continue without localStorage.
  }

  const pending = pendingRequests.get(storageKey) as
    | Promise<T>
    | undefined;

  if (pending) return pending;

  const version = getVersion(storageKey);

  let request: Promise<T>;

  request = (async () => {
    try {
      const data = await fetcher();

      if (getVersion(storageKey) === version) {
        const entry: CacheEntry<T> = {
          data,
          expiresAt: Date.now() + ttl,
        };

        memoryCache.set(storageKey, entry);

        try {
          localStorage.setItem(storageKey, JSON.stringify(entry));
        } catch {
          // Memory cache still works.
        }
      }

      return data;
    } finally {
      if (pendingRequests.get(storageKey) === request) {
        pendingRequests.delete(storageKey);
      }
    }
  })();

  pendingRequests.set(storageKey, request);

  return request;
}

// INVALIDATE ONE CACHE
export function invalidateCache(key: string) {
  const storageKey = getStorageKey(key);

  bumpVersion(storageKey);
  memoryCache.delete(storageKey);

  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors.
  }
}

// INVALIDATE CACHE GROUP
export function invalidateCacheGroup(group: string) {
  const storagePrefix = getStorageKey(group);

  const keys = new Set<string>([
    ...memoryCache.keys(),
    ...pendingRequests.keys(),
    ...requestVersions.keys(),
  ]);

  for (const key of keys) {
    if (key.startsWith(storagePrefix)) {
      bumpVersion(key);
      memoryCache.delete(key);
    }
  }

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key?.startsWith(storagePrefix)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors.
  }
}

// CLEAR ALL SHREEM CACHE
export function clearCache() {
  const keys = new Set<string>([
    ...memoryCache.keys(),
    ...pendingRequests.keys(),
    ...requestVersions.keys(),
  ]);

  for (const key of keys) {
    bumpVersion(key);
  }

  memoryCache.clear();

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors.
  }
}

// STANDARD CACHE KEYS
export const CACHE_KEYS = {
  products: "products",
  categories: "categories",
  blogs: "blogs",
  productDetails: "product-details:",
  blogDetails: "blog-details:",
  blogCategories: "blog-categories",
};
