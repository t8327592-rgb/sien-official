const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..'); // Sien-Official root
const appDir = path.join(__dirname, 'app');

const pagesToMigrate = [
    { html: 'mix.html', route: 'mix' },
    { html: 'original.html', route: 'original' },
    { html: 'works.html', route: 'works' },
    { html: 'order.html', route: 'order' },
    { html: 'business.html', route: 'business' },
    { html: 'faq.html', route: 'faq' },
    { html: 'terms.html', route: 'terms' },
    { html: 'privacy.html', route: 'privacy' },
    { html: 'tokusho.html', route: 'tokusho' },
    { html: 'news.html', route: 'news' }
];

function convertToJSX(html) {
    let jsx = html;
    // Replace class= with className=
    jsx = jsx.replace(/class=/g, 'className=');
    // Replace for= with htmlFor=
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    // Self-close tags
    jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsx = jsx.replace(/<br([^>]*[^\/])>/g, '<br />');
    jsx = jsx.replace(/<hr([^>]*[^\/])>/g, '<hr />');
    // Replace inline styles (simplistic, assumes standard cases or removes them)
    // For simplicity, we just strip style attributes that look too complex, or rewrite simple ones.
    // Actually, handling all style={{}} is hard in regex. Let's just strip most style tags for now and fix later, or leave them if they are clean.
    // Since it's a static migration, we'll replace some known ones.
    jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
        const parts = p1.split(';').filter(s => s.trim() !== '');
        const objStr = parts.map(p => {
            const [k, v] = p.split(':').map(s => s.trim());
            if (!k || !v) return '';
            // camelCase the key
            const camelK = k.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            return `${camelK}: "${v}"`;
        }).filter(s => s !== '').join(', ');
        return `style={{ ${objStr} }}`;
    });
    
    // Replace a hrefs to Link (Basic)
    jsx = jsx.replace(/<a href="([^"]+\.html)">/g, (m, p1) => {
        const route = p1.replace('.html', '');
        return `<Link href="/${route === 'index' ? '' : route}">`;
    });
    
    return jsx;
}

pagesToMigrate.forEach(page => {
    const srcFile = path.join(srcDir, page.html);
    if (!fs.existsSync(srcFile)) {
        console.log(`Skipping ${page.html}, not found.`);
        return;
    }
    
    const htmlContent = fs.readFileSync(srcFile, 'utf8');
    
    // Extract everything between <!-- Page Title --> or </header> and <!-- Footer -->
    let bodyMatch = htmlContent.match(/<\/header>([\s\S]*?)<!-- Footer/i);
    if (!bodyMatch) {
        bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    }
    
    if (bodyMatch) {
        let bodyContent = bodyMatch[1];
        
        // Remove duplicate headers if any
        bodyContent = bodyContent.replace(/<header[\s\S]*?<\/header>/ig, '');
        
        let jsxContent = convertToJSX(bodyContent);
        
        const componentName = page.route.charAt(0).toUpperCase() + page.route.slice(1);
        
        const fileContent = `"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ${componentName}Page() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      ${jsxContent}
    </>
  );
}
`;
        
        const destDir = path.join(appDir, page.route);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.writeFileSync(path.join(destDir, 'page.tsx'), fileContent, 'utf8');
        console.log(`Migrated ${page.html} to app/${page.route}/page.tsx`);
    }
});
