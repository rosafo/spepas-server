const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

const copyFolders = [
  'images',
  'plugins',
  'admin-ui'
];

copyFolders.forEach(folder => {
  const srcPath = path.join(srcDir, folder);
  const destPath = path.join(distDir, folder);
  
  fs.copySync(srcPath, destPath);
  console.log(`Copied ${srcPath} to ${destPath}`);
});
