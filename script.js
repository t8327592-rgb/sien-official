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


            // 5. Update Dynamic Plans (New System)
            if (data.prices) {
                renderPublicPlans(data.prices.mix, 'plan-list-mix');
                renderPublicPlans(data.prices.orig, 'plan-list-orig');
            }

            // 6. Update Voices
            if (data.voices) {
                renderVoicesPublic(data.voices);
            }

        } catch (e) { console.error("Data load error", e); }
    };

    const renderVoicesPublic = (voices) => {
        const container = document.getElementById('voice-list-home');
        if (!container) return;
        container.innerHTML = '';

        if (!voices || voices.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#999; width:100%; padding:40px;">現在集計中です...</div>';
            return;
        }

        voices.forEach(v => {
            const card = document.createElement('div');
            card.className = 'voice-card';
            card.innerHTML = `
                <div class="voice-body">
                    <div class="voice-quote"><i class="fa-solid fa-quote-left"></i></div>
                    <p class="voice-text">${v.text}</p>
                </div>
                <div class="voice-footer">
                    <span class="voice-plan">${v.plan || 'Standard Plan'}</span>
                    <span class="voice-name">${v.name}様</span>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // --- 7. PLAN SYNC & SELECTION LOGIC ---

    // Global Selection Function
    window.selectPlan = (planName) => {
        localStorage.setItem('selectedPlan', planName);
        updatePlanUI(planName);

        // Update Buttons Visuals
        document.querySelectorAll('.plan-select-btn').forEach(btn => {
            if (btn.dataset.plan === planName) {
                // Active Style
                btn.style.background = 'var(--accent-blue)';
                btn.style.color = 'white';
                btn.innerHTML = '選択中';
            } else {
                // Reset Style
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-blue)'; // btn-outline default
                btn.innerHTML = 'このプランを選択';
            }
        });
    };

    const updatePlanUI = (planName) => {
        if (!planName) planName = localStorage.getItem('selectedPlan');
        if (!planName) return;

        // Header Badge
        let badge = document.getElementById('plan-select-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'plan-select-badge';
            badge.className = 'plan-badge';
            document.body.appendChild(badge);
        }
        badge.innerHTML = `<i class="fa-solid fa-check"></i> 選択中: ${planName}`;
        badge.style.display = 'flex';
        badge.onclick = () => { window.location.href = 'order.html'; }; // Quick link
        badge.style.cursor = 'pointer';

        // Floating Widget
        let widget = document.getElementById('plan-float-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'plan-float-widget';
            widget.className = 'plan-float-widget text-center';
            document.body.appendChild(widget);
        }
        widget.innerHTML = `
            <div class="plan-float-header">現在選択中のプラン</div>
            <div class="plan-float-title">${planName}</div>
            <a href="order.html" class="btn btn-primary btn-sm" style="width:100%;">ご依頼へ進む</a>
        `;
        widget.style.display = 'block';
    };

    // Auto-Run Check
    const checkPlanState = () => {
        // 1. Order Form Auto-Fill
        const planSelect = document.querySelector('select[name="プラン"]') || document.querySelector('select[name="plan"]') || document.getElementById('plan');

        if (planSelect) {
            const saved = sessionStorage.getItem('selectedPlan');
            if (saved) {
                // Normalize for matching
                const target = saved.trim().toLowerCase();
                let found = false;

                for (let i = 0; i < planSelect.options.length; i++) {
                    const optText = planSelect.options[i].text.toLowerCase();
                    const optVal = planSelect.options[i].value.toLowerCase();

                    // Match against value (e.g. 'standard'), text (e.g. 'スタンダードプラン'), or partial text
                    if (optVal === target || optText === target || optText.includes(target)) {
                        planSelect.selectedIndex = i;
                        found = true;
                        break;
                    }
                }

                // User Requirement: Clear after reflecting (Consume Once)
                if (found) {
                    // Consume Once - but keep for visual if needed?
                    // User requested "Consume Once" for form, but maybe keep for buttons?
                    // "Remove after reflecting".
                    localStorage.removeItem('selectedPlan');
                }
            }
        } else {
            // 2. Logic: Reset selection if NOT on order page
            // If we found a plan select, we assume we are ON the order page.
            // If not found, we are on another page (Mix, Works, Top).
            // Clear session to prevent sticky selection potentially confusing users later.
            localStorage.removeItem('selectedPlan');
            const badge = document.getElementById('plan-select-badge');
            if (badge) badge.style.display = 'none';
            const widget = document.getElementById('plan-float-widget');
            if (widget) widget.style.display = 'none';
        }
    };
    // Call immediately
    checkPlanState();

    const renderPublicPlans = (plans, containerId) => {
        const container = document.getElementById(containerId);
        if (!container || !plans || !Array.isArray(plans)) return;

        container.innerHTML = '';
        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'price-card';
            if (plan.recommended) card.classList.add('featured');

            // Interactive
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
                selectPlan(plan.title);
                document.querySelectorAll('.price-card').forEach(c => c.style.borderColor = '');
                card.style.borderColor = 'var(--accent-blue)';
            };

            const badgeText = plan.badgeText || '人気';
            const badgeHTML = plan.recommended ? `<div class="badge">${badgeText}</div>` : '';

            card.innerHTML = `
                ${badgeHTML}
                <h3>${plan.title}</h3>
                <p class="price">${plan.price}</p>
                <p class="price-desc">${plan.desc || ''}</p>
                
                <div style="margin-top:auto; padding-top:15px; border-top:1px dashed #eee; font-size:0.9rem; color:#666;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span><i class="fa-regular fa-clock"></i> 納期</span>
                        <span>${plan.period}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span><i class="fa-solid fa-rotate-right"></i> リテイク</span>
                        <span>${plan.revisions || plan.limit}</span>
                    </div>
                </div>
                <!-- Selection Button -->
                <div style="margin-top:15px; text-align:center;">
                     <button class="btn btn-outline btn-sm plan-select-btn" data-plan="${plan.title}" style="width:100%; border-radius:20px;" onclick="selectPlan('${plan.title}')">このプランを選択</button>
                </div>
            `;
            container.appendChild(card);
        });

        // RE-APPLY SELECTION STATE after render
        const current = localStorage.getItem('selectedPlan');
        if (current) updatePlanUI(current);
    };

    // Shared Item Creator
    const createWorkItem = (video) => {
        const item = document.createElement('div');
        item.className = 'work-item';
        // Ensure flex column layout in CSS for vertical alignment
        item.innerHTML = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="work-title" style="margin-bottom: 5px;">${video.title || video.comment || ''}</p>
            <p class="work-role" style="font-size: 0.8rem; color: #666; padding: 0 15px 15px; margin-top: auto;">${video.role || 'ミックス／マスタリング'}</p>
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
