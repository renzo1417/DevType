export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'cpp', name: 'C++', ext: '.cpp' },
  { id: 'java', name: 'Java', ext: '.java' },
  { id: 'html', name: 'HTML', ext: '.html' }
];


export const SNIPPETS = {
  javascript: [
    {
      id: 'js-async-fetch',
      title: 'Async Data Fetcher & Cache',
      difficulty: 'Intermediate',
      code: `async function fetchUserData(userId) {
  const cacheKey = \`user:\${userId}\`;
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) {
    throw new Error(\`Failed to fetch user \${userId}\`);
  }
  const data = await response.json();
  await cache.set(cacheKey, JSON.stringify(data), 3600);
  return data;
}`
    },
    {
      id: 'js-debounce-hook',
      title: 'Debounce Function Utility',
      difficulty: 'Beginner',
      code: `function debounce(func, delay = 300) {
  let timeoutId = null;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}`
    },
    {
      id: 'js-binary-search-tree',
      title: 'Binary Search Tree Insert',
      difficulty: 'Advanced',
      code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insertNode(root, value) {
  if (!root) return new TreeNode(value);
  if (value < root.value) {
    root.left = insertNode(root.left, value);
  } else if (value > root.value) {
    root.right = insertNode(root.right, value);
  }
  return root;
}`
    },
    {
      id: 'js-event-emitter',
      title: 'Custom Event Emitter Pattern',
      difficulty: 'Intermediate',
      code: `class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
    return () => this.off(event, listener);
  }

  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(fn => fn(...args));
    }
  }
}`
    }
  ],

  python: [
    {
      id: 'py-quicksort',
      title: 'Recursive Quicksort with Partition',
      difficulty: 'Intermediate',
      code: `def quicksort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`
    },
    {
      id: 'py-decorator',
      title: 'Timing Decorator with Args',
      difficulty: 'Beginner',
      code: `import time
from functools import wraps

