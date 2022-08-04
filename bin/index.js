#! /usr/bin/env node

const readlineSync = require("readline-sync");
const exif = require("exiftool");
const fs = require("fs");
const path = require("path");
const process = require("process");
const cliProgress = require("cli-progress");

const progressBar = new cliProgress.SingleBar(
	{},
	cliProgress.Presets.shades_classic
);

const input = process.argv[2];
const dir = path.resolve(process.cwd(), input);
const files = fs.readdirSync(dir);

const answer = readlineSync.question(`${files.length} file(s) will be impacted from the ${dir} filepath! Are you sure you want to continue? [yes/no] `);


if(answer.toLowerCase() === 'yes'){
    progressBar.start(files.length, 0);
    files.forEach((file, index) => {
        const data = fs.readFileSync(path.resolve(dir, file));
        exif.metadata(data, ['-creationDate', '-createDate'], (err, metadata) => {
            if (err) {
                    console.log(err);
                }
            else {
                progressBar.update(index + 1);
                console.log(metadata)
                }
        });
    })

} else {
    console.log('quit');
}
