const readlineSync = require("readline-sync");
const exif = require("exiftool");
const fs = require("fs");

const answer = readlineSync.question(`Run program? [yes / no]`);

if (answer === "yes") {
	fs.readFile("IMG_8632 (1).mov", (err, data) => {
		if (err){
            throw err;
        } 
		else {
			exif.metadata(data, ['-creationDate', '-createDate'], (err, metadata) => {
				if (err) {
                    throw err;
                }
				else {
                    console.log(metadata);
                }
			});
		}
	});
}
