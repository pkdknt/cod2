const fs = require('fs');
const path = require('path');
const modelsDir = path.join(__dirname, 'src', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  const p = path.join(modelsDir, file);
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('import mongoose, {')) {
    content = content.replace('import mongoose, {', 'import {');
    fs.writeFileSync(p, content);
    console.log('Fixed ' + file);
  }
}
