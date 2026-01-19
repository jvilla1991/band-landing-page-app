const https = require('https');
const zlib = require('zlib');
const tar = require('tar-stream');
const fs = require('fs');
const path = require('path');

const extractPath = path.join(__dirname, 'node_modules', 'vite');
if (!fs.existsSync('node_modules')) fs.mkdirSync('node_modules');
if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });

https.get('https://registry.npmjs.org/vite/-/vite-4.5.3.tgz', (res) => {
  const extract = tar.extract();
  extract.on('entry', (header, stream, next) => {
    const filePath = path.join(extractPath, header.name.replace(/^package\//, ''));
    if (header.type === 'file') {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
    }
    stream.on('end', next);
    stream.resume();
  });
  extract.on('finish', () => console.log('Extracted Vite 4.5.3'));
  res.pipe(zlib.createGunzip()).pipe(extract);
});
