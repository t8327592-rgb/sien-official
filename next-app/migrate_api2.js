const fs = require('fs');
const path = require('path');

const srcApiDir = path.join(__dirname, '..', 'api');
const destApiDir = path.join(__dirname, 'app', 'api');

function convertApi(content) {
    let converted = content;
    // Remove CommonJS requires completely
    converted = converted.replace(/const\s*{\s*kv\s*}\s*=\s*require\(['"]@vercel\/kv['"]\);/g, "");
    converted = converted.replace(/const\s+nodemailer\s*=\s*require\(['"]nodemailer['"]\);/g, "");
    
    // Replace export handler
    converted = converted.replace(/module\.exports\s*=\s*async\s*function\s*\(req,\s*res\)\s*\{/g, 'async function handleRequest(request: any, response: any) {');
    // For admin.js which might have 'export default async function handler' from previous mistake:
    converted = converted.replace(/export\s+default\s+async\s+function\s+handler\s*\([^)]*\)\s*\{/g, 'async function handleRequest(request: any, response: any) {');
    
    return `import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// --- Migrated Original Logic ---
${converted}

// --- App Router Adapter ---
export async function GET(request: Request) {
    return handleAdapter(request);
}
export async function POST(request: Request) {
    return handleAdapter(request);
}

async function handleAdapter(request: Request) {
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
            status: function(code: number) {
                (this as any).statusCode = code;
                return this;
            },
            json: function(data: any) {
                resolve(NextResponse.json(data, { status: (this as any).statusCode || 200 }));
            },
            send: function(data: any) {
                resolve(new NextResponse(data as any, { status: (this as any).statusCode || 200 }));
            },
            setHeader: function() {}
        };
        
        handleRequest(mockReq, mockRes).catch((err: any) => {
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
        fs.writeFileSync(path.join(targetDir, 'route.ts'), converted, 'utf8');
    }
});
