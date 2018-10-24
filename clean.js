const fs = require('fs');

const OutputPath = __dirname + "/output";
const RawOutputPath = OutputPath + "/raw_0";
const RawDataListPath = RawOutputPath + "/list.json";

fs.readdir(OutputPath, (err, files) => {
    files.forEach((file) => {
        if (file != "raw_0" && file != ".gitignore")
        {
            const fullname = OutputPath + "/" + file;
            fs.unlink(fullname, (err) => {
                if (err) throw err;
                console.log(fullname + " deleted.")
            });
        }
    });
});

fs.readdir(RawOutputPath, (err, files) => {
    files.forEach((file) => {
        if (file != ".gitignore")
        {
            const fullname = RawOutputPath + "/" + file;
            fs.unlink(fullname, (err) => {
                if (err) throw err;
                console.log(fullname + " deleted.")
            });
        }
    });
});
