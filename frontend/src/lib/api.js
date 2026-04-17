import { API_BASE, API_TIMEOUT } from './constants';

/**
 * Fetch with timeout and error handling
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Load lessons from API, falling back to embedded data
 */
export async function loadLessons() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/lessons`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // Fallback silently
  }
  return [];
}

/**
 * Load quizzes from API, falling back to embedded data
 */
export async function loadQuizzes() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/quizzes`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // Fallback silently
  }
  return [];
}

/**
 * Load projects from API, falling back to embedded data
 */
export async function loadProjects() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/projects`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // Fallback silently
  }
  return [];
}

/**
 * Execute code via backend
 */
export async function executeCode(code, input = '', testCases = null, language = 'cpp', lessonId = null) {
  const body = { code, input, language };
  if (lessonId) body.lessonId = lessonId;
  if (testCases) body.testCases = testCases;

  return fetchWithTimeout(
    `${API_BASE}/execute`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    10000 // Longer timeout for code execution
  );
}
