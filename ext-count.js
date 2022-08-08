const fs = require("fs");
const path = require("path");
const process = require("process");

const input = process.argv[2];
const dir = path.resolve(process.cwd(), input);
const files = fs.readdirSync(dir).filter((item) => !(/(^|\/)\.[^\/\.]/g).test(item));

const fileTypes = []

files.forEach((file) => {
    const ext = path.extname(file);

    if (!fileTypes.includes(ext)) {
        fileTypes.push(ext);
    }
});

console.log(fileTypes);