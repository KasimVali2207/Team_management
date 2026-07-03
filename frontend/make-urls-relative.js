const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let count = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const regex = /\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*"http:\/\/localhost:4000"\}/g;
    if (regex.test(content)) {
      content = content.replace(regex, '');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('✔ Made API paths relative in:', path.basename(filePath));
      count++;
    }
  }
});

console.log(`\n🎉 Completed! Updated ${count} files.`);
