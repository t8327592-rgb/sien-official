const fs = require('fs');
const path = require('path');

const srcApiDir = path.join(__dirname, '..', 'api');
const destApiDir = path.join(__dirname, 'app', 'api');

if (!fs.existsSync(destApiDir)) fs.mkdirSync(destApiDir, { recursive: true });

function convertApi(content) {
    // Basic conversion from CommonJS (module.exports) to ES Module (export async function GET/POST)
    // This is a naive conversion, it assumes standard Vercel API structures.
    let converted = content;
    
    // Replace const { kv } = require('@vercel/kv'); with import { kv } from '@vercel/kv';
    converted = converted.replace(/const\s*{\s*kv\s*}\s*=\s*require\(['"]@vercel\/kv['"]\);/g, "import { kv } from '@vercel/kv';");
    
    // Replace nodemailer require
    converted = converted.replace(/const\s+nodemailer\s*=\s*require\(['"]nodemailer['"]\);/g, "import nodemailer from 'nodemailer';");
    
    // Handling module.exports = async function (req, res) {
    // We will extract the inner logic and wrap it in GET and POST handlers for Next.js App Router.
    // Since App Router uses `NextRequest` and `NextResponse`, we'll need to adapt it.
    // For a robust migration, it's safer to just write the adapter wrapper.
    
    return `import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// --- Migrated Original Logic ---
${content.replace(/module\.exports\s*=\s*async\s*function\s*\(req,\s*res\)\s*\{/g, 'async function handleRequest(req, res) {')}

// --- App Router Adapter ---
export async function GET(request) {
    return handleAdapter(request);
}
export async function POST(request) {
    return handleAdapter(request);
}

async function handleAdapter(request) {
    // Mock req/res for Vercel Serverless Function compatibility
    const url = new URL(request.url);
    const method = request.method;
    
    let body = {};
    if (method !== 'GET' && method !== 'HEAD') {
        try { body = await request.json(); } catch(e) {}
    }
    
    const query = Object.fromEntries(url.searchParams);
    
    const mockReq = {
        method,
        query,
        body,
        headers: Object.fromEntries(request.headers)
    };
    
    return new Promise((resolve) => {
        const mockRes = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                resolve(NextResponse.json(data, { status: this.statusCode || 200 }));
            },
            send: function(data) {
                resolve(new NextResponse(data, { status: this.statusCode || 200 }));
            },
            setHeader: function() {}
        };
        
        // Execute original logic
        handleRequest(mockReq, mockRes).catch(err => {
            console.error(err);
            resolve(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
        });
    });
}
`;
}

['admin.js', 'order.js', 'cron.js'].forEach(file => {
    const src = path.join(srcApiDir, file);
    if (fs.existsSync(src)) {
        const content = fs.readFileSync(src, 'utf8');
        const converted = convertApi(content);
        
        const routeName = file.replace('.js', '');
        const targetDir = path.join(destApiDir, routeName);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        fs.writeFileSync(path.join(targetDir, 'route.ts'), converted, 'utf8');
        console.log(`Migrated API: ${file} to ${routeName}/route.ts`);
    }
});
