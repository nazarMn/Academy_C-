const fs = require('fs');
const code = fs.readFileSync('js/data/lessons.js', 'utf8');
try {
  new Function(code);
  console.log("OK");
} catch(e) {
  const match = e.stack.match(/<anonymous>:(\\d+):/);
  if (match) {
     const n = parseInt(match[1]);
     const lines = code.split('\\n');
     console.log("SyntaxError at line " + n + ": " + e.message);
     for(let i = Math.max(0, n-3); i < Math.min(lines.length, n+2); i++) {
        console.log((i+1) + ": " + lines[i]);
     }
  } else {
     console.log("Error: " + e.message);
  }
}
