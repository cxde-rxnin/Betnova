const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace Betnovo with Betnovo
    content = content.replace(/Betnovo/g, 'Betnovo');
    
    // You might also want to catch betnovo -> betnovo if it appears as a name,
    // but the package name "betnovo" in package.json/package-lock.json should probably stay the same.
    // For safety, let's just do 'Betnovo' and 'betnovo' but ignore package files and internal paths.
    if (!filePath.endsWith('package.json') && !filePath.endsWith('package-lock.json')) {
      content = content.replace(/betnovo/g, 'betnovo');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  } catch (err) {
    // Ignore read errors
  }
}

function walk(dir) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('.next')) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      if (['.ts', '.tsx', '.js', '.md', '.json'].includes(path.extname(fullPath))) {
        replaceInFile(fullPath);
      }
    }
  }
}

walk(process.cwd());
