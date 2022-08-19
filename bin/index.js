#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const process = require("process");
const cliProgress = require("cli-progress");
const exiftool = require("exiftool-vendored").exiftool;
const { lutimesSync } = require('utimes');
const dayjs = require('dayjs');
const prompts = require('prompts');

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

const questions = [
    {
        type: 'select',
        name: 'execute',
        message: `Are you sure you want to continue?`,
        choices: [
            {
                title: 'Continue',
                value: true
            },
            {
                title: 'Quit',
                value: false
            }
        ]
    },
    {
        type: prev => prev == true ? 'select' : null,
        name: 'typeOfSort',
        message: 'Which operation would you like to execute?',
        choices: [
            {
                title: 'Organize files into a nested Year>Month folder structure',
                value: 'folder'
            },
            {
                title: 'Rewrite file "Created Date" to match original creation date in metadata',
                value: 'rewrite'
            },
            {
                title: 'Both',
                value: 'both'
            }
        ]
    }
];

(async () => {
    console.log(`\n${files.length} ${files.length > 1 ? "files" : "file"} will be impacted from the ${dir} filepath.`)
    const { execute, typeOfSort } = await prompts(questions);


    if(execute){
        progressBar.start(files.length, 0);
    
        const promises = files.map((file, index) => {
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
                    progressBar.update(files.length - (files.length - (index + 1)));
            };
    
            if (!skipFile) {
                return exiftool.read(path.resolve(dir, file), ["-stay_open"]).then(({[tag]: time}) => {
                    
                    if(['both', 'rewrite'].includes(typeOfSort)){
                        const dateCreated = +dayjs(`${time.month}-${time.day}-${time.year} ${time.hour}:${time.minute}:${time.second}`, 'M-D-YYYY H:m:s');

                        lutimesSync(path.resolve(dir, file), {
                            btime: dateCreated
                        });

                        progressBar.update(files.length - (files.length - (index + 1)));
                    }

                    if(['both', 'folder'].includes(typeOfSort)){
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        const year = `${time.year}`;
                        const month = months[time.month - 1];
        
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
                            progressBar.update(files.length - (files.length - (index + 1)));
                        } else {
                            progressBar.stop();
                            console.log('ERROR: Your target file path has changed\nprogram terminated');
                            return 1;
                        }
                    }
                })
            }
        });
    
        Promise.all(promises).finally(() => {
            exiftool.end();
            progressBar.stop();
    
            console.log("\nTask complete!");
            
            if(skippedFiles.length > 0) {
                const amountSkippedPlural = skippedFiles.length > 1;
                console.log(`${skippedFiles.length} ${amountSkippedPlural ? 'files' : 'file'} ${amountSkippedPlural ? 'were' : 'was'} skipped and ${amountSkippedPlural ? 'remain' : 'remains'} in ${amountSkippedPlural ? 'their' : "it's"} original state.`);
            }
            return 0;
        });
    
    } else {
        console.log('Program terminated\n');
        return 0;
    }
})();


