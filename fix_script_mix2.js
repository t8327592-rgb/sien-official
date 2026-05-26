const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

const targetLogicStart = '// --- 3. Audio Player Logic (Mix Page) ---';
const targetLogicEnd = '// --- 4. Index Scroll Indicator ---';

if (content.includes(targetLogicStart) && content.includes('// --- 4. Portfolio Tabs & Grid (Works Page) ---')) {
    const startIndex = content.indexOf(targetLogicStart);
    const endIndex = content.indexOf('// --- 4. Portfolio Tabs & Grid (Works Page) ---');
    
    if (startIndex !== -1 && endIndex !== -1) {
        const oldLogic = content.substring(startIndex, endIndex);
        
        const newLogic = `// --- 3. Audio Player Logic (Mix Page) with Wavesurfer ---
    const playBtns = document.querySelectorAll('.play-btn');

    if (playBtns.length > 0 && typeof WaveSurfer !== 'undefined') {
        playBtns.forEach(btn => {
            const sampleId = btn.getAttribute('data-sample');
            const audioBeforeUrl = document.getElementById(\`audio-\${sampleId}-before\`)?.getAttribute('src');
            const audioAfterUrl = document.getElementById(\`audio-\${sampleId}-after\`)?.getAttribute('src');
            
            if (!audioBeforeUrl || !audioAfterUrl) return;

            const containerBefore = document.getElementById(\`waveform-\${sampleId}-before\`);
            const containerAfter = document.getElementById(\`waveform-\${sampleId}-after\`);
            const currTimeText = document.getElementById(\`wave-time-\${sampleId}\`);
            const totalTimeText = document.getElementById(\`wave-total-\${sampleId}\`);
            
            let currentType = 'before';
            let isPlaying = false;

            const wsBefore = WaveSurfer.create({
                container: containerBefore,
                waveColor: '#9ca3af',
                progressColor: '#3b82f6',
                cursorColor: '#1e40af',
                barWidth: 2,
                barRadius: 2,
                height: 60,
                url: audioBeforeUrl
            });

            const wsAfter = WaveSurfer.create({
                container: containerAfter,
                waveColor: '#9ca3af',
                progressColor: '#06b6d4',
                cursorColor: '#0891b2',
                barWidth: 2,
                barRadius: 2,
                height: 60,
                url: audioAfterUrl
            });

            let activeWs = wsBefore;

            const formatTime = (sec) => {
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60).toString().padStart(2, '0');
                return \`\${m}:\${s}\`;
            };

            const updateTime = (time) => {
                if (currTimeText) currTimeText.innerText = formatTime(time);
            };

            wsBefore.on('ready', (dur) => { if(totalTimeText) totalTimeText.innerText = formatTime(dur); });
            wsBefore.on('audioprocess', updateTime);
            wsBefore.on('seek', (prog) => updateTime(prog * wsBefore.getDuration()));
            
            wsAfter.on('audioprocess', updateTime);
            wsAfter.on('seek', (prog) => updateTime(prog * wsAfter.getDuration()));

            wsBefore.on('finish', () => { isPlaying = false; btn.innerHTML = '<i class="fa-solid fa-play"></i>'; });
            wsAfter.on('finish', () => { isPlaying = false; btn.innerHTML = '<i class="fa-solid fa-play"></i>'; });

            const radios = document.getElementsByName(\`sample\${sampleId}-type\`);
            radios.forEach(r => {
                r.addEventListener('change', (e) => {
                    const newType = e.target.value;
                    const prevWs = activeWs;
                    activeWs = newType === 'before' ? wsBefore : wsAfter;
                    
                    const currentTime = prevWs.getCurrentTime();
                    
                    containerBefore.style.display = newType === 'before' ? 'block' : 'none';
                    containerAfter.style.display = newType === 'after' ? 'block' : 'none';

                    if (isPlaying) {
                        prevWs.pause();
                        activeWs.play();
                        activeWs.seekTo(currentTime / activeWs.getDuration());
                    } else {
                        activeWs.seekTo(currentTime / activeWs.getDuration());
                    }
                    currentType = newType;
                });
            });

            btn.addEventListener('click', () => {
                if (isPlaying) {
                    activeWs.pause();
                    isPlaying = false;
                    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                } else {
                    activeWs.play();
                    isPlaying = true;
                    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                }
            });
            
            // Apply theme buttons
            btn.classList.add('wave-play-btn');
            btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
    }

    `;
        
        content = content.replace(oldLogic, newLogic);
        fs.writeFileSync('script.js', content, 'utf8');
        console.log('script.js mix logic replaced');
    }
} else {
    console.log('Target section not found');
}
