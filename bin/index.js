#! /usr/bin/env node

//NEW NAME - meta-sort?

const readlineSync = require("readline-sync");
const exif = require("exiftool");
const fs = require("fs");
const path = require("path");
const process = require("process");
const cliProgress = require("cli-progress");
const commandExistsSync = require('command-exists').sync;

const progressBar = new cliProgress.SingleBar(
	{},
	cliProgress.Presets.shades_classic
);

const input = process.argv[2];
const dir = path.resolve(process.cwd(), input);
const files = fs.readdirSync(dir).filter((item) => !(/(^|\/)\.[^\/\.]/g).test(item));



if (!commandExistsSync('exiftool')) {
    console.log("\nERROR: This program requires exiftool to function. Please install before continuing.\n\nUse 'brew install exiftool' or download from https://exiftool.org/\n");
    return 1;
};


const answer = readlineSync.question(`\n${files.length} file(s) will be impacted from the ${dir} filepath.\nAre you sure you want to continue? [yes/no] `);


if(answer.toLowerCase() === 'yes'){
    //progressBar.start(files.length, 0);
    files.forEach((file, index) => {
        const ext = path.extname(file);
        let flag;
        
        switch(true){
            case ['.mov', '.MOV'].includes(ext):
                flag = '-creationDate';
                break;
            case ['.jpg', '.jpeg', '.HEIC', '.heic', '.png'].includes(ext):
                flag = '-DateTimeOriginal';
                break;
        };

        const data = fs.readFileSync(`${dir}/${file}`);
        
        exif.metadata(data, [flag], (err, metadata) => {
            if (err) {
                    console.log(err);
                }
            else {
                //progressBar.update(index + 1);
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const dateSplit = Object.values(metadata)[0].split(':');
                const year = dateSplit[0];
                const month = months[Math.abs(dateSplit[1]) - 1];

                const targetPathExists = fs.existsSync(dir);
                const yearFolderExists = fs.existsSync(path.join(dir, year));
                const monthFolderExists = fs.existsSync(path.join(dir, year, month));

                if(targetPathExists){
                    if(yearFolderExists){
                        if(monthFolderExists) {
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
                } else {
                    console.log('ERROR: Your target file path has changed\nprogram terminated');
                    return 1;
                }
            }
        });
    })

} else {
    console.log('program terminated');
}
