const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/books');
const PUBLIC_DIR = path.join(__dirname, '../public/assets/books');

function cleanFolderName(name) {
  // Remove duplicate words and clean up
  const words = name.split(' ');
  const uniqueWords = [];
  const seen = new Set();
  
  for (const word of words) {
    const lower = word.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueWords.push(word);
    }
  }
  
  return uniqueWords.join(' ');
}

function moveOrphanedFiles() {
  const categories = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });

  categories.forEach((dirent) => {
    if (!dirent.isDirectory() || dirent.name.startsWith('.')) {
      return;
    }

    const categoryName = dirent.name;
    const categoryPath = path.join(ASSETS_DIR, categoryName);
    const files = fs.readdirSync(categoryPath, { withFileTypes: true });

    files.forEach((file) => {
      if (file.isFile() && (file.name.endsWith('.pdf') || file.name.endsWith('.md'))) {
        // Try to find matching folder
        const baseName = file.name
          .replace(/\.(pdf|md)$/i, '')
          .replace(/^1\._EthiopianBible_/i, '')
          .replace(/_/g, ' ')
          .trim();

        // Look for existing folder that might match
        const folders = fs.readdirSync(categoryPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        // Try to find a matching folder
        let targetFolder = null;
        for (const folder of folders) {
          const folderBase = folder.toLowerCase().replace(/\s+/g, ' ');
          const fileBase = baseName.toLowerCase().replace(/\s+/g, ' ');
          if (folderBase.includes(fileBase) || fileBase.includes(folderBase)) {
            targetFolder = folder;
            break;
          }
        }

        // If no match, create a new folder
        if (!targetFolder) {
          targetFolder = cleanFolderName(baseName);
          const newFolder = path.join(categoryPath, targetFolder);
          const publicNewFolder = path.join(PUBLIC_DIR, categoryName, targetFolder);
          
          if (!fs.existsSync(newFolder)) {
            fs.mkdirSync(newFolder, { recursive: true });
          }
          if (!fs.existsSync(publicNewFolder)) {
            fs.mkdirSync(publicNewFolder, { recursive: true });
          }
        }

        // Move file
        const sourceFile = path.join(categoryPath, file.name);
        const destFile = path.join(categoryPath, targetFolder, file.name);
        const publicDestFile = path.join(PUBLIC_DIR, categoryName, targetFolder, file.name);

        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(sourceFile, destFile);
          fs.copyFileSync(sourceFile, publicDestFile);
          fs.unlinkSync(sourceFile);
          console.log(`Moved: ${file.name} -> ${targetFolder}/`);
        }
      }
    });
  });
}

function renameDuplicateFolders() {
  const categories = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });

  categories.forEach((dirent) => {
    if (!dirent.isDirectory() || dirent.name.startsWith('.')) {
      return;
    }

    const categoryName = dirent.name;
    const categoryPath = path.join(ASSETS_DIR, categoryName);
    const folders = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    folders.forEach((folderName) => {
      const cleaned = cleanFolderName(folderName);
      if (cleaned !== folderName) {
        const oldPath = path.join(categoryPath, folderName);
        const newPath = path.join(categoryPath, cleaned);
        const publicOldPath = path.join(PUBLIC_DIR, categoryName, folderName);
        const publicNewPath = path.join(PUBLIC_DIR, categoryName, cleaned);

        if (!fs.existsSync(newPath)) {
          fs.renameSync(oldPath, newPath);
          if (fs.existsSync(publicOldPath)) {
            if (!fs.existsSync(publicNewPath)) {
              fs.mkdirSync(publicNewPath, { recursive: true });
            }
            // Move files
            const files = fs.readdirSync(publicOldPath);
            files.forEach(file => {
              fs.renameSync(
                path.join(publicOldPath, file),
                path.join(publicNewPath, file)
              );
            });
            fs.rmdirSync(publicOldPath);
          }
          console.log(`Renamed: ${folderName} -> ${cleaned}`);
        }
      }
    });
  });
}

console.log('Cleaning up folders...\n');
moveOrphanedFiles();
console.log('\nRenaming duplicate folders...\n');
renameDuplicateFolders();
console.log('\n✅ Cleanup complete!');

