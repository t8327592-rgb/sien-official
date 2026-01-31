document.addEventListener('DOMContentLoaded', () => {
    console.log("SCRIPT - UI Control Mode");

    // --- 1. Navbar & UI Effects ---
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-menu a');
    if (navToggle) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => { if (navToggle.checked) navToggle.checked = false; });
        });
    }

    // Scroll Fade In
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.section-title, .hero h1, .hero-sub, .hero-scroll').forEach(el => {
        if (el.classList.contains('section-title') || el.closest('.hero')) {
            // Hero fade-in handled by CSS usually, but this ensures observer catches them if needed
        }
        if (el.classList.contains('section-title')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        }
    });

    // --- 2. Form Submission Handling (Order Page) ---
    const orderForm = document.getElementById('orderForm');
    const successMessage = document.getElementById('successMessage');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Clear previous errors
            const inputs = orderForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('input-error');
            });
            const errorMsgs = orderForm.querySelectorAll('.error-message');
            errorMsgs.forEach(msg => msg.remove());

            // 2. Validate Required Fields
            let isValid = true;
            let firstInvalidInput = null;

            const requiredInputs = orderForm.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                const isChecksum = input.type === 'checkbox' ? !input.checked : !input.value.trim();

                if (isChecksum) {
                    isValid = false;
                    input.classList.add('input-error');

                    const msg = document.createElement('span');
                    msg.className = 'error-message';
                    msg.innerText = 'この項目は入力必須です';

                    if (input.type === 'checkbox') {
                        input.parentElement.parentElement.appendChild(msg);
                    } else {
                        input.parentElement.appendChild(msg);
                    }

                    if (!firstInvalidInput) firstInvalidInput = input;
                }
            });

            if (!isValid) {
                if (firstInvalidInput) {
                    firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalidInput.focus();
                }
                return;
            }

            // 3. API Submission (Placeholder for new Vercel KV system)
            // TODO: Implement new submission logic here
            console.log("Form submitted (Waiting for new API implementation)");

            // Temporary UI feedback for testing interactions
            // const btn = orderForm.querySelector('button[type="submit"]');
            // btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
            // btn.disabled = true;
        });
    }

    // --- 3. Audio Player Logic (Mix Page) ---
    const playBtns = document.querySelectorAll('.play-btn');

    if (playBtns.length > 0) {
        playBtns.forEach(btn => {
            const sampleId = btn.getAttribute('data-sample');
            const audioBefore = document.getElementById(`audio-${sampleId}-before`);
            const audioAfter = document.getElementById(`audio-${sampleId}-after`);
            const seekBar = document.getElementById(`seek-${sampleId}`);
            const currTimeText = document.getElementById(`time-${sampleId}`);
            const totalTimeText = document.getElementById(`total-${sampleId}`);

            // State
            let activeAudio = audioBefore; // Default
            let isPlaying = false;

            // Helper: Switch Active Track
            const switchTrack = (newType) => {
                const prevAudio = activeAudio;
                const newAudio = newType === 'before' ? audioBefore : audioAfter;

                if (prevAudio === newAudio) return;

                // Sync time
                const currentTime = prevAudio.currentTime;
                newAudio.currentTime = currentTime;

                // Create seamless switch
                if (isPlaying) {
                    prevAudio.pause();
                    newAudio.play().catch(e => console.error("Playback failed:", e));
                } else {
                    prevAudio.pause(); // Ensure paused
                }

                activeAudio = newAudio;

                // Mute state for visual consistency
                audioBefore.muted = (newType !== 'before');
                audioAfter.muted = (newType !== 'after');
            };

            // Radio Change -> Switch Track
            const radios = document.getElementsByName(`sample${sampleId}-type`);
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    switchTrack(e.target.value);
                });
            });

            // Play/Pause
            btn.addEventListener('click', () => {
                if (activeAudio.paused) {
                    // Stop others
                    document.querySelectorAll('audio').forEach(a => {
                        if (a !== audioBefore && a !== audioAfter) {
                            a.pause();
                            a.currentTime = 0;
                        }
                    });
                    document.querySelectorAll('.play-btn').forEach(b => {
                        if (b !== btn) b.innerHTML = '<i class="fa-solid fa-play"></i>';
                    });

                    activeAudio.play().then(() => {
                        isPlaying = true;
                        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    }).catch(e => console.error("Play error:", e));
                } else {
                    activeAudio.pause();
                    isPlaying = false;
                    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                }
            });

            // Metadata loaded (Duration)
            const onMetadataLoaded = () => {
                if (activeAudio.duration && !isNaN(activeAudio.duration)) {
                    seekBar.max = activeAudio.duration;
                    totalTimeText.innerText = formatTime(activeAudio.duration);
                }
            };
            audioBefore.addEventListener('loadedmetadata', onMetadataLoaded);
            if (audioBefore.readyState >= 1) onMetadataLoaded();

            // Time Update
            const onTimeUpdate = (e) => {
                if (e.target !== activeAudio) return;
                const t = activeAudio.currentTime;
                seekBar.value = t;
                currTimeText.innerText = formatTime(t);
            };

            audioBefore.addEventListener('timeupdate', onTimeUpdate);
            audioAfter.addEventListener('timeupdate', onTimeUpdate);

            // Seek
            seekBar.addEventListener('input', () => {
                const seekTo = parseFloat(seekBar.value);
                activeAudio.currentTime = seekTo;
                const other = activeAudio === audioBefore ? audioAfter : audioBefore;
                other.currentTime = seekTo;
                currTimeText.innerText = formatTime(seekTo);
            });

            // End
            const onEnd = () => {
                isPlaying = false;
                btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                activeAudio.currentTime = 0;
                const other = activeAudio === audioBefore ? audioAfter : audioBefore;
                other.currentTime = 0;
                activeAudio.pause();
                other.pause();
                seekBar.value = 0;
                currTimeText.innerText = "0:00";
            };
            audioBefore.addEventListener('ended', onEnd);
            audioAfter.addEventListener('ended', onEnd);
        });
    }

    // Helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // --- 4. Works Page Tab Logic (UI Only) ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const catMix = document.getElementById('category-mix');
    const catOriginal = document.getElementById('category-original');
    const separator = document.getElementById('works-separator');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tab = btn.getAttribute('data-tab');

                if (tab === 'all') {
                    if (catMix) catMix.style.display = 'block';
                    if (catOriginal) catOriginal.style.display = 'block';
                    if (separator) separator.style.display = 'block';
                } else if (tab === 'mix') {
                    if (catMix) catMix.style.display = 'block';
                    if (catOriginal) catOriginal.style.display = 'none';
                    if (separator) separator.style.display = 'none';
                } else if (tab === 'original') {
                    if (catMix) catMix.style.display = 'none';
                    if (catOriginal) catOriginal.style.display = 'block';
                    if (separator) separator.style.display = 'none';
                }
            });
        });
    }

    // --- 5. Hero Background Video Cycle ---
    const bgVideos = document.querySelectorAll('.video-slide');
    if (bgVideos.length > 1) {
        let currentVidIdx = 0;
        setInterval(() => {
            bgVideos[currentVidIdx].classList.remove('active');
            currentVidIdx = (currentVidIdx + 1) % bgVideos.length;
            bgVideos[currentVidIdx].classList.add('active');
        }, 7000);
    }

    // --- 6. Dynamic Data Loading (Public API) & Show More Logic ---
    const SHOW_STEP = 3;

    class PagedSection {
        constructor(works, containerId, btnId, isAutoInit = true) {
            this.works = works || [];
            this.container = document.getElementById(containerId);
            this.btn = document.getElementById(btnId);
            this.shownCount = 0;

            if (this.container) {
                this.container.innerHTML = ''; // Clear initial
                if (this.btn) {
                    this.btn.addEventListener('click', () => this.showNext());
                    if (isAutoInit) this.showNext();
                } else {
                    // Fallback: Show all if no button (Legacy support for mix.html/original.html)
                    this.renderFull();
                }
            }
        }

        showNext() {
            const nextBatch = this.works.slice(this.shownCount, this.shownCount + SHOW_STEP);
            nextBatch.forEach(video => {
                this.container.appendChild(createWorkItem(video));
            });
            this.shownCount += nextBatch.length;
            this.updateButton();
        }

        updateButton() {
            if (this.shownCount >= this.works.length) {
                this.btn.style.display = 'none';
            } else {
                this.btn.style.display = 'inline-block';
            }
        }

        renderFull() {
            this.works.forEach(video => this.container.appendChild(createWorkItem(video)));
        }
    }

    const loadPublicData = async () => {
        try {
            const res = await fetch('/api/admin?type=public');
            if (!res.ok) return;
            const data = await res.json();

            // 1. Index Page (Combined List)
            new PagedSection(data.works, 'works-grid', 'index-works-more-btn');

            // 2. Mix Page - Production Achievements (Pagination)
            new PagedSection(data.mix, 'mix-portfolio', 'show-more-btn');

            // 3. Works Page (Full List - Reverted)
            // No pagination buttons anymore, so use renderFull or PagedSection with null button (which defaults to full in logic)
            new PagedSection(data.mix, 'works-mix-container', null);
            new PagedSection(data.orig, 'works-original-container', null);

            // 4. Original Page (Full List)
            new PagedSection(data.orig, 'original-portfolio', null);


            // 5. Update Prices
            if (data.prices) {
                Object.keys(data.prices).forEach(key => {
                    const el = document.getElementById(`price_${key}`);
                    if (el) el.innerText = data.prices[key];
                });
            }
        } catch (e) { console.error("Data load error", e); }
    };

    // Shared Item Creator
    const createWorkItem = (video) => {
        const item = document.createElement('div');
        item.className = 'work-item';
        item.innerHTML = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="work-title">${video.title || video.comment || ''}</p>
        `;
        return item;
    };

    loadPublicData();

    // --- 7. Form Submission (API) ---
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = orderForm.querySelectorAll('[required]');
            let valid = true;
            inputs.forEach(i => { if (!i.value) valid = false; });
            if (!valid) return alert('必須項目を入力してください');

            const btn = orderForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
            btn.disabled = true;

            try {
                const formData = new FormData(orderForm);
                const jsonData = Object.fromEntries(formData.entries());

                const res = await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonData)
                });

                if (res.ok) {
                    document.getElementById('input-area').style.display = 'none';
                    successMessage.classList.remove('hidden');
                    window.scrollTo(0, 0);
                } else {
                    throw new Error('Server returned error');
                }
            } catch (err) {
                alert('送信に失敗しました。時間をおいて再度お試しください。');
                console.error(err);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

});
