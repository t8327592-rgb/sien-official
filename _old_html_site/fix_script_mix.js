const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

// The original audio player logic
const targetLogic = `    // --- 3. Audio Player (Before/After) ---
    const playBtns = document.querySelectorAll('.play-btn');
    let activeAudio = null;
    let activeBtn = null;

    if (playBtns.length > 0) {
        playBtns.forEach(btn => {
            const sampleId = btn.getAttribute('data-sample');
            const audioBefore = document.getElementById(\`audio-\${sampleId}-before\`);
            const audioAfter = document.getElementById(\`audio-\${sampleId}-after\`);
            const seekBar = document.getElementById(\`seek-\${sampleId}\`);
            const currTimeText = document.getElementById(\`time-\${sampleId}\`);
            const totalTimeText = document.getElementById(\`total-\${sampleId}\`);

            let currentType = 'before'; // default
            let isPlaying = false;

            // Handle Radio Switch
            const switchTrack = (newType) => {
                const prevAudio = activeAudio;
                const newAudio = newType === 'before' ? audioBefore : audioAfter;
                
                if (prevAudio === newAudio) return;

                const currentTime = prevAudio.currentTime;
                
                if (isPlaying) {
                    prevAudio.pause();
                    newAudio.currentTime = currentTime;
                    newAudio.play();
                } else {
                    newAudio.currentTime = currentTime;
                }
                
                activeAudio = newAudio;
                currentType = newType;
            };

            const radios = document.getElementsByName(\`sample\${sampleId}-type\`);
            radios.forEach(r => {
                r.addEventListener('change', (e) => {
                    switchTrack(e.target.value);
                });
            });

            const formatTime = (sec) => {
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60).toString().padStart(2, '0');
                return \`\${m}:\${s}\`;
            };

            // Setup audio metadata
            const setupAudio = (audio) => {
                audio.addEventListener('loadedmetadata', () => {
                    if (audio === audioBefore) {
                        seekBar.max = audio.duration;
                        totalTimeText.innerText = formatTime(audio.duration);
                    }
                });
                audio.addEventListener('timeupdate', () => {
                    if (activeAudio === audio) {
                        seekBar.value = audio.currentTime;
                        currTimeText.innerText = formatTime(audio.currentTime);
                    }
                });
                audio.addEventListener('ended', () => {
                    if (activeAudio === audio) {
                        isPlaying = false;
                        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                        seekBar.value = 0;
                    }
                });
            };

            setupAudio(audioBefore);
            setupAudio(audioAfter);

            // Default active
            activeAudio = audioBefore;

            // Play / Pause
            btn.addEventListener('click', () => {
                if (isPlaying) {
                    activeAudio.pause();
                    isPlaying = false;
                    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                } else {
                    // Pause others
                    document.querySelectorAll('audio').forEach(a => a.pause());
                    document.querySelectorAll('.play-btn').forEach(b => b.innerHTML = '<i class="fa-solid fa-play"></i>');
                    
                    activeAudio.play();
                    isPlaying = true;
                    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                }
            });

            // Seek
            seekBar.addEventListener('input', () => {
                activeAudio.currentTime = seekBar.value;
            });
        });
    }`;

const newLogic = `    // --- 3. Audio Player (Before/After) with Wavesurfer ---
    const playBtns = document.querySelectorAll('.play-btn');
    let activeAudio = null;
    let activeBtn = null;

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
    }`;

if (content.includes('// --- 3. Audio Player (Before/After) ---')) {
    content = content.replace(targetLogic, newLogic);
    fs.writeFileSync('script.js', content, 'utf8');
    console.log('script.js mix logic updated');
} else {
    console.log('Could not find original mix logic in script.js');
}
