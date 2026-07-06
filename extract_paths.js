const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'htmltemp', 'Benh_an_RHM_A3_2026 290626.html');
const destPath = path.join(__dirname, 'src', 'components', 'benh-an', 'LesionPaths.ts');

const content = fs.readFileSync(srcPath, 'utf8');

// Find the block starting with "const LESION_PATHS = {"
const startIdx = content.indexOf('const LESION_PATHS = {');
if (startIdx === -1) {
  console.error('Could not find LESION_PATHS in source HTML');
  process.exit(1);
}

// Find the ending bracket of LESION_PATHS
// It ends before "function back(p,i){" or "const LESION_ITEMS = ..."
const endIdx = content.indexOf('};', startIdx);
if (endIdx === -1) {
  console.error('Could not find end of LESION_PATHS');
  process.exit(1);
}

const lesionBlock = content.substring(startIdx, endIdx + 2);

const output = `// Auto-generated from legacy HTML template
export ${lesionBlock}
`;

fs.writeFileSync(destPath, output, 'utf8');
console.log('Successfully wrote LesionPaths.ts');
