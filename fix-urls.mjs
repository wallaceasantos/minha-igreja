/**
 * Bulk URL Replacer
 * Substitui todas as URLs localhost:3000 por buildApiUrl()
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = 'src';
const FILES_MODIFIED = [];

function getAllFiles(dir) {
  let files = [];
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function replaceUrls(content) {
  let modified = false;
  
  // Pattern 1: Template literals with interpolation
  // `http://localhost:3000/api/path/${var}` → buildApiUrl(`/api/path/${var}`)
  const templateRegex = /`http:\/\/localhost:3000(\/api\/[^`]*)`/g;
  if (templateRegex.test(content)) {
    content = content.replace(templateRegex, 'buildApiUrl(`$1`)');
    modified = true;
  }
  
  // Pattern 2: Single-quoted strings
  // 'http://localhost:3000/api/path' → buildApiUrl('/api/path')
  const singleQuoteRegex = /'http:\/\/localhost:3000(\/api\/[^']*)'/g;
  if (singleQuoteRegex.test(content)) {
    content = content.replace(singleQuoteRegex, "buildApiUrl('$1')");
    modified = true;
  }
  
  // Pattern 3: Double-quoted strings
  // "http://localhost:3000/api/path" → buildApiUrl("/api/path")
  const doubleQuoteRegex = /"http:\/\/localhost:3000(\/api\/[^"]*)"/g;
  if (doubleQuoteRegex.test(content)) {
    content = content.replace(doubleQuoteRegex, 'buildApiUrl("$1")');
    modified = true;
  }
  
  // Pattern 4: window.open with template literal
  // window.open(`http://localhost:3000/api/...` → window.open(buildApiUrl(`/api/...`))
  const windowOpenTemplate = /window\.open\(`http:\/\/localhost:3000(\/api\/[^`]*)`/g;
  if (windowOpenTemplate.test(content)) {
    content = content.replace(windowOpenTemplate, 'window.open(buildApiUrl(`$1`)');
    modified = true;
  }

  // Pattern 5: String concatenation (rare)
  // 'http://localhost:3000' + '/api/path' → buildApiUrl('/api/path')
  const concatRegex = /'http:\/\/localhost:3000'\s*\+\s*'\/api\/([^']*)'/g;
  if (concatRegex.test(content)) {
    content = content.replace(concatRegex, "buildApiUrl('/api/$1')");
    modified = true;
  }

  return { content, modified };
}

function addImportIfMissing(content) {
  if (content.includes('buildApiUrl') && !content.includes("from '@/lib/config'")) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\s*import\s/)) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, "import { buildApiUrl } from '@/lib/config';");
      return lines.join('\n');
    }
  }
  return content;
}

// Main
const files = getAllFiles(SRC_DIR);
let totalModified = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    const { content: newContent, modified } = replaceUrls(content);
    
    if (modified) {
      const updatedContent = addImportIfMissing(newContent);
      writeFileSync(file, updatedContent, 'utf8');
      FILES_MODIFIED.push(file);
      totalModified++;
      console.log(`✅ ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log(`\n🎉 Done! Modified ${totalModified} files:`);
FILES_MODIFIED.forEach(f => console.log(`  - ${f}`));
