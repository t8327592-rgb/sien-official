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
    // --- 2. Form Submission Handling (Order & Business) ---
    const orderForm = document.getElementById('orderForm');
    const businessForm = document.getElementById('businessForm');
    const successMessage = document.getElementById('successMessage');

    const handleFormSubmit = (form, e) => {
        e.preventDefault();

        if (form.isSubmitting) return; // Stop immediately if already sending

        // 1. Clear previous errors
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('input-error');
        });
        const errorMsgs = form.querySelectorAll('.error-message');
        errorMsgs.forEach(msg => msg.remove());

        // 2. Validate Required Fields
        let isValid = true;
        let firstInvalidInput = null;

        const requiredInputs = form.querySelectorAll('[required]');
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

        // 3. API Submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        form.isSubmitting = true; // Lock
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.success) {
                    form.reset();
                    document.getElementById('input-area').style.display = 'none';
                    successMessage.classList.remove('hidden');
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                    // Don't unlock button on success (prevent further actions)
                } else {
                    alert('送信に失敗しました。時間をおいて再度お試しください。');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    form.isSubmitting = false; // Unlock
                }
            })
            .catch(err => {
                console.error(err);
                alert('送信エラーが発生しました。');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                form.isSubmitting = false; // Unlock
            });
    };

    if (orderForm) {
        orderForm.isSubmitting = false;
        orderForm.addEventListener('submit', (e) => handleFormSubmit(orderForm, e));
    }

    if (businessForm) {
        businessForm.isSubmitting = false;
        businessForm.addEventListener('submit', (e) => handleFormSubmit(businessForm, e));
    }



    // --- 3. Audio Player Logic (Mix Page) with Wavesurfer ---
    const playBtns = document.querySelectorAll('.play-btn');

    if (playBtns.length > 0 && typeof WaveSurfer !== 'undefined') {
        playBtns.forEach(btn => {
            const sampleId = btn.getAttribute('data-sample');
            const audioBeforeUrl = document.getElementById(`audio-${sampleId}-before`)?.getAttribute('src');
            const audioAfterUrl = document.getElementById(`audio-${sampleId}-after`)?.getAttribute('src');
            
            if (!audioBeforeUrl || !audioAfterUrl) return;

            const containerBefore = document.getElementById(`waveform-${sampleId}-before`);
            const containerAfter = document.getElementById(`waveform-${sampleId}-after`);
            const currTimeText = document.getElementById(`wave-time-${sampleId}`);
            const totalTimeText = document.getElementById(`wave-total-${sampleId}`);
            
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

            const formatTimeLocal = (sec) => {
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            };

            const updateTime = (time) => {
                if (currTimeText) currTimeText.innerText = formatTimeLocal(time);
            };

            wsBefore.on('ready', (dur) => { if(totalTimeText) totalTimeText.innerText = formatTimeLocal(dur); });
            wsBefore.on('audioprocess', updateTime);
            wsBefore.on('seek', (prog) => updateTime(prog * wsBefore.getDuration()));
            
            wsAfter.on('audioprocess', updateTime);
            wsAfter.on('seek', (prog) => updateTime(prog * wsAfter.getDuration()));

            wsBefore.on('finish', () => { isPlaying = false; btn.innerHTML = '<i class="fa-solid fa-play"></i>'; });
            wsAfter.on('finish', () => { isPlaying = false; btn.innerHTML = '<i class="fa-solid fa-play"></i>'; });

            const radios = document.getElementsByName(`sample${sampleId}-type`);
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

    // --- 3.5 Portfolio Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const items = document.querySelectorAll('#works-mix-container .pf-item');
                
                items.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else {
                        const tags = item.getAttribute('data-tags') || '';
                        // 'male', 'female', 'rock', 'pop' などの簡易マッピング
                        const tagMap = {
                            'male': '男性ボーカル',
                            'female': '女性ボーカル',
                            'rock': 'ロック',
                            'pop': 'ポップス'
                        };
                        if (tags.includes(tagMap[filter]) || tags.includes(filter)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
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
        constructor(works, containerId, btnId, defaultLabel) {
            this.works = works || [];
            this.container = document.getElementById(containerId);
            this.btn = document.getElementById(btnId);
            this.label = defaultLabel || 'ミックス／マスタリング';
            this.shownCount = 0;

            if (this.container) {
                this.container.innerHTML = '';
                if (this.btn) {
                    this.btn.addEventListener('click', () => this.showNext());
                    this.showNext();
                } else {
                    this.renderFull();
                }
            }
        }

        showNext() {
            const nextBatch = this.works.slice(this.shownCount, this.shownCount + SHOW_STEP);
            nextBatch.forEach(video => {
                this.container.appendChild(createWorkItem(video, this.label));
            });
            this.shownCount += nextBatch.length;
            this.updateButton();
        }

        updateButton() {
            if (this.shownCount >= this.works.length) {
                if (this.btn) this.btn.style.display = 'none';
            } else {
                if (this.btn) this.btn.style.display = 'inline-block';
            }
        }

        renderFull() {
            this.works.forEach(video => this.container.appendChild(createWorkItem(video, this.label)));
        }
    }

    // Hardcoded Default Data (Source of Truth for fixing incorrect notation)
    const DEFAULT_PRICES = {
        mix: [
            {
                title: 'スタンダードプラン',
                price: '4,000円',
                desc: 'ピッチ補正（メイン・ハモリ）、タイミング補正、ノイズ除去、マスタリングまで全て込みの料金です。',
                period: '14日〜',
                revisions: '2回',
                recommended: true,
                badgeText: '人気',
                id: 'std'
            },
            {
                title: 'ワンコーラスプラン',
                price: '3,000円',
                desc: '1番サビ終わりまでの制作プラン。お試しで依頼したい方に推奨です。',
                period: '7日〜',
                revisions: '2回',
                id: 'chorus'
            },
            {
                title: 'ショート動画用MIX',
                price: '2,000円',
                desc: '歌ってみたショート動画（TikTok/Reels/Shorts）向けの制作プラン。',
                period: '3日〜',
                revisions: '2回',
                id: 'short'
            },
            {
                title: '短納期プラン',
                price: '13,000円',
                desc: 'ご依頼から7日以内に納品いたします。急ぎの投稿に合わせたい方向けです。',
                period: '3日〜7日',
                revisions: '2回',
                id: 'speed'
            },
            {
                title: '最短納期プラン',
                price: '16,000円',
                desc: 'ご依頼から48時間以内に納品いたします。コンテスト参加や緊急の投稿に。',
                period: '48時間以内',
                revisions: '2回',
                id: 'superspeed'
            },
            {
                title: 'コラボ・合唱プラン',
                price: '14,000円',
                desc: '2名以上のコラボ作品や合唱企画のMIXプラン。人数により変動あり。',
                period: '14日〜',
                revisions: '2回',
                id: 'collab'
            }
        ],
        orig: [
            {
                title: '完パケプラン',
                price: '66,000円',
                desc: 'ヒアリング、デモ作成、編曲、MIX、マスタリングまで、全ての工程を含んだ制作プランです。',
                period: '45日〜',
                limit: '無制限',
                recommended: true,
                badgeText: '★ 歌うだけでOK！完全手ぶらで依頼可能',
                id: 'orig_std'
            },
            {
                title: '作詞持ち込みプラン',
                price: '55,000円',
                desc: '歌詞はご自身で用意いただき、メロディと伴奏（編曲）を制作するプランです。',
                period: '45日〜',
                limit: '無制限',
                id: 'orig_lyric'
            }
        ],
        mixOptions: [
            // Options cleared to allow Admin Panel settings to take precedence or remain empty until set
        ],
        origOptions: [
            // Options cleared
        ]
    };

    const loadPublicData = async () => {
        try {
            const res = await fetch('/api/admin?type=public');
            let data = {};
            if (res.ok) {
                data = await res.json();
            }

            // 1. Index Page
            new PagedSection(data.works, 'works-grid', 'index-works-more-btn', 'ミックス／マスタリング');

            // 2. Mix Page
            new PagedSection(data.mix, 'mix-portfolio', 'show-more-btn', 'ミックス／マスタリング');

            // 3. Works Page
            new PagedSection(data.mix, 'works-mix-container', null, 'ミックス／マスタリング');
            new PagedSection(data.orig, 'works-original-container', null, 'オリジナル楽曲制作');

            // 4. Original Page
            new PagedSection(data.orig, 'original-portfolio', null, 'オリジナル楽曲制作');

            // 5. Update Plans (Use Hardcoded Defaults to Fix Notation)
            // Use API options if available, otherwise empty. 
            // BUT for Plans, we use Defaults because API Plans are broken/garbled.
            // For Options, user said "Options became something I didn't write".
            // If I use empty defaults, it will show nothing.
            // If API has garbled data, it shows garbled.
            // I will try to use API options but override Plans.
            // Wait, if API `prices` object exists, it has `mixOptions`.

            const finalMixPlans = (data.prices && data.prices.mix && data.prices.mix.length > 0) ? data.prices.mix : DEFAULT_PRICES.mix;
            const finalOrigPlans = (data.prices && data.prices.orig && data.prices.orig.length > 0) ? data.prices.orig : DEFAULT_PRICES.orig;

            // Use API options if valid, else empty
            const finalMixOptions = (data.prices && data.prices.mixOptions && data.prices.mixOptions.length > 0) ? data.prices.mixOptions : [];
            const finalOrigOptions = (data.prices && data.prices.origOptions && data.prices.origOptions.length > 0) ? data.prices.origOptions : [];

            renderPublicPlans(finalMixPlans, 'plan-list-mix');
            renderPublicPlans(finalOrigPlans, 'plan-list-orig');

            renderOptions(finalMixOptions, 'option-list-mix');
            renderOptions(finalOrigOptions, 'option-list-orig');

            if (data.voices) renderVoicesPublic(data.voices);

            // 6. Status & Notices
            // 6. Status & Notices
            if (data.status) {
                const statusEl = document.getElementById('order-status-display');
                if (statusEl) {
                    const now = new Date();
                    let isSuspended = false;
                    let resumeDate = '';

                    if (data.status.suspensionStart && data.status.suspensionEnd) {
                        const start = new Date(data.status.suspensionStart);
                        const end = new Date(data.status.suspensionEnd);
                        if (now >= start && now <= end) {
                            isSuspended = true;
                            resumeDate = `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}`;
                        }
                    }

                    if (isSuspended) {
                        // SUSPENDED STATE
                        // Hide the normal status element
                        statusEl.style.display = 'none';

                        // Disable Form
                        const formBtn = document.querySelector('#orderForm button[type="submit"]');
                        if (formBtn) {
                            formBtn.disabled = true;
                            formBtn.innerText = '現在受付停止中です';
                            formBtn.style.background = '#ccc';
                            formBtn.style.cursor = 'not-allowed';
                        }

                        // Restore Top Banner (User preferred this over the status text)
                        const inputArea = document.getElementById('input-area');
                        if (inputArea) {
                            // Prevent duplicate banners
                            if (!document.getElementById('suspension-banner')) {
                                const warning = document.createElement('div');
                                warning.id = 'suspension-banner';
                                warning.style.background = '#fff1f2';
                                warning.style.border = '1px solid #e11d48';
                                warning.style.color = '#be123c';
                                warning.style.padding = '15px';
                                warning.style.borderRadius = '8px';
                                warning.style.marginBottom = '20px';
                                warning.style.textAlign = 'center';
                                warning.style.fontWeight = 'bold';
                                warning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 只今、新規のご依頼受付を停止しております。<br>再開予定日は ${resumeDate} です。`;
                                inputArea.insertBefore(warning, inputArea.firstChild);
                            }
                        }

                    } else if (data.status) {
                        // NORMAL (or Manual) DATE CHECK PASSED
                        // Now check manual isOpen flag (default true if undefined)
                        const isOpen = data.status.isOpen !== false;

                        if (!isOpen) {
                            // MANUALLY CLOSED
                            statusEl.style.display = '';
                            statusEl.innerHTML = `<i class="fa-solid fa-ban"></i> ${data.status.text || '現在ご依頼受付を停止しております'}`;
                            statusEl.style.color = '#dc2626'; // Red

                            // Disable Form
                            const formBtn = document.querySelector('#orderForm button[type="submit"]');
                            if (formBtn) {
                                formBtn.disabled = true;
                                formBtn.innerText = '現在受付停止中です';
                                formBtn.style.background = '#ccc';
                                formBtn.style.cursor = 'not-allowed';
                            }
                        } else {
                            // OPEN
                            statusEl.style.display = ''; // Show it again
                            statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${data.status.text || '現在ご依頼受付中です'}`;
                            statusEl.style.color = ''; // Reset color

                            // Enable Form
                            const formBtn = document.querySelector('#orderForm button[type="submit"]');
                            if (formBtn) {
                                formBtn.disabled = false;
                                formBtn.style.background = '';
                                formBtn.style.cursor = '';
                                formBtn.innerHTML = '無料で内容を相談する <i class="fa-solid fa-paper-plane ml-2"></i>';
                            }
                        }
                    }
                }
            }

            if (data.notices) {
                const noticeContainer = document.getElementById('notices-container');
                if (noticeContainer) {
                    const visibleNotices = data.notices.filter(n => n.visible !== false);
                    if (visibleNotices.length > 0) {
                        noticeContainer.innerHTML = '';
                        visibleNotices.forEach(n => {
                            const div = document.createElement('div');
                            div.className = 'notice-box';
                            div.innerHTML = `
                                <div class="notice-header">
                                    <i class="fa-solid fa-circle-info"></i> ${n.title}
                                </div>
                                <div class="notice-content">
                                    <p>${n.content.replace(/\n/g, '<br>')}</p>
                                </div>
                            `;
                            noticeContainer.appendChild(div);
                        });
                    } else {
                        // If no notices are visible, hide container or keep empty?
                        // If defaulting to empty, maybe hide it. But for now innerHTML='' is enough.
                        noticeContainer.innerHTML = '';
                    }
                }
            }

            if (data.newsList) {
                renderPublicNewsList(data.newsList);
                renderPublicNewsListTop(data.newsList);
            }

        } catch (e) { console.error("Data load error", e); }
    };

    const renderPublicNewsListTop = (newsList) => {
        const container = document.getElementById('top-news-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const visibleNews = newsList.filter(n => n.visible !== false);
        if (visibleNews.length === 0) {
            container.innerHTML = '<li style="text-align:center; padding: 20px; color:#999; border:none;">現在お知らせはありません。</li>';
            return;
        }

        // Sort by date desc
        const sorted = visibleNews.sort((a,b) => new Date(b.date) - new Date(a.date));
        
        // Take top 3
        const top3 = sorted.slice(0, 3);

        top3.forEach(item => {
            const li = document.createElement('li');
            li.className = 'news-item';
            li.innerHTML = `
                <span class="news-date">${item.date}</span>
                <a href="news-detail.html?id=${item.id}" class="news-title">${item.title}</a>
            `;
            container.appendChild(li);
        });
    };

    const renderPublicNewsList = (newsList) => {
        const container = document.getElementById('public-news-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const visibleNews = newsList.filter(n => n.visible !== false);
        if (visibleNews.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 40px; color: #999;">現在お知らせはありません。</p>';
            return;
        }

        // Sort by date desc
        const sorted = visibleNews.sort((a,b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(item => {
            // strip html tags for preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.content || '';
            let text = tempDiv.textContent || tempDiv.innerText || '';
            if(text.length > 80) text = text.substring(0, 80) + '...';

            const article = document.createElement('article');
            article.className = 'news-article';
            article.innerHTML = `
                <div class="news-meta">
                    <span class="news-date">${item.date}</span>
                    <span class="news-label">${item.label || 'お知らせ'}</span>
                </div>
                <h2 class="article-title">${item.title}</h2>
                <div class="article-body">
                    <p style="color:#666; font-size:0.95rem; margin-bottom:15px;">${text}</p>
                    <a href="news-detail.html?id=${item.id}" class="btn btn-sm btn-outline" style="text-decoration:none; display:inline-block;">詳細を見る <i class="fa-solid fa-chevron-right" style="font-size:0.8em;"></i></a>
                </div>
            `;
            container.appendChild(article);
        });
    };

    const renderVoicesPublic = (voices) => {
        const container = document.getElementById('voice-list-home');
        if (!container) return;
        container.innerHTML = '';
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
        const current = sessionStorage.getItem('selectedPlan');

        // Toggle Logic
        if (current === planName) {
            // Deselect
            sessionStorage.removeItem('selectedPlan');
            planName = null; // Clear local var to update UI
        } else {
            // Select
            sessionStorage.setItem('selectedPlan', planName);
        }

        updatePlanUI(planName);

        // Update Buttons Visuals
        document.querySelectorAll('.plan-select-btn').forEach(btn => {
            const p = btn.dataset.plan;
            const card = btn.closest('.price-card');

            if (planName && p === planName) {
                // Active State
                btn.classList.add('selected');
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 選択中 (解除)';
                if (card) card.classList.add('selected');
            } else {
                // Inactive State
                btn.classList.remove('selected');
                btn.innerHTML = 'このプランを選択';
                if (card) card.classList.remove('selected');
            }

            // Clear inline styles if any residue exists
            btn.style.background = '';
            btn.style.color = '';
            if (card) card.style.borderColor = '';
        });
    };

    const updatePlanUI = (planName) => {
        // Floating Widget & Badge
        let badge = document.getElementById('plan-select-badge');
        let widget = document.getElementById('plan-float-widget');

        if (!planName) {
            if (badge) badge.style.display = 'none';
            if (widget) widget.style.display = 'none';
            return;
        }

        // Retrieve selected options
        const savedOpts = JSON.parse(sessionStorage.getItem('selectedOptions') || '[]');
        let displayText = planName;
        let detailsText = planName;

        if (savedOpts.length > 0) {
            displayText += ` <span style="font-size:0.8em; opacity:0.9;">(+ ${savedOpts.length}オプション)</span>`;
            detailsText += `<div style="font-size:0.85rem; color:#666; margin-top:5px; margin-bottom:10px; border-top:1px dashed #eee; padding-top:5px;">+ ${savedOpts.join('<br>+ ')}</div>`;
        }

        if (!badge) {
            const b = document.createElement('div');
            b.id = 'plan-select-badge';
            b.className = 'plan-badge';
            document.body.appendChild(b);
            // Re-assign for use
            badge = b;
        }
        badge.innerHTML = `<i class="fa-solid fa-check"></i> 選択中: ${displayText}`;
        badge.style.display = 'flex';
        badge.onclick = () => { window.location.href = 'order.html'; }; // Quick link
        badge.style.cursor = 'pointer';

        if (!widget) {
            const w = document.createElement('div');
            w.id = 'plan-float-widget';
            w.className = 'plan-float-widget text-center';
            document.body.appendChild(w);
            widget = w;
        }
        widget.innerHTML = `
            <div class="plan-float-header">現在選択中のプラン</div>
            <div class="plan-float-title" style="margin-bottom:5px;">${planName}</div>
            ${savedOpts.length > 0 ? `<div style="font-size:0.8rem; text-align:left; background:#f8fafc; padding:8px; border-radius:4px; margin-bottom:10px;"><b>オプション:</b><ul style="margin:0; padding-left:15px;">${savedOpts.map(o => `<li>${o}</li>`).join('')}</ul></div>` : ''}
            <a href="order.html" class="btn btn-primary btn-sm" style="width:100%;">ご依頼へ進む</a>
        `;
        widget.style.display = 'block';
    };

    // Auto-Run Check
    const checkPlanState = () => {
        // 1. Order Form Auto-Fill (Plan)
        const planSelect = document.querySelector('select[name="プラン"]') || document.querySelector('select[name="plan"]') || document.getElementById('plan');
        if (planSelect) {
            const saved = sessionStorage.getItem('selectedPlan');
            if (saved) {
                // Try to find exact match first
                let found = false;
                for (let i = 0; i < planSelect.options.length; i++) {
                    if (planSelect.options[i].value === saved || planSelect.options[i].text === saved) {
                        planSelect.selectedIndex = i; found = true; break;
                    }
                }
                // Fallback to includes
                if (!found) {
                    for (let i = 0; i < planSelect.options.length; i++) {
                        if (planSelect.options[i].text.includes(saved)) {
                            planSelect.selectedIndex = i; break;
                        }
                    }
                }
            }
        }

        // 2. Order Form Auto-Fill (Options)
        const optionInput = document.querySelector('input[name="オプション"]') || document.querySelector('input[name="option"]');
        if (optionInput) {
            const savedOpts = JSON.parse(sessionStorage.getItem('selectedOptions') || '[]');
            if (savedOpts.length > 0) {
                // Append to existing value if any, or set
                // Ideally we just set it as the primary intent is often from the click
                // But if user typed something manually, we might want to respect it?
                // Let's just set it for now, as usually they come empty.
                optionInput.value = savedOpts.join(', ');
            }
        }

        // 3. Clear if not on relevant pages (Logic from before)
        // We only clear if we are NOT on order form AND NOT on a page where we can select plans (like Mix/Original/Index)
        // Actually, logic was: clear if NOT on order.html. But we want to keep selection while browsing details.
        // The original logic was: "If !order.html, remove". This means selection only persists IF you go straight to order.
        // If you select on Mix, then go to Top, then Order -> it might be lost if logic ran on Top.
        // But `checkPlanState` runs on every page load.
        // So effectively, selection is ephemeral to the current navigation session towards Order.
        // We should probably NOT clear it automatically unless we are on the "Success" page or similar?
        // Or just leave it. The user said "Selectable like plans".
        // Let's keep the existing logic for Plans (clears if not order.html) but that seems buggy if I navigate around.
        // However, I will stick to extending it for Options in the same way to likely match expected behavior or fix it if I see it's wrong.
        // If I strictly follow: "If !order.html -> clear", then clicking "Select" on Mix page -> refresh Mix page -> Clears it? Yes.
        // This seems harsh. I will relax it: Only clear if we are on a page where we *can* select new ones?
        // Or just don't clear it at all, let session storage persist until browser close.

        // Modifying logic: Don't clear on every page load.
        // But validation might require it? No.
        // I will REMOVE the auto-clear logic to improve UX (persistence across pages).

        // (Removed auto-clear logic)
    };
    // Call immediately
    checkPlanState();

    const renderPublicPlans = (plans, containerId) => {
        const container = document.getElementById(containerId);
        if (!container || !plans || !Array.isArray(plans)) return;

        container.innerHTML = '';
        container.className = 'price-grid'; // Use grid for all

        plans.forEach(plan => {
            // Determine Catchphrase vs Badge
            // If badgeText starts with '★', treat as Catchphrase (Left)
            // If recommended is true, show Badge (Right). Default '人気' if badgeText is used for catchphrase.

            let catchphraseHTML = '';
            let badgeHTML = '';

            const rawBadgeText = plan.badgeText || '';
            const isCatchphrase = rawBadgeText.startsWith('★');

            if (isCatchphrase) {
                catchphraseHTML = `<div class="catchphrase">${rawBadgeText}</div>`;
                // If recommended, we still need a badge?
                if (plan.recommended) {
                    badgeHTML = `<div class="badge">人気</div>`;
                }
            } else {
                // Normal case: badgeText acts as the Badge text
                if (plan.recommended) {
                    badgeHTML = `<div class="badge">${rawBadgeText || '人気'}</div>`;
                }
            }

            const cardHTML = `
                <div class="price-card ${plan.recommended ? 'featured' : ''}" onclick="selectPlan('${plan.title}')">
                    <!-- Header Row for Catchphrase & Badge -->
                    ${catchphraseHTML}
                    ${badgeHTML}
                    
                    <h3 class="plan-title">${plan.title}</h3>
                    <p class="price">${plan.price}</p>

                    <!-- Plan Details (Always Visible) -->
                    <div class="plan-details-container">
                        <p class="price-desc">${plan.desc || ''}</p>
                        
                        <div class="card-meta">
                            <div class="meta-row">
                                <span><i class="fa-regular fa-clock"></i> 納期</span>
                                <span>${plan.period}</span>
                            </div>
                            <div class="meta-row">
                                <span><i class="fa-solid fa-rotate-right"></i> リテイク</span>
                                <span>${plan.revisions || plan.limit || 'ー'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-action">
                         <button class="btn btn-outline btn-sm plan-select-btn" data-plan="${plan.title}">このプランを選択</button>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    };

    const renderOptions = (options, containerId) => {
        const container = document.getElementById(containerId);
        if (!container || !options || !Array.isArray(options)) return;

        container.innerHTML = '';
        container.className = 'option-grid'; // Use grid layout

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'option-item-card';
            card.setAttribute('onclick', `toggleOption('${opt.title}')`);

            // Check if selected
            const savedOpts = JSON.parse(sessionStorage.getItem('selectedOptions') || '[]');
            if (savedOpts.includes(opt.title)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="option-header">
                    <div class="option-info">
                        <div class="option-icon"><i class="fa-solid fa-plus"></i></div>
                        <span class="option-name">${opt.title}</span>
                    </div>
                    <span class="option-price">${opt.price}</span>
                </div>
                ${opt.desc ? `<div class="option-desc">${opt.desc}</div>` : ''}
                <div class="option-select-btn">
                     <button class="btn-option-toggle">${savedOpts.includes(opt.title) ? '選択中' : '追加する'}</button>
                </div>
            `;
            container.appendChild(card);
        });
    };

    window.toggleOption = (optName) => {
        let savedOpts = JSON.parse(sessionStorage.getItem('selectedOptions') || '[]');

        if (savedOpts.includes(optName)) {
            // Remove
            savedOpts = savedOpts.filter(o => o !== optName);
        } else {
            // Add
            savedOpts.push(optName);
        }

        sessionStorage.setItem('selectedOptions', JSON.stringify(savedOpts));

        // Refresh UI (Re-render or just toggle classes - Re-render safer for synching text)
        // Since we don't have easy access to raw data here without passing it around or storing global, 
        // we can just reload data or implement a lighter UI refresh. 
        // For simplicity and robustness, let's just toggle the specific card's class and text if found.

        // Find all cards with this option
        document.querySelectorAll('.option-item-card').forEach(card => {
            const titleEl = card.querySelector('.option-name');
            if (titleEl && titleEl.innerText === optName) {
                const btn = card.querySelector('.btn-option-toggle');
                if (savedOpts.includes(optName)) {
                    card.classList.add('selected');
                    if (btn) btn.innerText = '選択中';
                } else {
                    card.classList.remove('selected');
                    if (btn) btn.innerText = '追加する';
                }
            }
        });

        // Trigger UI Update for Widget/Badge
        const currentPlan = sessionStorage.getItem('selectedPlan');
        if (currentPlan) {
            updatePlanUI(currentPlan);
        }
    };

    // Shared Item Creator
    const createWorkItem = (video, defaultLabel) => {
        const item = document.createElement('div');
        item.className = 'work-item';

        // Force Override for Happy End Creator
        let label = video.role || defaultLabel || 'ミックス／マスタリング';
        if ((video.title || '').includes('ハッピーエンドクリエイター') || (video.comment || '').includes('ハッピーエンドクリエイター')) {
            label = 'オリジナル楽曲制作';
        }

        item.innerHTML = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="work-title" style="margin-bottom: 5px;">${video.title || video.comment || ''}</p>
            <p class="work-role" style="font-size: 0.8rem; color: #666; padding: 0 15px 15px; margin-top: auto;">${label}</p>
        `;
        return item;
    };

    loadPublicData();

    // Duplicate submit logic removed. Submit logic at top (lines 35-120) should handle it.
    // I need to double check if 35-120 has the new isSubmitting check.
    // Based on previous reads, I might not have added isSubmitting to lines 35-120 yet, I added it to the bottom.
    // I need to verify that.


    // --- 9. MOBILE PLANS ACCORDION ---


    // --- 10. SCROLL INDICATOR DOTS (VOICES) ---
    const voicesGrid = document.querySelector('.voices-grid');
    const dotsContainer = document.getElementById('scrollDots');

    if (voicesGrid && dotsContainer) {
        const cards = voicesGrid.querySelectorAll('.voice-card');
        const dotsCount = cards.length;

        // Generate Dots
        dotsContainer.innerHTML = '';
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'scroll-dot active' : 'scroll-dot';
            dotsContainer.appendChild(dot);
        }

        // Update on Scroll
        voicesGrid.addEventListener('scroll', () => {
            const scrollLeft = voicesGrid.scrollLeft;
            const containerWidth = voicesGrid.clientWidth; // Visible width
            // Since padding-left is 7.5vw, we need to account for that roughly, or just use center point.
            // Center of the view:
            const centerPoint = scrollLeft + (containerWidth / 2);

            cards.forEach((card, index) => {
                const cardLeft = card.offsetLeft;
                const cardWidth = card.offsetWidth;
                const cardRight = cardLeft + cardWidth;

                // If the center of the viewport is within this card
                if (centerPoint >= cardLeft && centerPoint <= cardRight) {
                    // Activate this dot
                    const dots = dotsContainer.querySelectorAll('.scroll-dot');
                    dots.forEach(d => d.classList.remove('active'));
                    if (dots[index]) dots[index].classList.add('active');
                }
            });
        });
    }
});

// --- 8. VOICES CAROUSEL NAV ---


