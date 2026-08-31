// Syntax Tokenizer for Code Highlighting
const KEYWORDS = new Set([
  'function', 'async', 'await', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
  'class', 'constructor', 'new', 'this', 'super', 'extends', 'import', 'export', 'from', 'default',
  'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of',
  'def', 'elif', 'with', 'as', 'lambda', 'yield', 'pass', 'raise', 'is', 'not', 'and', 'or', 'None', 'True', 'False',
  'public', 'private', 'protected', 'static', 'final', 'volatile', 'synchronized', 'interface', 'package', 'record',
  'template', 'typename', 'using', 'namespace', 'constexpr', 'noexcept', 'auto', 'struct', 'enum',
  'null', 'undefined', 'true', 'false', 'self', 'std'
]);

const TYPES = new Set([
  'int', 'float', 'double', 'char', 'bool', 'boolean', 'void', 'size_t', 'long', 'short', 'byte',
  'string', 'String', 'List', 'Map', 'Set', 'HashMap', 'TreeMap', 'ConcurrentHashMap', 'PriorityQueue',
  'Vector', 'vector', 'unique_ptr', 'shared_ptr', 'optional', 'nullopt', 'pair', 'tuple',
  'string_view', 'mutex', 'lock_guard', 'chrono', 'Iterator', 'Callable', 'Any', 'Generic', 'TypeVar',
  'Promise', 'Array', 'Object', 'Error', 'RegExp', 'Date', 'Proxy',
  'UserProfile', 'ConfigLoader', 'SalesAnalytics', 'Transaction', 'AppConfig', 'Graph', 'NodeDistance',
  'Edge', 'ScopedTimer', 'ObjectPool', 'EventEmitter', 'LRUCache'
]);

export function tokenizeCode(code, language = 'javascript') {
  const characters = [];
  const len = code.length;
  let i = 0;

  while (i < len) {
    const char = code[i];

    // Python comments
    if (language === 'python' && char === '#') {
      let commentEnd = code.indexOf('\n', i);
      if (commentEnd === -1) commentEnd = len;
      for (let j = i; j < commentEnd; j++) {
        characters.push({ char: code[j], type: 'comment', index: j });
      }
      i = commentEnd;
      continue;
    }

    // C-style line comments
    if ((language === 'javascript' || language === 'cpp' || language === 'java') && char === '/' && code[i + 1] === '/') {
      let commentEnd = code.indexOf('\n', i);
      if (commentEnd === -1) commentEnd = len;
      for (let j = i; j < commentEnd; j++) {
        characters.push({ char: code[j], type: 'comment', index: j });
      }
      i = commentEnd;
      continue;
    }

    // C++ preprocessor (#include)
    if (language === 'cpp' && char === '#' && (i === 0 || code[i - 1] === '\n')) {
      let lineEnd = code.indexOf('\n', i);
      if (lineEnd === -1) lineEnd = len;
      for (let j = i; j < lineEnd; j++) {
        characters.push({ char: code[j], type: 'keyword', index: j });
      }
      i = lineEnd;
      continue;
    }

    // HTML comments
    if (language === 'html' && code.substr(i, 4) === '<!--') {
      let commentEnd = code.indexOf('-->', i);
      if (commentEnd === -1) commentEnd = len;
      else commentEnd += 3;
      for (let j = i; j < commentEnd; j++) {
        characters.push({ char: code[j], type: 'comment', index: j });
      }
      i = commentEnd;
      continue;
    }

    // Strings
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      characters.push({ char, type: 'string', index: i });
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < len) {
          characters.push({ char: code[i], type: 'string', index: i });
          i++;
        }
        if (i < len) {
          characters.push({ char: code[i], type: 'string', index: i });
          i++;
        }
      }
      if (i < len && code[i] === quote) {
        characters.push({ char: code[i], type: 'string', index: i });
        i++;
      }
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char) && (i === 0 || /[^a-zA-Z0-9_]/.test(code[i - 1]))) {
      while (i < len && /[0-9.a-fA-FxX]/.test(code[i])) {
        characters.push({ char: code[i], type: 'number', index: i });
        i++;
      }
      continue;
    }

    // HTML Tags
    if (language === 'html' && char === '<') {
      characters.push({ char, type: 'tag', index: i });
      i++;
      let inTag = true;
      while (i < len && inTag) {
        if (code[i] === '>') {
          characters.push({ char: code[i], type: 'tag', index: i });
          i++;
          inTag = false;
          break;
        } else if (code[i] === '"' || code[i] === "'") {
          const q = code[i];
          characters.push({ char: q, type: 'string', index: i });
          i++;
          while (i < len && code[i] !== q) {
            characters.push({ char: code[i], type: 'string', index: i });
            i++;
          }
          if (i < len) {
            characters.push({ char: code[i], type: 'string', index: i });
            i++;
          }
        } else if (/[a-zA-Z0-9_-]/.test(code[i])) {
          characters.push({ char: code[i], type: 'attr', index: i });
          i++;
        } else {
          characters.push({ char: code[i], type: 'punctuation', index: i });
          i++;
        }
      }
      continue;
    }

    // Words (identifiers, keywords, types)
    if (/[a-zA-Z_$]/.test(char)) {
      let word = '';
      const wordStart = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) {
        word += code[i];
        i++;
      }

      let type = 'identifier';
      if (KEYWORDS.has(word)) {
        type = 'keyword';
      } else if (TYPES.has(word) || /^[A-Z][a-zA-Z0-9]*$/.test(word)) {
        type = 'type';
      } else if (i < len && code[i] === '(') {
        type = 'function';
      }

      for (let j = 0; j < word.length; j++) {
        characters.push({ char: word[j], type, index: wordStart + j });
      }
      continue;
    }

    // Operators and punctuation
    let tokenType = 'plain';
    if (/[\{\}\(\)\[\]]/.test(char)) tokenType = 'bracket';
    else if (/[\;\:\,\.]/.test(char)) tokenType = 'punctuation';
    else if (/[\+\-\*\/\=\<\>\!\&\|\%\^\~\?\@\:]/.test(char)) tokenType = 'operator';
    else if (/\s/.test(char)) tokenType = 'whitespace';

    characters.push({ char, type: tokenType, index: i });
    i++;
  }

  return characters;
}
