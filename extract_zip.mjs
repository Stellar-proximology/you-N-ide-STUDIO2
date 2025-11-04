import fs from 'fs';
import JSZip from 'jszip';

const zipData = fs.readFileSync('attached_assets/GameAssetStudio_1761390947159.zip');
const zip = await JSZip.loadAsync(zipData);

console.log('=== ZIP Contents ===');
const files = [];
zip.forEach((relativePath, zipEntry) => {
  console.log(relativePath, '-', zipEntry.dir ? 'DIR' : 'FILE');
  files.push({ path: relativePath, isDir: zipEntry.dir });
});

// Extract to temp directory
for (const [path, entry] of Object.entries(zip.files)) {
  if (!entry.dir) {
    const content = await entry.async('nodebuffer');
    const outputPath = `attached_assets/game_assets/${path}`;
    const dir = outputPath.substring(0, outputPath.lastIndexOf('/'));
    if (dir) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, content);
  }
}
console.log('\n=== Extraction complete ===');
