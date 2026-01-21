document.addEventListener('DOMContentLoaded', () => {
    console.log("SCRIPT V5 - Final Static Mode");

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
            // For hero elements, they might check fade-in classes logic in css, 
            // but here we ensure observer finds them if needed. 
            // Actually css handles .fade-in animation on load for hero, 
            // observer mainly for scroll sections.
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
                // Check value (handle checkbox separately vs text)
                const isChecksum = input.type === 'checkbox' ? !input.checked : !input.value.trim();

                if (isChecksum) {
                    isValid = false;
                    input.classList.add('input-error');

                    // Create Error Message
                    const msg = document.createElement('span');
                    msg.className = 'error-message';
                    msg.innerText = 'この項目は入力必須です';

                    // Insert message
                    if (input.type === 'checkbox') {
                        input.parentElement.parentElement.appendChild(msg);
                    } else {
                        input.parentElement.appendChild(msg);
                    }

                    if (!firstInvalidInput) firstInvalidInput = input;
                }
            });

            if (!isValid) {
                // Scroll to first error
                if (firstInvalidInput) {
                    firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalidInput.focus();
                }
                return;
            }

            // 3. Netlify Submission (AJAX)
            const btn = orderForm.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
            btn.disabled = true;

            const formData = new FormData(orderForm);

            fetch('https://formspree.io/f/xaqqkwye', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
                .then(() => {
                    // Hide entire input area (form + notice + status)
                    const inputArea = document.getElementById('input-area');
                    if (inputArea) inputArea.style.display = 'none';

                    // Show success
                    successMessage.classList.remove('hidden');
                    orderForm.reset();
                    window.scrollTo(0, 0);
                })
                .catch((error) => {
                    alert('送信に失敗しました。時間をおいて再度お試しください。');
                    console.error('Submission error:', error);
                    btn.innerHTML = originalBtnText;
                    btn.disabled = false;
                });
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

                // Mute state for visual consistency (though we only play one)
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
                    // Stop others logic if needed (optional, keeping simple for mobile)
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

            // Time Update (only update UI if from active track)
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
                // Silently sync the other one
                const other = activeAudio === audioBefore ? audioAfter : audioBefore;
                other.currentTime = seekTo;

                currTimeText.innerText = formatTime(seekTo);
            });

            // End
            const onEnd = () => {
                isPlaying = false;
                btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                audioBefore.currentTime = 0;
                audioAfter.currentTime = 0;
                audioBefore.pause();
                audioAfter.pause();
                seekBar.value = 0;
                currTimeText.innerText = "0:00";
            };
            audioBefore.addEventListener('ended', onEnd);
            audioAfter.addEventListener('ended', onEnd);
        });
    }

    // --- 4. Portfolio Grid (Mix Page) ---
    const portfolioContainer = document.getElementById('mix-portfolio');
    const showMoreBtn = document.getElementById('show-more-btn');

    if (portfolioContainer && showMoreBtn) {
        const portfolioVideos = [
            'olpsRfUFdjw', // 1
            'voTuWFmcbeI', // 2
            'Le84jUtbRwo', // 3
            'E6bS-n2nx0g', // 4
            'u4rAEKOKeZA', // 5
            'tDUgj37HhOw', // 6
            'yRFFBglbLWo', // 7
            'ZYCwYSK0RK4', // 8
            'P06mDQyOs14'  // 9
        ];

        let loadedCount = 0;
        const loadStep = 3;

        const createVideoItem = (videoId) => {
            const item = document.createElement('div');
            item.className = 'work-item fade-in'; // Reuse work-item style + animation
            item.innerHTML = `
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
            return item;
        };

        const loadMore = () => {
            const nextBatch = portfolioVideos.slice(loadedCount, loadedCount + loadStep);

            nextBatch.forEach(vid => {
                const el = createVideoItem(vid);
                portfolioContainer.appendChild(el);
            });

            loadedCount += nextBatch.length;

            // Hide button if all loaded
            if (loadedCount >= portfolioVideos.length) {
                showMoreBtn.style.display = 'none';
            }
        };

        // Initial Load
        loadMore();

        // Button Event
        showMoreBtn.addEventListener('click', loadMore);
    }

    // --- 6. Hero Background Video Cycle ---
    const bgVideos = document.querySelectorAll('.video-slide');
    if (bgVideos.length > 1) {
        let currentVidIdx = 0;
        setInterval(() => {
            bgVideos[currentVidIdx].classList.remove('active');
            currentVidIdx = (currentVidIdx + 1) % bgVideos.length;
            bgVideos[currentVidIdx].classList.add('active');
        }, 7000);
    }
});
