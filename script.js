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

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
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

            // Logic to sync mute state
            const syncVolume = () => {
                const type = document.querySelector(`input[name="sample${sampleId}-type"]:checked`).value;
                if (type === 'before') {
                    audioBefore.muted = false;
                    audioAfter.muted = true;
                } else {
                    audioBefore.muted = true;
                    audioAfter.muted = false;
                }
            };
            syncVolume();

            // Format time helper
            const formatTime = (t) => {
                if (isNaN(t)) return "0:00";
                const m = Math.floor(t / 60);
                const s = Math.floor(t % 60);
                return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            // Set duration
            const setDuration = () => {
                if (!isNaN(audioBefore.duration)) {
                    totalTimeText.innerText = formatTime(audioBefore.duration);
                    seekBar.max = audioBefore.duration;
                }
            };
            audioBefore.addEventListener('loadedmetadata', setDuration);
            if (audioBefore.readyState >= 1) setDuration();

            // Play/Pause
            btn.addEventListener('click', () => {
                if (audioBefore.paused) {
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

                    // Play both
                    audioBefore.play();
                    audioAfter.play();
                    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                } else {
                    // Pause both
                    audioBefore.pause();
                    audioAfter.pause();
                    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                }
            });

            // Update Time (Master: Before)
            audioBefore.addEventListener('timeupdate', () => {
                const t = audioBefore.currentTime;
                seekBar.value = t;
                currTimeText.innerText = formatTime(t);
                // Sync check
                if (Math.abs(audioAfter.currentTime - t) > 0.15) {
                    audioAfter.currentTime = t;
                }
            });

            // Seek
            seekBar.addEventListener('input', () => {
                const seekTo = parseFloat(seekBar.value);
                audioBefore.currentTime = seekTo;
                audioAfter.currentTime = seekTo;
                currTimeText.innerText = formatTime(seekTo);
            });

            // Radio Change -> sync volume
            const radios = document.getElementsByName(`sample${sampleId}-type`);
            radios.forEach(radio => {
                radio.addEventListener('change', syncVolume);
            });

            // End
            const onEnd = () => {
                btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                audioBefore.currentTime = 0;
                audioAfter.currentTime = 0;
                audioBefore.pause();
                audioAfter.pause();
                seekBar.value = 0;
                currTimeText.innerText = "0:00";
            };
            audioBefore.addEventListener('ended', onEnd);
        });
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
