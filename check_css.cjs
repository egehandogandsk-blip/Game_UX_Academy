const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.css')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const cssFiles = getAllFiles('./src');

cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let balance = 0;
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let char of line) {
            if (char === '{') balance++;
            if (char === '}') balance--;
        }
    }

    if (balance !== 0) {
        console.log(`ERROR: Unbalanced braces in ${file}. Balance: ${balance}`);
    } else {
        // console.log(`OK: ${file}`);
    }
});
