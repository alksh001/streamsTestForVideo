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

        if (range) {
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
        } else {
            const total = stats.size;
            res.writeHead(200, {
                'Content-Length': total,
                'Content-Type': 'video/mp4'
            });
            const file = fs.createReadStream(filePath);
            file.pipe(res);
        }
    });
});

server.listen(3000, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log("Listening on port 3000");
    }
});
