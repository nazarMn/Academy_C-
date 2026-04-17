/**
 * Error Pattern Engine for Interactive Lessons.
 * Rule-based, no AI — matches known mistakes in student code.
 */

// Common C++ error patterns
export const COMMON_PATTERNS = [
  { match: 'cin <<',            hint: 'cin використовує >> для вводу, а не <<', fix: 'cin >>' },
  { match: 'cout >>',           hint: 'cout використовує << для виводу, а не >>', fix: 'cout <<' },
  { match: 'include iostream',  hint: 'Потрібні кутові дужки: #include <iostream>', fix: '#include <iostream>' },
  { match: '#include iostream', hint: 'Потрібні кутові дужки: #include <iostream>', fix: '#include <iostream>' },
  { match: 'int main{}',        hint: 'Функція main потребує дужки: int main()', fix: 'int main()' },
  { match: 'int Main',          hint: 'main пишеться з маленької літери', fix: 'int main' },
  { match: 'return 0',          hint: 'Не забудьте крапку з комою: return 0;', partial: true },
  { match: 'void main',         hint: 'main повинна повертати int, а не void', fix: 'int main' },
  { match: 'string ',           hint: 'Для string потрібен #include <string>', needsInclude: '<string>' },
  { match: 'endln',             hint: 'Правильно: endl (без n на кінці)', fix: 'endl' },
  { match: 'End1',              hint: 'endl — це маленька L, а не цифра 1', fix: 'endl' },
  { match: 'cOut',              hint: 'cout пишеться маленькими літерами', fix: 'cout' },
  { match: 'Cout',              hint: 'cout пишеться маленькими літерами', fix: 'cout' },
  { match: 'CIN',              hint: 'cin пишеться маленькими літерами', fix: 'cin' },
];

/**
 * Check code against a list of error patterns.
 * @param {string} code — student's code
 * @param {Array} patterns — error patterns to check (default: COMMON_PATTERNS)
 * @returns {{ hasErrors: boolean, matched: Array }}
 */
export function checkCode(code, patterns = COMMON_PATTERNS) {
  if (!code) return { hasErrors: false, matched: [] };

  const matched = [];

  for (const pattern of patterns) {
    if (code.includes(pattern.match)) {
      matched.push({
        ...pattern,
        line: findLine(code, pattern.match),
      });
    }
  }

  return {
    hasErrors: matched.length > 0,
    matched,
  };
}

/**
 * Check if code matches a solution pattern.
 * @param {string} code — student's code
 * @param {string} solutionPattern — expected pattern in the solution
 * @returns {boolean}
 */
export function checkSolution(code, solutionPattern) {
  if (!code || !solutionPattern) return false;
  // Normalize whitespace for comparison
  const norm = s => s.replace(/\s+/g, ' ').trim();
  return norm(code).includes(norm(solutionPattern));
}

/**
 * Find the line number of a pattern match.
 */
function findLine(code, pattern) {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) return i + 1;
  }
  return null;
}

/**
 * Get progressive hints for a lesson.
 * Returns hints one at a time based on attempt count.
 * @param {Array} hints — hint array from lesson data
 * @param {number} attempt — current attempt number (0-based)
 * @returns {{ hint: string|null, isLast: boolean, showSolution: boolean }}
 */
export function getProgressiveHint(hints = [], attempt = 0) {
  if (!hints || hints.length === 0) {
    return { hint: null, isLast: true, showSolution: false };
  }

  if (attempt >= hints.length) {
    return { hint: hints[hints.length - 1], isLast: true, showSolution: true };
  }

  return {
    hint: hints[attempt],
    isLast: attempt === hints.length - 1,
    showSolution: attempt >= hints.length,
  };
}
