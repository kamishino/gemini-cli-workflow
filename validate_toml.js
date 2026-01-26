const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

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
let hasError = false;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    toml.parse(content);
    console.log('? Valid: ' + file);
  } catch (e) {
    console.error('? INVALID: ' + file);
    console.error('   Error: ' + e.message);
    hasError = true;
  }
});

if (hasError) process.exit(1);
