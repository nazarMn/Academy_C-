import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace 'http://localhost:3001/api' -> '/api'
    let newContent = content.replace(/http:\/\/localhost:3001\/api/g, '/api');
    
    // Replace import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001' -> import.meta.env.DEV ? 'http://localhost:3001' : ''
    newContent = newContent.replace(/import\.meta\.env\.VITE_BACKEND_URL\s*\|\|\s*'http:\/\/localhost:3001'/g, "import.meta.env.DEV ? 'http://localhost:3001' : ''");
    newContent = newContent.replace(/import\.meta\.env\.VITE_BACKEND_URL\s*\|\|\s*"http:\/\/localhost:3001"/g, 'import.meta.env.DEV ? "http://localhost:3001" : ""');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles++;
        console.log('Updated: ' + file);
    }
});

console.log(`Replaced in ${changedFiles} files.`);
