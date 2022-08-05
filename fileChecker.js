const exif = require("exiftool");
const fs = require("fs");
const path = require('path');


const data = fs.readFileSync(path.resolve(__dirname, './sample_files/check3.mov'));
        
    exif.metadata(data, ['-DateTimeOriginal'], (err, metadata) => {
        if (err) {
                console.log(err);
            }
        else {
            console.log(metadata);
            }
    });