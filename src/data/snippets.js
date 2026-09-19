export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'cpp', name: 'C++', ext: '.cpp' },
  { id: 'java', name: 'Java', ext: '.java' },
  { id: 'html', name: 'HTML', ext: '.html' }
];

export const CONTENT_CATEGORIES = [
  { id: 'code', name: 'Full Code', desc: 'Real-world multi-line code snippets' },
  { id: 'keywords', name: 'Keywords & Flow', desc: 'Clean 1-2 line expressions & core keywords' },
  { id: 'words', name: 'Dev Words', desc: 'Top developer vocabulary in camelCase/PascalCase' },
  { id: 'symbols', name: 'Symbols Drill', desc: 'Targeted brackets, operators & symbol mastery' }
];

export const DIFFICULTIES = ['All', 'Easy', 'Intermediate', 'Advanced'];

export const SNIPPETS = {
  javascript: [
    // Easy (Beginner Friendly)
    {
      id: 'js-add-function',
      title: 'Simple Addition Function',
      difficulty: 'Easy',
      code: `function add(a, b) {
  return a + b;
}`
    },
    {
      id: 'js-is-even',
      title: 'Even Number Check',
      difficulty: 'Easy',
      code: `const isEven = (num) => {
  return num % 2 === 0;
};`
    },
    {
      id: 'js-greet',
      title: 'Greeting Generator',
      difficulty: 'Easy',
      code: `function greet(name) {
  return 'Hello, ' + name + '!';
}`
    },
    {
      id: 'js-clamp-utility',
      title: 'Clamp Number Utility',
      difficulty: 'Easy',
      code: `function clamp(val, min, max) {
  if (min > max) {
    throw new Error('min must be <= max');
  }
  return Math.min(Math.max(val, min), max);
}`
    },
    {
      id: 'js-array-chunk',
      title: 'Array Chunking Helper',
      difficulty: 'Easy',
      code: `function chunk(array, size = 1) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}`
    },
    {
      id: 'js-frequency-map',
      title: 'Array Frequency Counter',
      difficulty: 'Easy',
      code: `function countFrequencies(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}`
    },
    {
      id: 'js-deep-clone',
      title: 'Deep Object Clone',
      difficulty: 'Easy',
      code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const copy = {};
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}`
    },
    {
      id: 'js-debounce',
      title: 'Debounce Function Handler',
      difficulty: 'Easy',
      code: `function debounce(fn, ms = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}`
    },
    // Intermediate
    {
      id: 'js-async-fetch-cache',
      title: 'Async Fetch with Cache & TTL',
      difficulty: 'Intermediate',
      code: `async function fetchWithCache(url, ttlMs = 60000) {
  const cacheKey = \`cache:\${url}\`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttlMs) return data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  const data = await response.json();
  sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}`
    },
    {
      id: 'js-throttle',
      title: 'Throttle Rate Limiter',
      difficulty: 'Intermediate',
      code: `function throttle(callback, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      callback.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}`
    },
    {
      id: 'js-event-emitter',
      title: 'Lightweight Event Emitter',
      difficulty: 'Intermediate',
      code: `class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.events.get(event);
    if (handlers) handlers.delete(handler);
  }

  emit(event, ...args) {
    const handlers = this.events.get(event);
    if (handlers) {
      for (const fn of handlers) fn(...args);
    }
  }
}`
    },
    {
      id: 'js-promise-retry',
      title: 'Promise Retry with Exponential Backoff',
      difficulty: 'Intermediate',
      code: `async function retryOperation(fn, maxRetries = 3, delay = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const backoff = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
}`
    },
    // Advanced
    {
      id: 'js-lru-cache',
      title: 'LRU Cache Implementation',
      difficulty: 'Advanced',
      code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, val) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, val);
  }
}`
    },
    {
      id: 'js-reactive-store',
      title: 'Reactive State Store with Subscriptions',
      difficulty: 'Advanced',
      code: `function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (update) => {
      const nextState = typeof update === 'function' ? update(state) : update;
      state = { ...state, ...nextState };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}`
    }
  ],

  python: [
    // Easy (Beginner Friendly)
    {
      id: 'py-abs-function',
      title: 'Absolute Value & Sign Check',
      difficulty: 'Easy',
      code: `def is_positive(x: int) -> bool:
    return x > 0`
    },
    {
      id: 'py-palindrome',
      title: 'Palindrome & Anagram Checker',
      difficulty: 'Easy',
      code: `def is_palindrome(text: str) -> bool:
    cleaned = ''.join(c.lower() for c in text if c.isalnum())
    return cleaned == cleaned[::-1]

