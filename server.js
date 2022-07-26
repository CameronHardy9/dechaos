const readlineSync = require('readline-sync');
const ExifImage = require('exif').ExifImage;

const answer = readlineSync.question(`Run program? [yes / no]`);

if(answer === "yes"){
    try {
        new ExifImage({ image : '/Users/cameron/repos/Node_Repos/photo_organizer/64567092333__597C6E89-C468-4281-8415-C6858A012572.jpeg' }, function (error, exifData) {
            if (error)
                console.log('Error: ' + error.message);
            else
                console.log(exifData); // Do something with your data!
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
}

  

  