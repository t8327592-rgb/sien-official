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

            // --- Value Mapping for Auto-Reply Email ---
            // Map internal values to Japanese display text
            const mappings = {
                '希望する連絡手段': {
                    'twitter_dm': 'Twitter DM',
                    'email': 'メール'
                },
                'プラン': {
                    'standard': 'スタンダードプラン',
                    'one_chorus': 'ワンコーラスプラン',
                    'short': 'ショート動画用MIX',
                    'speed': 'スピードプラン',
                    'super_speed': '超スピードプラン',
                    'collab': 'コラボ・合唱プラン',
                    'original_std': 'オリジナル楽曲 スタンダード',
                    'original_lyrics': 'オリジナル楽曲 作詞持ち込み',
                    'other': 'その他・ご相談'
                },
                'キー変更': {
                    '0': '原キー (±0)'
                    // numbers like +1, -1 are fine as is
                },
                'お支払い方法': {
                    'bank_transfer': '銀行振込',
                    'credit_card': 'クレジットカード'
                }
            };

            // Apply mappings
            for (const [fieldName, mapObj] of Object.entries(mappings)) {
                const val = formData.get(fieldName);
                if (val && mapObj[val]) {
                    formData.set(fieldName, mapObj[val]);
                }
            }

            fetch('https://ssgform.com/s/oUyPUuSmLYCq', {
                method: 'POST',
                mode: 'no-cors', // Important: SSGform likely redirects or doesn't support CORS JSON, so we use no-cors to allow submission without error
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

            // Metadata loaded (Duration)
            const onMetadataLoaded = () => {
                if (activeAudio.duration && !isNaN(activeAudio.duration)) {
                    seekBar.max = activeAudio.duration;
                    totalTimeText.innerText = formatTime(activeAudio.duration);
                }
            };
            audioBefore.addEventListener('loadedmetadata', onMetadataLoaded);
            // In case already loaded
            if (audioBefore.readyState >= 1) onMetadataLoaded();

            // Time Update (only update UI if from active track)
            const onTimeUpdate = (e) => {
                if (e.target !== activeAudio) return;
                const t = activeAudio.currentTime;
                // Avoid seek fighting
                // Only update if not currently dragging? 
                // Using 'input' event for drag usually handles this naturally if updates are frequent.
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
                activeAudio.currentTime = 0; // Use activeAudio
                const other = activeAudio === audioBefore ? audioAfter : audioBefore;
                other.currentTime = 0;

                activeAudio.pause();
                other.pause(); // Ensure both pause

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

    // --- 4. Portfolio Data & Rendering ---

    // Mix Videos Data
    const portfolioVideos = [
        { id: 'olpsRfUFdjw', title: '[歌ってみた]Campus mode!!/初星学園 ❴ぽぷ・にゃーちふぃんど/月見ひひと/純粋なの/re;BON❵' },
        { id: 'voTuWFmcbeI', title: 'いーあるふぁんくらぶ / ぷりあま Cover【歌ってみた】' },
        { id: 'Le84jUtbRwo', title: '【子ﾗｲｵﾝ♀が】けっかおーらい/ヴィジランテOP【描いて歌ってみた】VTuber Cover' },
        { id: 'E6bS-n2nx0g', title: '【歌ってみた】天才 / SMITH(すみす)' },
        { id: 'u4rAEKOKeZA', title: '火ノ要鎮 / 平田義久 - じょん【歌ってみた】' },
        { id: 'tDUgj37HhOw', title: '白い雪のプリンセスは Covered by 草刈七海' },
        { id: 'yRFFBglbLWo', title: 'キラー（Cover）/とうにこ' },
        { id: 'ZYCwYSK0RK4', title: '【歌ってみた】ダーリンゲームオーバーラブ / ウルハシスティー' },
        { id: 'P06mDQyOs14', title: 'きゅうくらりん / 田中バター【歌ってみた】' }
    ];

    // Original Videos Data
    const originalVideos = [
        { id: 'Rc531IszCes', title: '【ボカデュオ2024】夜明けのアステロイド / YOFUKASHI 【オリジナル】' },
        { id: 'zTxvMNXaFoA', title: '【誕生日MV】ハッピーエンドクリエイター！ - 草刈七海【オリジナル曲】' },
        { id: 'Ke1HAX8Z49I', title: '週末を待て。『SODA』Music Video' }
    ];

    const createVideoItem = (video) => {
        const item = document.createElement('div');
        item.className = 'work-item';
        item.innerHTML = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="work-title">${video.title}</p>
        `;
        return item;
    };


    // >>>> Logic for MIX Page (mix.html)
    const portfolioContainer = document.getElementById('mix-portfolio');
    const showMoreBtn = document.getElementById('show-more-btn');

    if (portfolioContainer && showMoreBtn) {
        let loadedCount = 0;
        const loadStep = 3;

        const loadMore = () => {
            const nextBatch = portfolioVideos.slice(loadedCount, loadedCount + loadStep);
            nextBatch.forEach(vid => {
                portfolioContainer.appendChild(createVideoItem(vid));
            });
            loadedCount += nextBatch.length;
            if (loadedCount >= portfolioVideos.length) {
                showMoreBtn.style.display = 'none';
            }
        };
        loadMore();
        showMoreBtn.addEventListener('click', loadMore);
    }

    // >>>> Logic for ORIGINAL Page (original.html)
    const originalPortfolioContainer = document.getElementById('original-portfolio');
    if (originalPortfolioContainer) {
        originalVideos.forEach(video => {
            originalPortfolioContainer.appendChild(createVideoItem(video));
        });
    }

    // >>>> Logic for WORKS Page (works.html) - New!
    const worksMixContainer = document.getElementById('works-mix-container');
    const worksOriginalContainer = document.getElementById('works-original-container');

    if (worksMixContainer) {
        portfolioVideos.forEach(video => {
            worksMixContainer.appendChild(createVideoItem(video));
        });
    }
    if (worksOriginalContainer) {
        originalVideos.forEach(video => {
            worksOriginalContainer.appendChild(createVideoItem(video));
        });
    }

    // --- Works Page Tab Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const catMix = document.getElementById('category-mix');
    const catOriginal = document.getElementById('category-original');
    const separator = document.getElementById('works-separator');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Remove active class
                tabBtns.forEach(b => b.classList.remove('active'));
                // 2. Add active class
                btn.classList.add('active');

                // 3. Filter
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
