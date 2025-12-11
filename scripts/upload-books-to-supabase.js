#!/usr/bin/env node

/**
 * Upload books to Supabase Storage
 * 
 * Usage:
 *   node scripts/upload-books-to-supabase.js
 * 
 * Requires:
 *   - EXPO_PUBLIC_SUPABASE_URL environment variable
 *   - EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable
 *   - @supabase/supabase-js package installed
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const booksDir = path.join(__dirname, '../assets/books');

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      // Get relative path from assets/books
      const relativePath = path.relative(booksDir, filePath);
      arrayOfFiles.push({
        localPath: filePath,
        storagePath: relativePath.replace(/\\/g, '/'), // Normalize to forward slashes
      });
    }
  });

  return arrayOfFiles;
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadFile(localPath, storagePath) {
  const fileContent = fs.readFileSync(localPath);
  const fileBuffer = Buffer.from(fileContent);

  const { data, error } = await supabase.storage
    .from('books')
    .upload(storagePath, fileBuffer, {
      contentType: path.extname(localPath) === '.pdf' 
        ? 'application/pdf' 
        : 'text/markdown',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main upload function
 */
async function uploadBooks() {
  console.log('📚 Starting book upload to Supabase Storage...\n');

  // Check if books directory exists
  if (!fs.existsSync(booksDir)) {
    console.error(`❌ Books directory not found: ${booksDir}`);
    process.exit(1);
  }

  // Get all files
  const files = getAllFiles(booksDir);
  console.log(`Found ${files.length} files to upload\n`);

  let successCount = 0;
  let failCount = 0;

  // Upload files in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const promises = batch.map((file) => 
      uploadFile(file.localPath, file.storagePath)
        .then((success) => {
          if (success) {
            successCount++;
            console.log(`✅ ${file.storagePath}`);
          } else {
            failCount++;
          }
        })
    );

    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < files.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total: ${files.length}`);

  if (failCount === 0) {
    console.log('\n🎉 All books uploaded successfully!');
  } else {
    console.log('\n⚠️  Some files failed to upload. Check errors above.');
    process.exit(1);
  }
}

// Run upload
uploadBooks().catch((error) => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});