def timing_logger(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"{func.__name__} took {duration:.4f}s")
        return result
    return wrapper`
    },
    {
      id: 'py-lru-cache',
      title: 'Doubly Linked LRU Cache Node',
      difficulty: 'Advanced',
      code: `class LRUNode:
    def __init__(self, key: int, val: int):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head = LRUNode(0, 0)
        self.tail = LRUNode(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head`
    },
    {
      id: 'py-context-manager',
      title: 'Database Connection Context Manager',
      difficulty: 'Intermediate',
      code: `class DatabaseSession:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.conn = None

    def __enter__(self):
        self.conn = connect_pool(self.dsn)
        return self.conn.cursor()

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.conn.close()`
    }
  ],

  cpp: [
    {
      id: 'cpp-lru',
      title: 'Thread-Safe Shared Pointer Pool',
      difficulty: 'Advanced',
      code: `#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>

template <typename T>
class ObjectPool {
private:
    std::vector<std::unique_ptr<T>> pool;
public:
    void add(std::unique_ptr<T> item) {
        pool.push_back(std::move(item));
    }
    size_t size() const noexcept {
        return pool.size();
    }
};`
    },
    {
      id: 'cpp-binary-search',
      title: 'Generic Binary Search Iterator',
      difficulty: 'Beginner',
      code: `#include <vector>
#include <optional>

template <typename T>
std::optional<int> binarySearch(const std::vector<T>& vec, const T& target) {
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
    {
      id: 'cpp-matrix-transform',
      title: '2D Vector Matrix Multiplication',
      difficulty: 'Intermediate',
      code: `std::vector<std::vector<double>> multiply(
    const std::vector<std::vector<double>>& A,
    const std::vector<std::vector<double>>& B) {
    int rows = A.size();
    int cols = B[0].size();
    int inner = B.size();
    std::vector<std::vector<double>> C(rows, std::vector<double>(cols, 0.0));

    for (int i = 0; i < rows; ++i) {
        for (int k = 0; k < inner; ++k) {
            for (int j = 0; j < cols; ++j) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return C;
}`
    }
  ],

  java: [
    {
      id: 'java-stream-pipeline',
      title: 'Stream Filter and Map Aggregation',
      difficulty: 'Beginner',
      code: `public class OrderAnalytics {
    public static Map<String, Double> summarizeByCategory(List<Order> orders) {
        return orders.stream()
            .filter(Order::isCompleted)
            .collect(Collectors.groupingBy(
                Order::getCategory,
                Collectors.summingDouble(Order::getTotalAmount)
            ));
    }
}`
    },
    {
      id: 'java-singleton-pattern',
      title: 'Thread-Safe Double-Checked Locking',
      difficulty: 'Intermediate',
      code: `public final class ConfigurationManager {
    private static volatile ConfigurationManager instance;
    private final Map<String, String> settings;

    private ConfigurationManager() {
        this.settings = new ConcurrentHashMap<>();
    }

    public static ConfigurationManager getInstance() {
        if (instance == null) {
            synchronized (ConfigurationManager.class) {
                if (instance == null) {
                    instance = new ConfigurationManager();
                }
            }
        }
        return instance;
    }
}`
    },
    {
      id: 'java-priority-queue',
      title: 'Dijkstra Shortest Path with PriorityQueue',
      difficulty: 'Advanced',
      code: `public Map<Integer, Integer> findShortestPaths(Graph graph, int startNode) {
    Map<Integer, Integer> distances = new HashMap<>();
    PriorityQueue<NodeDistance> pq = new PriorityQueue<>(
        Comparator.comparingInt(NodeDistance::getDistance)
    );
    distances.put(startNode, 0);
    pq.offer(new NodeDistance(startNode, 0));

    while (!pq.isEmpty()) {
        NodeDistance current = pq.poll();
        int u = current.getNode();
        for (Edge edge : graph.getEdges(u)) {
            int newDist = distances.get(u) + edge.weight;
            if (newDist < distances.getOrDefault(edge.target, Integer.MAX_VALUE)) {
                distances.put(edge.target, newDist);
                pq.offer(new NodeDistance(edge.target, newDist));
            }
        }
    }
    return distances;
}`
    }
  ],

  html: [
    {
      id: 'html-semantic-card',
      title: 'Semantic Modern Product Card',
      difficulty: 'Beginner',
      code: `<article class="product-card" data-category="developer-gear">
  <figure class="card-media">
    <img src="/assets/mechanical-keyboard.webp" alt="Tactile Keyboard" loading="lazy" />
    <span class="badge badge-accent">Featured</span>
  </figure>
  <div class="card-content">
    <h3 class="card-title">Custom 65% Tactile Deck</h3>
    <p class="card-desc">Factory-lubed switches with aluminum case and PBT keycaps.</p>
    <div class="card-footer">
      <span class="price">$149.00</span>
      <button type="button" class="btn btn-primary">Add to Cart</button>
    </div>
  </div>
</article>`
    },
    {
      id: 'html-nav-header',
      title: 'Accessible Navbar with SVG Icons',
      difficulty: 'Intermediate',
      code: `<header class="app-header" role="banner">
  <nav class="nav-container" aria-label="Main Navigation">
    <a href="/" class="brand-logo" aria-label="DevType Home">
      <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span class="logo-text">DevType</span>
    </a>
    <ul class="nav-links" role="list">
      <li><a href="#typing" class="active">Speed Test</a></li>
      <li><a href="#leaderboard">Leaderboard</a></li>
      <li><a href="#stats">Analytics</a></li>
    </ul>
  </nav>
</header>`
    },
    {
      id: 'html-form-dialog',
      title: 'Accessible Modal Dialog with Form',
      difficulty: 'Advanced',
      code: `<dialog id="settings-modal" class="modal-backdrop" aria-labelledby="modal-title">
  <form method="dialog" class="modal-form">
    <header class="modal-header">
      <h2 id="modal-title">Custom Preferences</h2>
      <button type="submit" value="close" class="close-btn" aria-label="Close">✕</button>
    </header>
    <section class="modal-body">
      <label for="theme-picker" class="field-label">Color Theme</label>
      <select id="theme-picker" name="theme" class="select-input">
        <option value="emerald" selected>Emerald Green</option>
        <option value="azure">Electric Azure</option>
        <option value="violet">Cyber Violet</option>
      </select>
    </section>
  </form>
</dialog>`
    }
  ]
};
