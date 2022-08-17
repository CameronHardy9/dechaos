#! /usr/bin/env node

const readlineSync = require("readline-sync");
const fs = require("fs");
const path = require("path");
const process = require("process");
const cliProgress = require("cli-progress");
const exiftool = require("exiftool-vendored").exiftool;

const progressBar = new cliProgress.SingleBar(
	{},
	cliProgress.Presets.shades_classic
);

const input = process.argv[2];
const dir = path.resolve(process.cwd(), input);
const files = fs.readdirSync(dir).filter((item) => !(/(^|\/)\.[^\/\.]/g).test(item));
const skippedFiles = [];


if (files.length === 0) {
    console.log("\nERROR: 0 files were detected in the target directory.");
    return 0;
}

const continueProgram = readlineSync.question(`\n${files.length} ${files.length > 1 ? "files" : "file"} will be impacted from the ${dir} filepath.\nAre you sure you want to continue? [yes/no] `);


if(continueProgram.toLowerCase() === 'yes'){
    progressBar.start(files.length, 0);

    const promises = files.map((file) => {
        const ext = path.extname(file);
        let skipFile = false;
        let tag;

        switch(true){
            case ['.mov', '.MOV'].includes(ext):
                tag = 'CreationDate';
                break;
            case ['.jpg', '.jpeg', '.HEIC', '.heic', '.png'].includes(ext):
                tag = 'DateTimeOriginal';
                break;
            default:
                skippedFiles.push(file);
                skipFile = true;
                progressBar.increment();
        };

        if (!skipFile) {
            return exiftool.read(path.resolve(dir, file), ["-stay_open"]).then((metadata) => {
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const year = `${metadata[tag].year}`;
                const month = months[metadata[tag].month - 1];

                const targetPathExists = fs.existsSync(dir);
                const yearDirExists = fs.existsSync(path.join(dir, year));
                const monthDirExists = fs.existsSync(path.join(dir, year, month));

                if(targetPathExists){
                    if(yearDirExists){
                        if(monthDirExists) {
                            fs.renameSync(path.join(dir, file), path.join(dir, year, month, file));
                        } else {
                            fs.mkdirSync(path.join(dir, year, month));
                            fs.renameSync(path.join(dir, file), path.join(dir, year, month, file));
                        }
                    } else {
                        fs.mkdirSync(path.join(dir, year));
                        fs.mkdirSync(path.join(dir, year, month));
                        fs.renameSync(path.join(dir, file), path.join(dir, year, month, file));
                    }
                    progressBar.increment();
                } else {
                    progressBar.stop();
                    console.log('ERROR: Your target file path has changed\nprogram terminated');
                    return 1;
                }
            })
        }
    });

    Promise.all(promises).finally(() => {
        exiftool.end();
        progressBar.stop();

        console.log("\nSorting complete!");
        
        if(skippedFiles.length > 0) {
            const amountSkippedPlural = skippedFiles.length > 1;
            console.log(`${skippedFiles.length} ${amountSkippedPlural ? 'files' : 'file'} ${amountSkippedPlural ? 'were' : 'was'} skipped and ${amountSkippedPlural ? 'remain' : 'remains'} in ${amountSkippedPlural ? 'their' : "it's"} original location.`);
        }
        return 0;
    });

} else {
    console.log('Program terminated');
    return 0;
}
