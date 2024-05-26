// const fs = require('fs');
// const server = require('http').createServer();

// server.on('request', (req, res) => {
//     let readStram = fs.createReadStream('test.mp4');

//     // readStram.on('data', data => {
//     //     res.write(data);
//     // });

//     // Second method
//     readStram.pipe(res)
//     // readStram.on('end', () => {
//     //     res.end();
//     // });
//     // readStram.on('error', err => {
//     //     console.log(err);
//     // })
// });

// server.listen(3000, (err) => {
//     console.log("Listening");
// })


//  ************ If range is present *******************
const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {
    const filePath = 'test.mp4';
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error(err);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const { range } = req.headers;
        if (!range) {
            res.writeHead(416, { 'Content-Type': 'text/plain' });
            res.end('Requires Range header');
            return;
        }

        const positions = range.replace(/bytes=/, "").split("-");
        const start = parseInt(positions[0], 10);
        const total = stats.size;
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

        if (start >= total || end >= total) {
            res.writeHead(416, { 'Content-Type': 'text/plain' });
            res.end('Range Not Satisfiable');
            return;
        }

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });

        file.pipe(res);
    });
});

server.listen(3000, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log("Listening on port 3000");
    }
});


