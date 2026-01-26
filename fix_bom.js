const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (file.endsWith('.toml')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('.gemini/commands/kamiflow');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    fs.writeFileSync(file, content, 'utf8');
    console.log('? Fixed BOM: ' + file);
  }
});
