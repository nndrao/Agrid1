// Script to update import statements for gridStore
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateImports() {
  // Find all TypeScript files in the project
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });
  
  console.log(`Found ${files.length} TypeScript files to check`);
  
  // Regular expression to match the import statement
  const importRegex = /import\s+{\s*useGridStore\s*}(?:\s*,\s*{([^}]*)})?\s+from\s+['"]([^'"]*)['"]/g;
  
  let updatedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    let content;
    
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`Error reading file ${file}:`, err);
      continue;
    }
    
    // Skip files that don't import useGridStore
    if (!content.includes('useGridStore')) continue;
    
    // Replace the import statement
    const newContent = content.replace(
      importRegex, 
      (match, otherImports, importPath) => {
        if (otherImports) {
          // If there are other imports from the same path, keep them
          return `import useGridStore${otherImports ? `, { ${otherImports} }` : ''} from '${importPath}'`;
        } else {
          // If useGridStore is the only import, replace it
          return `import useGridStore from '${importPath}'`;
        }
      }
    );
    
    // Write back to the file if changes were made
    if (content !== newContent) {
      try {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated imports in ${file}`);
        updatedCount++;
      } catch (err) {
        console.error(`Error writing file ${file}:`, err);
      }
    }
  }
  
  console.log(`Updated imports in ${updatedCount} files`);
}

updateImports().catch(console.error);