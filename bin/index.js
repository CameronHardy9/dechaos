#! /usr/bin/env node

const readlineSync = require("readline-sync");
const exif = require("exiftool");
const fs = require("fs");
const path = require('path');
const process = require('process');
const cliProgress = require('cli-progress');

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let progress = 0

const input = process.argv[2];
const dir = path.resolve(process.cwd(), input);


fs.readdir(dir, (err, files) => {
    if(err){
        console.log(err);
    } else{
        console.log(files.length);
    }
  });

// if (answer === "yes") {
// 	fs.readFile("IMG_8632 (1).mov", (err, data) => {
// 		if (err){
//             throw err;
//         } 
// 		else {
// 			exif.metadata(data, ['-creationDate', '-createDate'], (err, metadata) => {
// 				if (err) {
//                     throw err;
//                 }
// 				else {
//                     console.log(metadata);
//                 }
// 			});
// 		}
// 	});
// }
