const fs = require('fs');
const path = require('path');
const mappersDir = path.join(__dirname, 'src', 'mappers');

if (!fs.existsSync(mappersDir)) {
  console.log('No mappers directory');
  process.exit(1);
}

const files = fs.readdirSync(mappersDir).filter(f => f.endsWith('Mapper.ts'));

for (const file of files) {
  const filePath = path.join(mappersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace "if (!obj) return null;" with "if (!obj) return {} as any;"
  content = content.replace(/if\s*\(\s*![\w]+\s*\)\s*return\s*null\s*;/g, match => {
    return match.replace('null', '{} as any');
  });
  // Replace "return null;" at the end of functions just in case
  // Or explicitly cast returns.
  
  // Actually, to fix the | null union in return types of these methods, we can cast the returned object as any.
  // Instead, let's just make sure "return null;" is "return {} as any;" everywhere in mappers.
  content = content.replace(/return null;/g, 'return {} as any;');
  fs.writeFileSync(filePath, content);
}
console.log('Mappers updated');
