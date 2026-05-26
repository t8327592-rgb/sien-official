const fs = require('fs');
let content = fs.readFileSync('mix.html', 'utf8');

// 1. Add wavesurfer.js
if (!content.includes('wavesurfer.js')) {
    content = content.replace(
        '<link rel="stylesheet" href="style.css?v=2026D">\n</head>',
        '<link rel="stylesheet" href="style.css?v=2026D">\n    <script src="https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js"></script>\n</head>'
    );
}

// 2. Replace seek-container with waveform container
const seekContainerRegex = /<div class="seek-container">[\s\S]*?<\/div>/;
const replacement = `<div class="seek-container" style="display:none;">
                        <span class="curr-time" id="time-1">0:00</span>
                        <input type="range" class="seek-bar" id="seek-1" value="0" min="0" max="100" step="0.1">
                        <span class="total-time" id="total-1">0:00</span>
                    </div>

                    <div style="position:relative; width: 100%; height: 60px; margin-top: 15px;">
                        <div id="waveform-1-before" style="position:absolute; top:0; left:0; width: 100%; height: 100%;"></div>
                        <div id="waveform-1-after" style="position:absolute; top:0; left:0; width: 100%; height: 100%; display:none;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-top:5px; width:100%;">
                        <span id="wave-time-1">0:00</span>
                        <span id="wave-total-1">0:00</span>
                    </div>`;

if (!content.includes('waveform-1-before') && seekContainerRegex.test(content)) {
    content = content.replace(seekContainerRegex, replacement);
}

fs.writeFileSync('mix.html', content, 'utf8');
console.log('mix.html fixed');
