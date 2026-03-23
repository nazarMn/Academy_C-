/* js/editor.js — Monaco Editor Manager */

const EditorManager = (() => {
  const editors = {};
  let monacoReady = false;
  let onReadyCallbacks = [];

  // Базова конфігурація для C++ редактора
  const DEFAULT_OPTIONS = {
    language: 'cpp',
    theme: document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'vs-dark' : 'vs',
    fontSize: 14,
    fontFamily: "'Fira Code', 'Consolas', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: 'off',
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    suggestOnTriggerCharacters: true,
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    contextmenu: true,
    overviewRulerBorder: false,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  };

  /**
   * Ініціалізує Monaco Editor (викликається після завантаження AMD loader)
   */
  function init() {
    if (typeof require === 'undefined' || typeof require.config !== 'function') {
      console.warn('[EditorManager] Monaco AMD loader not available yet.');
      return;
    }

    require.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
      }
    });

    require(['vs/editor/editor.main'], () => {
      monacoReady = true;

      // Визначаємо власну тему для темного режиму
      monaco.editor.defineTheme('cpp-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'C586C0' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'delimiter', foreground: 'D4D4D4' },
        ],
        colors: {
          'editor.background': '#12142a',
          'editor.foreground': '#e0e8ff',
          'editor.lineHighlightBackground': '#1a1c3520',
          'editorCursor.foreground': '#6366f1',
          'editor.selectionBackground': '#6366f140',
          'editorLineNumber.foreground': '#5a6080',
          'editorLineNumber.activeForeground': '#6366f1',
          'editorIndentGuide.background': '#1a1c35',
          'editorIndentGuide.activeBackground': '#6366f140',
        },
      });

      monaco.editor.defineTheme('cpp-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '008000', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'AF00DB' },
          { token: 'string', foreground: 'A31515' },
          { token: 'number', foreground: '098658' },
          { token: 'type', foreground: '267F99' },
        ],
        colors: {
          'editor.background': '#f8f9ff',
          'editor.foreground': '#0f1020',
          'editorCursor.foreground': '#6366f1',
          'editor.selectionBackground': '#6366f140',
          'editorLineNumber.foreground': '#8890b0',
          'editorLineNumber.activeForeground': '#6366f1',
        },
      });

      // Виконуємо callbacks, які чекали на Monaco
      onReadyCallbacks.forEach(cb => cb());
      onReadyCallbacks = [];
    });
  }

  /**
   * Створюємо Monaco Editor у вказаному контейнері
   * @param {string} containerId — ID DOM-елемента
   * @param {string} initialCode — початковий код
   * @param {Object} options — додаткові параметри
   * @returns {string} editorId для подальших операцій
   */
  function create(containerId, initialCode = '', options = {}) {
    const editorId = containerId;

    function doCreate() {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`[EditorManager] Container #${containerId} not found`);
        return;
      }

      // Видаляємо попередній, якщо є
      if (editors[editorId]) {
        try { editors[editorId].dispose(); } catch (e) {}
      }

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const editorTheme = isDark ? 'cpp-dark' : 'cpp-light';

      // ВАЖЛИВО: Monaco приймає RAW TEXT.
      // Якщо завантажений з localStorage код містить пошкоджені HTML атрибути, санітизуємо його як HTML,
      // інакше тільки нормалізуємо пробіли.
      const isCorrupted = typeof CodeSanitizer !== 'undefined' && CodeSanitizer.containsHTML(initialCode);
      const code = (typeof CodeSanitizer !== 'undefined')
        ? (isCorrupted ? CodeSanitizer.sanitizeFromHTML(initialCode) : CodeSanitizer.sanitizeFromEditor(initialCode))
        : initialCode;
      console.log('[EditorManager:create] Code loaded (first 80 chars):', code.substring(0, 80));

      const editor = monaco.editor.create(container, {
        value: code,
        ...DEFAULT_OPTIONS,
        theme: editorTheme,
        ...options,
      });

      editors[editorId] = editor;

      // Зберігаємо код при зміні (debounce)
      let saveTimer;
      editor.onDidChangeModelContent(() => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          saveCode(editorId);
        }, 1000);
      });
    }

    if (monacoReady) {
      doCreate();
    } else {
      onReadyCallbacks.push(doCreate);
    }

    return editorId;
  }

  /**
   * Отримуємо RAW код з редактора.
   * Monaco ЗАВЖДИ повертає чистий текст (ніколи HTML).
   * НЕ застосовуємо stripHTML — це знищить <iostream>!
   *
   * @param {string} editorId
   * @returns {string} чистий C++ код
   */
  function getCode(editorId) {
    const editor = editors[editorId];
    if (!editor) return '';
    // Monaco.getValue() повертає чистий текст — БЕЗ HTML тегів
    const raw = editor.getValue();
    console.log('[EditorManager:getCode] Raw from Monaco:', raw.substring(0, 80));
    // Тільки нормалізуємо пробіли, НЕ чіпаємо angle brackets
    return raw;
  }

  /**
   * Встановлюємо код у редактор
   * @param {string} editorId
   * @param {string} code
   */
  function setCode(editorId, code) {
    const editor = editors[editorId];
    if (!editor) return;
    // Тільки нормалізуємо пробіли, НЕ чіпаємо < >
    const clean = (typeof CodeSanitizer !== 'undefined')
      ? CodeSanitizer.sanitizeFromEditor(code)
      : code;
    editor.setValue(clean);
  }

  /**
   * Зберігаємо код у localStorage
   */
  function saveCode(editorId) {
    const code = getCode(editorId);
    try {
      localStorage.setItem(`cpp_editor_${editorId}`, code);
    } catch (e) {}
  }

  /**
   * Завантажуємо збережений код
   */
  function loadSavedCode(editorId) {
    try {
      return localStorage.getItem(`cpp_editor_${editorId}`) || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Оновлюємо тему всіх редакторів
   */
  function updateTheme() {
    if (!monacoReady) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDark ? 'cpp-dark' : 'cpp-light';
    monaco.editor.setTheme(theme);
  }

  /**
   * Знищуємо редактор
   */
  function dispose(editorId) {
    if (editors[editorId]) {
      try { editors[editorId].dispose(); } catch (e) {}
      delete editors[editorId];
    }
  }

  /**
   * Знищуємо всі редактори
   */
  function disposeAll() {
    Object.keys(editors).forEach(id => dispose(id));
  }

  /**
   * Чи готовий Monaco
   */
  function isReady() {
    return monacoReady;
  }

  /**
   * Виконуємо callback коли Monaco готовий
   */
  function onReady(cb) {
    if (monacoReady) cb();
    else onReadyCallbacks.push(cb);
  }

  return {
    init, create, getCode, setCode, saveCode, loadSavedCode,
    updateTheme, dispose, disposeAll, isReady, onReady,
  };
})();