def is_anagram(str1: str, str2: str) -> bool:
    from collections import Counter
    return Counter(str1.lower()) == Counter(str2.lower())`
    },
    {
      id: 'py-fibonacci-memo',
      title: 'Memoized Fibonacci Generator',
      difficulty: 'Easy',
      code: `from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
    },
    {
      id: 'py-flatten-list',
      title: 'Nested List Flatten Generator',
      difficulty: 'Easy',
      code: `from typing import Any, Iterator

def flatten(items: list[Any]) -> Iterator[Any]:
    for item in items:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)
        else:
            yield item`
    },
    {
      id: 'py-filter-keys',
      title: 'Dictionary Key Filter Helper',
      difficulty: 'Easy',
      code: `def filter_dict_keys(data: dict, allowed_keys: set) -> dict:
    return {
        key: val for key, val in data.items()
        if key in allowed_keys and val is not None
    }`
    },
    // Intermediate
    {
      id: 'py-timing-decorator',
      title: 'Execution Timer Decorator',
      difficulty: 'Intermediate',
      code: `import time
from functools import wraps
from typing import Callable, Any

def time_tracker(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[{func.__name__}] executed in {elapsed * 1000:.2f}ms")
        return result
    return wrapper`
    },
    {
      id: 'py-context-manager',
      title: 'Database Transaction Context',
      difficulty: 'Intermediate',
      code: `from contextlib import contextmanager

@contextmanager
def db_transaction(connection):
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()
    except Exception as error:
        connection.rollback()
        raise error
    finally:
        cursor.close()`
    },
    {
      id: 'py-chunk-iterable',
      title: 'Batch Iterator Generator',
      difficulty: 'Intermediate',
      code: `from typing import Iterable, Iterator, List, TypeVar

T = TypeVar('T')

def batch_items(iterable: Iterable[T], batch_size: int = 50) -> Iterator[List[T]]:
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch`
    },
    // Advanced
    {
      id: 'py-quicksort-partition',
      title: 'In-Place Three-Way Quicksort',
      difficulty: 'Advanced',
      code: `def quicksort(arr: list[int], low: int = 0, high: int = None) -> None:
    if high is None:
        high = len(arr) - 1
    if low >= high:
        return

    pivot = arr[low]
    lt, gt, i = low, high, low + 1
    while i <= gt:
        if arr[i] < pivot:
            arr[lt], arr[i] = arr[i], arr[lt]
            lt += 1
            i += 1
        elif arr[i] > pivot:
            arr[i], arr[gt] = arr[gt], arr[i]
            gt -= 1
        else:
            i += 1

    quicksort(arr, low, lt - 1)
    quicksort(arr, gt + 1, high)`
    },
    {
      id: 'py-priority-queue',
      title: 'Min-Heap Priority Queue Implementation',
      difficulty: 'Advanced',
      code: `import heapq
from typing import Generic, TypeVar

T = TypeVar('T')

class PriorityQueue(Generic[T]):
    def __init__(self) -> None:
        self._queue = []
        self._index = 0

    def push(self, item: T, priority: float) -> None:
        heapq.heappush(self._queue, (priority, self._index, item))
        self._index += 1

    def pop(self) -> T:
        if not self._queue:
            raise IndexError("pop from empty priority queue")
        return heapq.heappop(self._queue)[-1]`
    },
    {
      id: 'py-async-pool',
      title: 'Asyncio Semaphore Worker Pool',
      difficulty: 'Advanced',
      code: `import asyncio
from typing import Callable, Coroutine, List, Any

async def run_with_concurrency_limit(tasks: List[Callable[[], Coroutine]], limit: int = 5) -> List[Any]:
    semaphore = asyncio.Semaphore(limit)

    async def worker(task_fn: Callable[[], Coroutine]) -> Any:
        async with semaphore:
            return await task_fn()

    return await asyncio.gather(*(worker(t) for t in tasks))`
    }
  ],

  cpp: [
    // Easy (Beginner Friendly)
    {
      id: 'cpp-square',
      title: 'Simple Square Function',
      difficulty: 'Easy',
      code: `int square(int x) {
    return x * x;
}`
    },
    {
      id: 'cpp-is-even',
      title: 'Even Number Predicate',
      difficulty: 'Easy',
      code: `bool isEven(int n) {
    return n % 2 == 0;
}`
    },
    {
      id: 'cpp-clamp',
      title: 'Generic Clamp Function',
      difficulty: 'Easy',
      code: `#include <algorithm>
#include <iostream>

template <typename T>
constexpr const T& clampValue(const T& val, const T& low, const T& high) {
    if (val < low) return low;
    if (high < val) return high;
    return val;
}`
    },
    {
      id: 'cpp-vector-reverse',
      title: 'In-Place Vector Reversal',
      difficulty: 'Easy',
      code: `#include <vector>
#include <utility>

template <typename T>
void reverseVector(std::vector<T>& vec) {
    int i = 0;
    int j = static_cast<int>(vec.size()) - 1;
    while (i < j) {
        std::swap(vec[i++], vec[j--]);
    }
}`
    },
    {
      id: 'cpp-binary-search',
      title: 'Standard Vector Binary Search',
      difficulty: 'Easy',
      code: `#include <vector>
#include <optional>

template <typename T>
std::optional<size_t> binarySearch(const std::vector<T>& vec, const T& target) {
    int left = 0;
    int right = static_cast<int>(vec.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (vec[mid] == target) return mid;
        if (vec[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return std::nullopt;
}`
    },
    // Intermediate
    {
      id: 'cpp-string-split',
      title: 'Fast String View Tokenizer',
      difficulty: 'Intermediate',
      code: `#include <string_view>
#include <vector>

std::vector<std::string_view> split(std::string_view str, char delim) {
    std::vector<std::string_view> tokens;
    size_t start = 0;
    size_t end = str.find(delim);

    while (end != std::string_view::npos) {
        tokens.push_back(str.substr(start, end - start));
        start = end + 1;
        end = str.find(delim, start);
    }
    tokens.push_back(str.substr(start));
    return tokens;
}`
    },
    {
      id: 'cpp-scoped-timer',
      title: 'RAII Performance Profiler Timer',
      difficulty: 'Intermediate',
      code: `#include <chrono>
#include <iostream>
#include <string>

class ScopedTimer {
private:
    std::string name;
    std::chrono::high_resolution_clock::time_point start;
public:
    explicit ScopedTimer(std::string tag)
        : name(std::move(tag)), start(std::chrono::high_resolution_clock::now()) {}

    ~ScopedTimer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto ms = std::chrono::duration<double, std::milli>(end - start).count();
        std::cout << name << " took " << ms << " ms\\n";
    }
};`
    },
    {
      id: 'cpp-smart-factory',
      title: 'Unique Pointer Factory Wrapper',
      difficulty: 'Intermediate',
      code: `#include <memory>
#include <utility>

template <typename T, typename... Args>
std::unique_ptr<T> makeUniqueSafely(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}`
    },
    // Advanced
    {
      id: 'cpp-object-pool',
      title: 'Thread-Safe Memory Object Pool',
      difficulty: 'Advanced',
      code: `#include <memory>
#include <vector>
#include <mutex>

template <typename T>
class ObjectPool {
private:
    std::vector<std::unique_ptr<T>> pool;
    mutable std::mutex mtx;
public:
    void returnObject(std::unique_ptr<T> item) {
        std::lock_guard<std::mutex> lock(mtx);
        pool.push_back(std::move(item));
    }

    std::unique_ptr<T> acquire() {
        std::lock_guard<std::mutex> lock(mtx);
        if (pool.empty()) return std::make_unique<T>();
        auto item = std::move(pool.back());
        pool.pop_back();
        return item;
    }
};`
    },
    {
      id: 'cpp-ring-buffer',
      title: 'Fixed Circular Ring Buffer',
      difficulty: 'Advanced',
      code: `#include <array>
#include <cstddef>
#include <optional>

template <typename T, size_t Cap>
class CircularBuffer {
private:
    std::array<T, Cap> buffer;
    size_t head = 0;
    size_t tail = 0;
    bool isFull = false;
public:
    void push(T item) {
        buffer[head] = item;
        if (isFull) tail = (tail + 1) % Cap;
        head = (head + 1) % Cap;
        isFull = (head == tail);
    }

    std::optional<T> pop() {
        if (!isFull && head == tail) return std::nullopt;
        T val = buffer[tail];
        isFull = false;
        tail = (tail + 1) % Cap;
        return val;
    }
};`
    }
  ],

  java: [
    // Easy (Beginner Friendly)
    {
      id: 'java-multiply',
      title: 'Multiply Integers',
      difficulty: 'Easy',
      code: `public int multiply(int a, int b) {
    return a * b;
}`
    },
    {
      id: 'java-is-empty',
      title: 'String Empty Check',
      difficulty: 'Easy',
      code: `public boolean isEmpty(String str) {
    return str != null && str.isEmpty();
}`
    },
    {
      id: 'java-record-dto',
      title: 'Immutable User Record & Validator',
      difficulty: 'Easy',
      code: `public record UserProfile(String id, String username, String email) {
    public UserProfile {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email address");
        }
    }
}`
    },
    {
      id: 'java-optional-helper',
      title: 'Safe Null Handling with Optional',
      difficulty: 'Easy',
      code: `import java.util.Optional;

public class ConfigLoader {
    public static String getProperty(String key, String fallback) {
        return Optional.ofNullable(System.getenv(key))
            .filter(val -> !val.isBlank())
            .orElse(fallback);
    }
}`
    },
    {
      id: 'java-list-dedup',
      title: 'Distinct Ordered List Collector',
      difficulty: 'Easy',
      code: `import java.util.List;
import java.util.LinkedHashSet;

public class ListUtils {
    public static <T> List<T> removeDuplicates(List<T> items) {
        if (items == null) return List.of();
        return List.copyOf(new LinkedHashSet<>(items));
    }
}`
    },
    // Intermediate
    {
      id: 'java-stream-grouping',
      title: 'Stream Grouping and Aggregation',
      difficulty: 'Intermediate',
      code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SalesAnalytics {
    public static Map<String, Double> totalSalesByRegion(List<Transaction> records) {
        return records.stream()
            .filter(Transaction::isCompleted)
            .collect(Collectors.groupingBy(
                Transaction::region,
                Collectors.summingDouble(Transaction::amount)
            ));
    }
}`
    },
    {
      id: 'java-singleton',
      title: 'Double-Checked Locking Singleton',
      difficulty: 'Intermediate',
      code: `public final class AppConfig {
    private static volatile AppConfig instance;
    private final Map<String, String> properties;

    private AppConfig() {
        this.properties = new ConcurrentHashMap<>();
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}`
    },
    {
      id: 'java-lru-cache-map',
      title: 'LinkedHashMap LRU Eviction Cache',
      difficulty: 'Intermediate',
      code: `import java.util.LinkedHashMap;
import java.util.Map;

public class BoundedCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxEntries;

    public BoundedCache(int maxEntries) {
        super(maxEntries, 0.75f, true);
        this.maxEntries = maxEntries;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > maxEntries;
    }
}`
    },
    // Advanced
    {
      id: 'java-dijkstra',
      title: 'Dijkstra Algorithm with PriorityQueue',
      difficulty: 'Advanced',
      code: `public Map<Integer, Integer> findShortestPaths(Graph graph, int start) {
    Map<Integer, Integer> dist = new HashMap<>();
    PriorityQueue<NodeDistance> pq = new PriorityQueue<>(
        Comparator.comparingInt(NodeDistance::distance)
    );
    dist.put(start, 0);
    pq.offer(new NodeDistance(start, 0));

    while (!pq.isEmpty()) {
        NodeDistance current = pq.poll();
        int u = current.node();
        for (Edge edge : graph.getEdges(u)) {
            int newDist = dist.get(u) + edge.weight();
            if (newDist < dist.getOrDefault(edge.target(), Integer.MAX_VALUE)) {
                dist.put(edge.target(), newDist);
                pq.offer(new NodeDistance(edge.target(), newDist));
            }
        }
    }
    return dist;
}`
    },
    {
      id: 'java-async-pipeline',
      title: 'CompletableFuture Async Pipeline',
      difficulty: 'Advanced',
      code: `import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

public class OrderService {
    public CompletableFuture<Receipt> processOrderAsync(Order order, Executor pool) {
        return CompletableFuture.supplyAsync(() -> validateOrder(order), pool)
            .thenCompose(validOrder -> chargePaymentAsync(validOrder, pool))
            .thenApply(payment -> generateReceipt(order, payment))
            .exceptionally(ex -> fallbackReceipt(order, ex));
    }
}`
    }
  ],

  html: [
    // Easy (Beginner Friendly)
    {
      id: 'html-button',
      title: 'Simple Action Button',
      difficulty: 'Easy',
      code: `<button class="btn btn-primary">
  <span>Click Here</span>
</button>`
    },
    {
      id: 'html-badge',
      title: 'Status Badge',
      difficulty: 'Easy',
      code: `<span class="badge badge-success">
  Active
</span>`
    },
    {
      id: 'html-search-bar',
      title: 'Accessible Search Bar Component',
      difficulty: 'Easy',
      code: `<form class="search-box" role="search" aria-label="Site Search">
  <label for="search-input" class="sr-only">Search syntax</label>
  <input
    id="search-input"
    type="search"
    name="q"
    placeholder="Search functions, classes..."
    autocomplete="off"
    required
  />
  <button type="submit" aria-label="Submit search">
    <span>Search</span>
  </button>
</form>`
    },
    {
      id: 'html-badge-card',
      title: 'Stat Card with Status Indicator',
      difficulty: 'Easy',
      code: `<article class="metric-card">
  <header class="metric-header">
    <h3 class="metric-title">Live Speed</h3>
    <span class="status-dot is-active" aria-hidden="true"></span>
  </header>
  <div class="metric-value font-mono">112 <span class="unit">wpm</span></div>
  <p class="metric-desc">Top 5% typing percentile</p>
</article>`
    },
    // Intermediate
    {
      id: 'html-nav-toolbar',
      title: 'Responsive Accessible Navigation Bar',
      difficulty: 'Intermediate',
      code: `<header class="site-header" role="banner">
  <nav class="nav-wrapper" aria-label="Main Navigation">
    <a href="/" class="brand-link">
      <span class="brand-badge">&lt;/&gt;</span>
      <strong class="brand-name">DevType</strong>
    </a>
    <ul class="nav-menu" role="list">
      <li><a href="#test" class="nav-item is-active">Typing Test</a></li>
      <li><a href="#leaderboard" class="nav-item">Leaderboard</a></li>
      <li><a href="#settings" class="nav-item">Settings</a></li>
    </ul>
  </nav>
</header>`
    },
    {
      id: 'html-product-card',
      title: 'Semantic Modern Product Card',
      difficulty: 'Intermediate',
      code: `<article class="product-item" data-id="kb-65-orange">
  <figure class="product-media">
    <img src="/assets/orange-keyboard.webp" alt="65% Mechanical Keyboard" loading="lazy" />
    <span class="badge">Tactile 65%</span>
  </figure>
  <div class="product-info">
    <h4 class="product-title">Solar Amber Mechanical Deck</h4>
    <p class="product-spec">PBT Keycaps, Factory Lubed Switches, Type-C</p>
    <div class="product-actions">
      <span class="price font-mono">$129.00</span>
      <button type="button" class="btn btn-accent">Order Now</button>
    </div>
  </div>
</article>`
    },
    {
      id: 'html-pricing-tier',
      title: 'Feature Pricing Comparison Card',
      difficulty: 'Intermediate',
      code: `<section class="pricing-plan featured">
  <div class="plan-header">
    <span class="plan-pill">Pro Developer</span>
    <h3 class="plan-price font-mono">$12<span class="period">/mo</span></h3>
  </div>
  <ul class="plan-features">
    <li>Unlimited Syntax Typing Drills</li>
    <li>Custom Mechanical Audio Packs</li>
    <li>Detailed Speed & WPM Analytics</li>
  </ul>
  <button type="button" class="btn btn-primary full-width">Upgrade Plan</button>
</section>`
    },
    // Advanced
    {
      id: 'html-modal-dialog',
      title: 'Accessible Native Dialog Modal',
      difficulty: 'Advanced',
      code: `<dialog id="pref-modal" class="modal-surface" aria-labelledby="dialog-heading">
  <form method="dialog" class="dialog-content">
    <header class="dialog-header">
      <h2 id="dialog-heading">Editor Settings</h2>
      <button type="submit" value="cancel" class="btn-close" aria-label="Close dialog">✕</button>
    </header>
    <section class="dialog-body">
      <fieldset class="field-group">
        <legend>Sound Profile</legend>
        <label><input type="radio" name="sound" value="creamy" checked /> NovelKeys Cream</label>
        <label><input type="radio" name="sound" value="clacky" /> Alu Plate Clack</label>
      </fieldset>
    </section>
    <footer class="dialog-footer">
      <button type="submit" value="save" class="btn btn-primary">Save Changes</button>
    </footer>
  </form>
</dialog>`
    }
  ]
};

export const KEYWORDS_SNIPPETS = {
  javascript: [
    {
      id: 'kw-js-1',
      title: 'Async Await Fetch',
      difficulty: 'Easy',
      code: `const data = await fetch(url);`
    },
    {
      id: 'kw-js-2',
      title: 'Array Map & Arrow',
      difficulty: 'Easy',
      code: `const names = users.map(user => user.name);`
    },
    {
      id: 'kw-js-3',
      title: 'Conditional Return',
      difficulty: 'Easy',
      code: `if (isValid && hasToken) return true;`
    },
    {
      id: 'kw-js-4',
      title: 'Destructuring & Spread',
      difficulty: 'Intermediate',
      code: `const { id, ...rest } = payload;`
    },
    {
      id: 'kw-js-5',
      title: 'Try Catch Exception',
      difficulty: 'Intermediate',
      code: `try { await run(); } catch (err) { log(err); }`
    },
    {
      id: 'kw-js-6',
      title: 'For Of Loop Traversal',
      difficulty: 'Intermediate',
      code: `for (const item of items) { process(item); }`
    },
    {
      id: 'kw-js-7',
      title: 'Nullish Coalescing Operator',
      difficulty: 'Easy',
      code: `const port = process.env.PORT ?? 3000;`
    },
    {
      id: 'kw-js-8',
      title: 'Optional Chaining Access',
      difficulty: 'Easy',
      code: `const email = user?.profile?.contact?.email;`
    }
  ],
  python: [
    {
      id: 'kw-py-1',
      title: 'List Comprehension',
      difficulty: 'Easy',
      code: `doubled = [x * 2 for x in items if x > 0]`
    },
    {
      id: 'kw-py-2',
      title: 'With Context Manager',
      difficulty: 'Easy',
      code: `with open("config.json") as file: data = file.read()`
    },
    {
      id: 'kw-py-3',
      title: 'Def with Type Hints',
      difficulty: 'Easy',
      code: `def get_user(user_id: int) -> dict: return store[user_id]`
    },
    {
      id: 'kw-py-4',
      title: 'Dictionary Comprehension',
      difficulty: 'Intermediate',
      code: `lookup = {item.id: item.name for item in items}`
    },
    {
      id: 'kw-py-5',
      title: 'Try Except Finally Block',
      difficulty: 'Intermediate',
      code: `try: save(data) except Exception as err: log(err)`
    }
  ],
  cpp: [
    {
      id: 'kw-cpp-1',
      title: 'Range-Based For Loop',
      difficulty: 'Easy',
      code: `for (const auto& item : items) std::cout << item;`
    },
    {
      id: 'kw-cpp-2',
      title: 'Vector Initialization',
      difficulty: 'Easy',
      code: `std::vector<int> numbers = {1, 2, 3, 4, 5};`
    },
    {
      id: 'kw-cpp-3',
      title: 'Constexpr Auto Max',
      difficulty: 'Easy',
      code: `constexpr auto limit = 100; if (val > limit) return;`
    },
    {
      id: 'kw-cpp-4',
      title: 'Unique Pointer Make',
      difficulty: 'Intermediate',
      code: `auto node = std::make_unique<Node>(val);`
    }
  ],
  java: [
    {
      id: 'kw-java-1',
      title: 'Stream Filter & Collect',
      difficulty: 'Easy',
      code: `List<String> list = items.stream().filter(x -> x.length() > 0).toList();`
    },
    {
      id: 'kw-java-2',
      title: 'Optional OrElse',
      difficulty: 'Easy',
      code: `String value = Optional.ofNullable(input).orElse("default");`
    },
    {
      id: 'kw-java-3',
      title: 'Record Declaration',
      difficulty: 'Easy',
      code: `public record Point(int x, int y) {}`
    },
    {
      id: 'kw-java-4',
      title: 'Enhanced For Loop',
      difficulty: 'Intermediate',
      code: `for (String item : items) { System.out.println(item); }`
    }
  ],
  html: [
    {
      id: 'kw-html-1',
      title: 'Semantic Navigation Item',
      difficulty: 'Easy',
      code: `<a href="/home" class="nav-link active">Home</a>`
    },
    {
      id: 'kw-html-2',
      title: 'Accessible Search Input',
      difficulty: 'Easy',
      code: `<input type="text" placeholder="Search..." required />`
    },
    {
      id: 'kw-html-3',
      title: 'Responsive Image Element',
      difficulty: 'Easy',
      code: `<img src="hero.jpg" alt="Hero banner" loading="lazy" />`
    }
  ]
};

export const DEV_WORDS_SNIPPETS = [
  {
    id: 'dw-frontend',
    title: 'Frontend & React Vocabulary',
    difficulty: 'Easy',
    code: `component useState useEffect render state dispatch payload reducer interface props handler onClick container stylesheet provider hook context router middleware virtual DOM hydration suspense callback memoization fragment bundle lifecycle`
  },
  {
    id: 'dw-backend',
    title: 'Backend & System Architecture',
    difficulty: 'Easy',
    code: `controller repository service database postgres schema migration endpoint gateway authentication payload session cookie token bearer serialization microservice pipeline docker kubernetes telemetry transaction queue worker`
  },
  {
    id: 'dw-datastructures',
    title: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    code: `binarySearch quicksort linkedList priorityQueue hashmap iterator traverse recursion depthFirst breadthFirst matrix dynamicProgramming memoize backtrack adjacencyList stack heap buffer stream socket concurrency`
  },
  {
    id: 'dw-patterns',
    title: 'Design Patterns & Clean Code',
    difficulty: 'Intermediate',
    code: `singleton factory observer strategy adapter decorator prototype repository dependencyInjection immutability pureFunction sideEffect idempotency asynchronous synchronous exception handler pipeline throttle debounce validate`
  },
  {
    id: 'dw-naming-cases',
    title: 'Variable Naming Conventions',
    difficulty: 'Advanced',
    code: `getUserById isAuthenticated isFetchingData handleSubmit totalCount activeIndex maxRetries currentTimestamp configOptions parseJsonString nextProps prevState isDarkModeEnabled toggleSidebar`
  }
];

export const SYMBOLS_SNIPPETS = [
  {
    id: 'sym-brackets',
    title: 'Bracket Pair Fundamentals',
    difficulty: 'Easy',
    code: `( ) [ ] { } ( ) [ ] { } ( ) [ ] { } [ ] { } ( ) { } ( ) [ ]`
  },
  {
    id: 'sym-arrows-logic',
    title: 'Arrow Functions & Logical Operators',
    difficulty: 'Easy',
    code: `() => { return true; } && || ! == === !== != <= >= += -=`
  },
  {
    id: 'sym-ternary-destructure',
    title: 'Ternary & Object Destructuring',
    difficulty: 'Intermediate',
    code: `const { id, name } = item ? { ...item } : { id: 0, name: '' };`
  },
  {
    id: 'sym-template-generics',
    title: 'Generics & Angle Brackets',
    difficulty: 'Intermediate',
    code: `Map<string, List<number>> = new HashMap<>(); vector<pair<int, int>>`
  },
  {
    id: 'sym-full-gauntlet',
    title: 'Full Developer Symbol Gauntlet',
    difficulty: 'Advanced',
    code: `fn = (x, y) => [x ?? 0, y || 1]; (a >= b) ? { ok: !err } : null; #include <iostream>`
  }
];

/**
 * Get a random index from a list, avoiding the currentIndex if multiple items exist
 */
export function getRandomSnippetIndex(list, currentIndex = -1) {
  if (!list || list.length <= 1) return 0;
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * list.length);
  } while (nextIdx === currentIndex && list.length > 1);
  return nextIdx;
}
