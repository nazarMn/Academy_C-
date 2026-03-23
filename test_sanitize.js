const { executeCode } = require('./backend/executor.js');
const fs = require('fs');

function sanitizeCode(code) {
  if (!code) return '';

  const htmlTags = 'span|div|br|p|pre|code|strong|em|b|i|u|a|ul|ol|li|h[1-6]|table|tr|td|th|font|script|style|link|meta|html|head|body';
  const tagRegex = new RegExp(`<\\\\/?(?:${htmlTags})(?:\\\\s[^>]*)?\\\\/?>`, 'gi');
  let clean = code.replace(tagRegex, '');
  
  // Видаляємо "осиротілі" HTML атрибути
  clean = clean.replace(/(?:class|id|style|data-[a-z0-9-]+)\s*=\s*(?:"[^"]*"|'[^']*')\s*>?/gi, '');

  // Крок 2: Декодуємо HTML entities
  clean = clean
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Крок 3: Нормалізація
  clean = clean
    .replace(/\\r\\n/g, '\\n')
    .replace(/\\r/g, '\\n')
    .trim();

  return clean;
}

const corruptedPayload = `class="hl-include">#include <iostream>
class="hl-include">using namespace std;

class="hl-keyword">int class="hl-keyword">main() {
    class="hl-keyword">cout class="hl-operator"><< class="hl-string">"Clean Data Output" class="hl-operator"><< class="hl-keyword">endl;
    class="hl-keyword">return class="hl-number">0;
}`;

async function run() {
  console.log("Original Corrupted Payload:\\n" + corruptedPayload);
  const cleanCode = sanitizeCode(corruptedPayload);
  console.log("\\nSanitized Code:\\n" + cleanCode);
  
  console.log("\\nExecuting via executor.js...");
  const result = await executeCode(cleanCode, [], true);
  console.log("Execute Result:", result);
}

run();
