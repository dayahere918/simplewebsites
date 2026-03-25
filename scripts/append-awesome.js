const fs = require('fs');
const path = require('path');

const masterFile = path.resolve(__dirname, 'awesome-master.json');
const inputFile = path.resolve(__dirname, process.argv[2]);

let master = [];
if (fs.existsSync(masterFile)) {
    master = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
}

if (process.argv[2]) {
    const newData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    master = master.concat(newData);
    fs.writeFileSync(masterFile, JSON.stringify(master, null, 4));
    console.log(`Appended ${newData.length} categories. Total: ${master.length}/50 categories.`);
}

if (master.length >= 50) {
    const appJsPath = path.resolve(__dirname, '../sites/awesome-free-tools/app.js');
    let appJs = fs.readFileSync(appJsPath, 'utf8');
    appJs = appJs.replace(/const TOOLS_DATA = \[[\s\S]*?\];\n\n\/\/ Re-map/, `const TOOLS_DATA = ${JSON.stringify(master, null, 4)};\n\n// Re-map`);
    fs.writeFileSync(appJsPath, appJs);
    console.log('Successfully injected all 50 categories (500 tools) into app.js!');
}
