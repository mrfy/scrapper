const fs = require('fs');
const path = require('path');

function readFiles(dir, processFile) {
    // read directory
    fs.readdir(dir, (error, fileNames) => {
        if (error) throw error;

        fileNames.forEach(filename => {
            // get current file name
            const name = path.parse(filename).name;
            // get current file extension
            const ext = path.parse(filename).ext;
            // get current file path
            const filepath = path.resolve(dir, filename);

            // get information about the file
            fs.stat(filepath, function (error, stat) {
                if (error) throw error;

                // check if the current path is a file or a folder
                const isFile = stat.isFile();

                // exclude folders
                if (isFile) {
                    // callback, do something with the file
                    processFile(filepath, name, ext, stat);
                }
            });
        });
    });
}

var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

readFiles('D:/Examples/puppetter/testDir', (filepath, name, ext, stat) => {
    fs.readFile(filepath, 'utf-8', function (err, content) {
        if (err) {
            console.log(err)
            return;
        }

        const line = content.split('\r\n').map(row => {
            const [name, mailTo, phone] = row.split(',')
            console.log()
            let mail = ''
            let phoneNo = ''
            if (mailTo) {
                const [f, maile] = mailTo.split(':')
                mail = maile
            }

            if (phone) {
                phoneNo = phone
            }
            return [name, mail, phoneNo].join(',')
        })
        console.log('LINE', line)
        logger.write(`${line.join('\n')}\n`)
    });

    // var readStream = fs.createReadStream(filepath, 'utf8');
    // readStream.on('data', function (chunk) {
    //     logger.write(chunk)
    // }).on('end', function () {

    //     // console.log(data);
    // });

    // console.log('file path:', filepath);
    // console.log('file name:', name);
    // console.log('file extension:', ext);
    // console.log('file information:', stat);
});

