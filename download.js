const https = require('https');
const fs = require('fs');

const files = [
    'index.html',
    'mix.html',
    'admin.html',
    'works.html',
    'news.html',
    'news-detail.html',
    'order.html',
    'business.html',
    'faq.html',
    'terms.html',
    'privacy.html',
    'tokusho.html'
];

function download(filename) {
    return new Promise((resolve, reject) => {
        https.get('https://sien-official.vercel.app/' + filename, (res) => {
            let data = Buffer.alloc(0);
            res.on('data', chunk => {
                data = Buffer.concat([data, chunk]);
            });
            res.on('end', () => {
                fs.writeFileSync(filename, data);
                console.log('Downloaded: ' + filename);
                resolve();
            });
        }).on('error', err => {
            reject(err);
        });
    });
}

async function main() {
    for (const f of files) {
        await download(f);
    }
    console.log('All downloads completed safely.');
}

main();
