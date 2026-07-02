const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('http://localhost:4000')) {
      // For string templates like `http://localhost:4000/api/...`
      content = content.replace(/`http:\/\/localhost:4000\/([^`]+)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/$1`');
      
      // For standard string quotes like 'http://localhost:4000/api/...'
      content = content.replace(/'http:\/\/localhost:4000\/([^']+)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/$1`');
      
      // For double quotes like "http://localhost:4000/api/..."
      content = content.replace(/"http:\/\/localhost:4000\/([^"]+)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/$1`');
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated:', filePath);
    }
  }
});
