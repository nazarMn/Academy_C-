/* js/sanitizer.js — Санітизація C++ коду
 *
 * АРХІТЕКТУРА (КРИТИЧНО):
 *
 *   ┌──────────┐     RAW TEXT      ┌───────────┐
 *   │  Monaco  │ ──────────────── │  Backend  │
 *   │  Editor  │  (чистий C++)    │ Compiler  │
 *   └──────────┘                   └───────────┘
 *        │
 *        │  escapeHTML()
 *        ▼
 *   ┌──────────┐
 *   │ Display  │  (тільки для відображення!)
 *   │  HTML    │
 *   └──────────┘
 *
 * ПРАВИЛО: НІКОЛИ не викликати stripHTML() на C++ коді!
 * <iostream>, <vector>, <string> — це НЕ HTML теги.
 */

const CodeSanitizer = (() => {

  // ────────────────────────────────────────────
  // DEBUG LOGGING
  // ────────────────────────────────────────────

  const DEBUG = true;

  function log(stage, code) {
    if (!DEBUG) return;
    const preview = (code || '').substring(0, 120).replace(/\n/g, '\\n');
    console.log(`[Sanitizer:${stage}] ${preview}${code && code.length > 120 ? '...' : ''}`);
  }

  // ────────────────────────────────────────────
  // LAYER 1: HTML Entity Decoding
  // (для випадків коли код може містити &lt; &gt;)
  // ────────────────────────────────────────────

  /**
   * Декодує HTML entities: &lt; → <, &gt; → >, &amp; → & тощо.
   * БЕЗПЕЧНО для C++ коду — не видаляє angle brackets.
   */
  function decodeEntities(str) {
    if (!str) return '';
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }

  // ────────────────────────────────────────────
  // LAYER 2: Whitespace Normalization
  // ────────────────────────────────────────────

  /**
   * Нормалізує пробіли: CRLF → LF, табуляції → пробіли.
   * БЕЗПЕЧНО для C++ коду.
   */
  function normalizeWhitespace(code) {
    if (!code) return '';
    return code
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
  }

  // ────────────────────────────────────────────
  // LAYER 3: HTML Tag Removal
  // ⚠️ ТІЛЬКИ для тексту, скопійованого з веб-сторінок,
  //    де можуть бути <span>, <div>, <br> теги.
  //    НІКОЛИ не застосовувати на C++ з редактора!
  // ────────────────────────────────────────────

  /**
   * Видаляє ТІЛЬКИ відомі HTML-теги (span, div, br, p, code, pre тощо).
   * НЕ чіпає C++ angle brackets: <iostream>, <vector>, <string>.
   *
   * Відмінність від DOMParser: DOMParser вважає <iostream> тегом
   * і ВИДАЛЯЄ його. Ця функція НЕ видаляє невідомі теги.
   */
  function stripKnownHTMLTags(str) {
    if (!str) return '';
    // Список HTML-тегів, які можуть потрапити у скопійований код
    const htmlTags = 'span|div|br|p|pre|code|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|thead|tbody|font|sub|sup|script|style|link|meta|html|head|body';
    const tagRegex = new RegExp(`<\\/?(?:${htmlTags})(?:\\s[^>]*)?\\/?>`, 'gi');
    let clean = str.replace(tagRegex, '');
    
    // Видаляємо також "осиротілі" атрибути, які з'явились через баг з підсвіткою (наприклад, class="hl...">)
    clean = clean.replace(/(?:class|id|style|data-[a-z0-9-]+)\s*=\s*(?:"[^"]*"|'[^']*')\s*>?/gi, '');
    
    return clean;
  }

  // ────────────────────────────────────────────
  // MAIN API
  // ────────────────────────────────────────────

  /**
   * Санітизація коду З РЕДАКТОРА (Monaco Editor).
   * Редактор повертає ЧИСТИЙ текст — ніколи HTML.
   * Тому ми ТІЛЬКИ нормалізуємо пробіли.
   *
   * @param {string} code — raw text з Monaco Editor
   * @returns {string} — чистий C++ код
   */
  function sanitizeFromEditor(code) {
    if (!code) return '';
    log('INPUT_EDITOR', code);

    // Крок 1: Нормалізація пробілів
    let clean = normalizeWhitespace(code);

    // Крок 2: Trim
    clean = clean.trim();

    log('OUTPUT_EDITOR', clean);
    return clean;
  }

  /**
   * Санітизація коду, який може містити HTML entities.
   * (Наприклад, код з DOM-елемента через innerHTML)
   *
   * @param {string} code — текст, що може мати &lt; &gt;
   * @returns {string} — чистий C++ код
   */
  function sanitizeFromHTML(code) {
    if (!code) return '';
    log('INPUT_HTML', code);

    // Крок 1: Видаляємо відомі HTML теги (span, div, br тощо)
    let clean = stripKnownHTMLTags(code);

    // Крок 2: Декодуємо HTML entities (&lt; → <)
    clean = decodeEntities(clean);

    // Крок 3: Нормалізація пробілів
    clean = normalizeWhitespace(clean);

    // Крок 4: Trim
    clean = clean.trim();

    log('OUTPUT_HTML', clean);
    return clean;
  }

  /**
   * Основна функція — визначає тип вводу і вибирає стратегію.
   * ЯКЩО невідомо джерело — використовує безпечний шлях.
   *
   * @param {string} code
   * @param {string} source — 'editor' | 'html' | 'unknown'
   * @returns {string}
   */
  function sanitize(code, source = 'editor') {
    if (!code) return '';

    if (source === 'html') {
      return sanitizeFromHTML(code);
    }

    // За замовчуванням — як з редактора (НЕ чіпаємо angle brackets)
    return sanitizeFromEditor(code);
  }

  /**
   * Перевіряє наявність відомих HTML тегів (span, div тощо).
   * НЕ вважає <iostream>, <vector> за HTML.
   */
  function containsHTML(code) {
    if (!code) return false;
    const htmlTags = 'span|div|br|p|pre|code|strong|em|b|i|u|a|script|style';
    const tagRegex = new RegExp(`<\\/?(${htmlTags})(\\s[^>]*)?\\/?>`, 'i');
    return tagRegex.test(code) || /class\s*=\s*['"]/.test(code);
  }

  /**
   * Escape для безпечного відображення в HTML.
   * Перетворює < > на &lt; &gt; для рендерингу.
   * ТІЛЬКИ для display layer — ніколи для execution!
   */
  function escapeForDisplay(code) {
    if (!code) return '';
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return {
    // Основний API
    sanitize,
    sanitizeFromEditor,
    sanitizeFromHTML,
    escapeForDisplay,

    // Утиліти
    decodeEntities,
    normalizeWhitespace,
    stripKnownHTMLTags,
    containsHTML,

    // Debug
    log,
  };
})();
