const fs = require('fs');

// 1. Remove from all HTML files
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !f.includes('mix_vercel'));
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const oldContent = content;
    content = content.replace(/<li class="theme-toggle-li">[\s\S]*?<\/li>/g, '');
    if (content !== oldContent) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Removed button from ' + f);
    }
});

// 2. Remove logic from script.js
let scriptJs = fs.readFileSync('script.js', 'utf8');
const darkLogicStart = '// Dark Mode Toggle';
const darkLogicEnd = '// Scroll Fade In';

if (scriptJs.includes(darkLogicStart)) {
    const startIndex = scriptJs.indexOf(darkLogicStart);
    const endIndex = scriptJs.indexOf(darkLogicEnd);
    if (endIndex > startIndex) {
        const toRemove = scriptJs.substring(startIndex, endIndex);
        scriptJs = scriptJs.replace(toRemove, '');
        fs.writeFileSync('script.js', scriptJs, 'utf8');
        console.log('Removed logic from script.js');
    }
}

// 3. Remove styles from style.css
let styleCss = fs.readFileSync('style.css', 'utf8');
const darkStyleRegex = /\/\* Dark Mode Variables \*\/[\s\S]*?\/\* Theme Toggle Button \*\/[\s\S]*?\.theme-toggle-btn:hover \{.*?\}/;
if (darkStyleRegex.test(styleCss)) {
    styleCss = styleCss.replace(darkStyleRegex, '');
    fs.writeFileSync('style.css', styleCss, 'utf8');
    console.log('Removed styles from style.css');
}
