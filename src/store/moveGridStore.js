// Simple script to move the new gridStore.ts.new file to gridStore.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define file paths
const sourcePath = path.join(__dirname, 'gridStore.ts.new');
const backupPath = path.join(__dirname, 'gridStore.ts.bak');
const targetPath = path.join(__dirname, 'gridStore.ts');

// Create a backup of the current gridStore.ts
if (fs.existsSync(targetPath)) {
  console.log('Creating backup of current gridStore.ts...');
  fs.copyFileSync(targetPath, backupPath);
  console.log(`Backup created at ${backupPath}`);
}

// Move the new file to replace the current one
if (fs.existsSync(sourcePath)) {
  console.log('Moving new gridStore.ts into place...');
  fs.copyFileSync(sourcePath, targetPath);
  fs.unlinkSync(sourcePath);
  console.log(`Successfully updated ${targetPath}`);
  console.log('Modular refactoring complete!');
} else {
  console.error('Error: New gridStore.ts.new file not found.');
}