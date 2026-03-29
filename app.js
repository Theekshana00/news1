// c:\Users\UDESH THEEKSHANA\Desktop\news\app.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFAULT DB INITIALIZATION ---
    let appState = JSON.parse(localStorage.getItem('verity_db'));
    if (!appState) {
        appState = {
            categories: ['World', 'Tech', 'Business', 'Sports', 'Science'], 
            adsEnabled: true,
            seo: { title: 'Verity News - Global Portal', description: 'Latest global updates.', keywords: 'News' },
            posts: [{ 
                id: 1, 
                timestamp: Date.now() - 3600000, // 1 hr ago
                title: "Global AI Summits Outline New Regulations", 
                category: "Technology", 
                imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800", 
                content: "Industry leaders gather to discuss the ethical deployment of artificial intelligence algorithms worldwide. In a major development regarding the topic, sources inside the industry have confirmed that these changes will have lasting global implications. Analysts observe history unfolding.",
                comments: []
            }],
            users: []
        };
        localStorage.setItem('verity_db', JSON.stringify(appState));
    }

    // --- Time formatter utility ---
    const timeAgo = (date) => {
        if(!date) return 'Recently';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    // --- 2. THEME & HEADER META SYNC ---
    const tBtn = document.getElementById('themeToggle');
    if(tBtn) {
        if(localStorage.getItem('verityTheme') === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); tBtn.classList.replace('fa-moon', 'fa-sun'); }
        tBtn.addEventListener('click', () => {
            if(document.documentElement.getAttribute('data-theme') === 'dark') { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('verityTheme', 'light'); tBtn.classList.replace('fa-sun', 'fa-moon'); } 
            else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('verityTheme', 'dark'); tBtn.classList.replace('fa-moon', 'fa-sun'); }
        });
    }

    const dateEl = document.getElementById('headerDate');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    // Ads and Meta Sync
    if (!appState.adsEnabled) document.querySelectorAll('.toggleable-ad').forEach(ad => ad.style.display = 'none');
    document.title = appState.seo.title || "Verity News";
    const descMeta = document.getElementById('meta-desc');
    if(descMeta && appState.seo.description) descMeta.content = appState.seo.description;

    // --- 3. AUTH MODAL LOGIC & SESSION MAPPING ---
    const authOverlay = document.getElementById('authOverlay');
    const btnSignIn = document.getElementById('btnAuthOpen');
    const userProfileDropdown = document.getElementById('userProfile');
    const formLog = document.getElementById('formLogin');
    const formReg = document.getElementById('formRegister');
    
    const loggedUser = JSON.parse(sessionStorage.getItem('verityActiveUser'));
    if(loggedUser && btnSignIn) {
        btnSignIn.style.display = 'none';
        userProfileDropdown.style.display = 'block';
        document.getElementById('authUserName').textContent = loggedUser.name.split(' ')[0];
    }

    const btnUserMenu = document.getElementById('btnUserMenu');
    if(btnUserMenu) {
        btnUserMenu.addEventListener('click', () => { document.getElementById('userMenuContent').classList.toggle('active'); });
    }
    
    if(btnSignIn && authOverlay) {
        btnSignIn.addEventListener('click', () => { authOverlay.style.display = 'flex'; formLog.classList.add('active'); formReg.classList.remove('active'); });
        document.getElementById('authCloseBtn').addEventListener('click', () => authOverlay.style.display = 'none');
        document.getElementById('toRegister').addEventListener('click', () => { formLog.classList.remove('active'); formReg.classList.add('active'); });
        document.getElementById('toLogin').addEventListener('click', () => { formReg.classList.remove('active'); formLog.classList.add('active'); });
    }

    const btnReg = document.getElementById('btnRegSubmit');
    if(btnReg) {
        btnReg.addEventListener('click', () => {
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const pass = document.getElementById('regPass').value;
            const err = document.getElementById('regError');
            
            if(!name || !email || !pass) { err.textContent = "Please fill all fields."; err.style.display = 'block'; return; }
            if(appState.users.find(u => u.email === email)) { err.textContent = "Email already registered!"; err.style.display = 'block'; return; }
            
            appState.users.push({ name, email, password: pass });
            localStorage.setItem('verity_db', JSON.stringify(appState));
            sessionStorage.setItem('verityActiveUser', JSON.stringify({name, email}));
            window.location.reload();
        });
    }

    const btnLog = document.getElementById('btnLogSubmit');
    if(btnLog) {
        btnLog.addEventListener('click', () => {
            const email = document.getElementById('logEmail').value.trim();
            const pass = document.getElementById('logPass').value;
            const err = document.getElementById('logError');
            
            const user = appState.users.find(u => u.email === email && u.password === pass);
            if(user) {
                sessionStorage.setItem('verityActiveUser', JSON.stringify({name: user.name, email: user.email}));
                window.location.reload();
            } else { err.textContent = "Invalid email or password."; err.style.display = 'block'; }
        });
    }

    const btnLogout = document.getElementById('btnAuthLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault(); sessionStorage.removeItem('verityActiveUser'); window.location.reload();
        });
    }


    // --- 4. INDEX.HTML DYNAMIC GRID, SEARCH & NAV FILTERS ---
    const gridCont = document.getElementById('gridNewsContainer');
    const heroCont = document.getElementById('heroNewsContainer');
    
    const renderGrid = (postsToRender) => {
        heroCont.innerHTML = ''; gridCont.innerHTML = '';
        if (postsToRender.length > 0) {
            const hero = postsToRender[0];
            heroCont.innerHTML = `
                <a href="article.html?id=${hero.id}" class="news-card-link hero-article reveal active">
                    <img src="${hero.imageUrl}" loading="lazy">
                    <div class="hero-content">
                        <span class="news-category">${hero.category}</span>
                        <h2>${hero.title}</h2>
                        <p style="margin-bottom:15px;">${hero.content.substring(0,100)}...</p>
                        <small style="color:var(--accent-red); font-weight:600;"><i class="fa-regular fa-clock"></i> ${timeAgo(hero.timestamp)}</small>
                    </div>
                </a>`;
            for (let i = 1; i < postsToRender.length; i++) {
                const post = postsToRender[i];
                gridCont.innerHTML += `
                    <a href="article.html?id=${post.id}" class="news-card-link reveal active">
                        <img src="${post.imageUrl}" loading="lazy">
                        <div class="news-card-content">
                            <span class="news-category">${post.category}</span>
                            <h3 style="margin-bottom:10px;">${post.title}</h3>
                            <p style="flex:1; margin-bottom:15px;">${post.content.substring(0,80)}...</p>
                            <small style="color:var(--text-muted); font-weight:500;"><i class="fa-regular fa-clock"></i> ${timeAgo(post.timestamp)}</small>
                        </div>
                    </a>`;
            }
        } else { heroCont.innerHTML = '<p style="padding: 20px; font-weight: 600; font-size: 1.1rem;">No articles found matching your query.</p>'; }
    };

    if (gridCont && heroCont) {
        document.getElementById('liveTicker').innerHTML = appState.posts.map(p => p.title).join(' &nbsp; &bull; &nbsp; ');
        renderGrid(appState.posts);

        // Active Search Logic
        const searchInput = document.getElementById('searchInput');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase();
                const filtered = appState.posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
                renderGrid(filtered);
            });
        }
    }

    // Nav Filter Logic for Index
    const navList = document.getElementById('dynamicNav');
    if(navList) {
        navList.innerHTML = '<li><a href="#" data-cat="all">Home</a></li>';
        appState.categories.forEach(cat => navList.innerHTML += `<li><a href="#" data-cat="${cat}">${cat}</a></li>`);
        
        if (gridCont) {
            navList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Optional visuals: strip other active classes and append to clicked
                    const targetCat = e.target.getAttribute('data-cat');
                    if(targetCat === 'all') renderGrid(appState.posts);
                    else {
                        const filtered = appState.posts.filter(p => p.category === targetCat);
                        renderGrid(filtered);
                    }
                });
            });
        }
    }


    // --- 5. ARTICLE.HTML DYNAMIC PAGE RENDERER ---
    const articleView = document.getElementById('articleView');
    if (articleView) {
        const params = new URLSearchParams(window.location.search);
        const postId = parseInt(params.get('id'));
        const post = appState.posts.find(p => p.id === postId);
        
        if(post) {
            document.title = post.title + " | Verity News";
            
            // Format Content Paragraphs easily
            const formattedContent = post.content.split('\n').filter(p => p.trim() !== '').map((p, idx) => {
                if(idx === 0) return `<p style="font-weight: 600; font-size: 1.25rem; margin-bottom: 20px;">${p}</p>`;
                return `<p style="margin-bottom: 20px;">${p}</p>`;
            }).join('');

            articleView.innerHTML = `
                <span class="a-cat">${post.category}</span>
                <h1 class="a-title">${post.title}</h1>
                <div class="a-meta">
                    <span>By <strong>Verity Staff Writer</strong></span>
                    <span><i class="fa-solid fa-clock-rotate-left" style="color:var(--accent-red); margin-right:5px;"></i> ${timeAgo(post.timestamp)}</span>
                </div>
                <img src="${post.imageUrl}" class="a-img" alt="${post.title}">
                
                <div class="a-content">
                    ${formattedContent}
                </div>
                
                <div class="share-box">
                    <span>Share Article: </span>
                    <button class="s-btn fb"><i class="fa-brands fa-facebook-f"></i></button>
                    <button class="s-btn tw"><i class="fa-brands fa-twitter"></i></button>
                    <button class="s-btn ln"><i class="fa-brands fa-linkedin-in"></i></button>
                    <button class="s-btn wa"><i class="fa-brands fa-whatsapp"></i></button>
                </div>

                <div class="comments-section" id="commentsSection">
                    <h3 style="margin-bottom: 25px;">Discussions (<span id="commentCount">0</span>)</h3>
                    <div id="commentsList"></div>
                    <div id="commentFormArea" style="margin-top: 30px;">
                        <!-- Injected by Auth Check -->
                    </div>
                </div>
            `;

            // Related News Sidebar 
            const relList = document.getElementById('relatedNews');
            const related = appState.posts.filter(p => p.id !== postId).slice(0, 3);
            if(related.length > 0) {
                related.forEach(r => relList.innerHTML += `<li class="rel-item"><span class="rel-cat">${r.category}</span><a href="article.html?id=${r.id}">${r.title}</a></li>`);
            } else { relList.innerHTML = "<li>No related stories.</li>"; }

            // Construct Comments Interface
            const renderComments = () => {
                const list = document.getElementById('commentsList');
                document.getElementById('commentCount').textContent = post.comments ? post.comments.length : 0;
                list.innerHTML = '';
                if(post.comments && post.comments.length > 0) {
                    post.comments.forEach(c => {
                        const initial = c.author.charAt(0).toUpperCase();
                        list.innerHTML += `
                        <div class="comment">
                            <div class="comment-avatar">${initial}</div>
                            <div class="comment-content">
                                <h5>${c.author} <span>• ${timeAgo(c.timestamp)}</span></h5>
                                <p>${c.text}</p>
                            </div>
                        </div>`;
                    });
                } else { list.innerHTML = '<p style="color:var(--text-muted); margin-bottom:20px; font-style: italic;">No comments yet. Be the first to start the conversation!</p>'; }
            }
            renderComments(); // Mount initial DB payloads

            const formArea = document.getElementById('commentFormArea');
            if(loggedUser) {
                formArea.innerHTML = `
                    <h4 style="margin-bottom: 15px;">Leave a Comment as <span style="color:var(--accent-blue);">${loggedUser.name}</span></h4>
                    <textarea id="newCommentText" class="comment-box" placeholder="What are your thoughts?"></textarea>
                    <button id="btnSubmitComment" class="sign-in-btn">Post Comment</button>
                `;
                document.getElementById('btnSubmitComment').addEventListener('click', () => {
                    const text = document.getElementById('newCommentText').value.trim();
                    if(!text) return;
                    if(!post.comments) post.comments = [];
                    post.comments.push({ author: loggedUser.name, text: text, timestamp: Date.now() });
                    
                    // Mutate App State Array & Save
                    const idx = appState.posts.findIndex(p => p.id === postId);
                    appState.posts[idx] = post;
                    localStorage.setItem('verity_db', JSON.stringify(appState));
                    
                    document.getElementById('newCommentText').value = '';
                    renderComments(); // Re-render Live
                });
            } else {
                formArea.innerHTML = `
                    <div style="background:var(--bg-body); padding:25px; border-radius:8px; text-align:center; border:1px solid var(--border-color);">
                        <p style="margin-bottom:15px; color:var(--text-muted); font-weight:500;">Please log into your account to join the discussion.</p>
                        <button class="sign-in-btn" id="btnCommentLogin">Log In to Post</button>
                    </div>
                `;
                document.getElementById('btnCommentLogin').addEventListener('click', () => document.getElementById('btnAuthOpen').click());
            }

        } else {
            articleView.innerHTML = `
                <div style="text-align:center; padding: 100px 0;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 4rem; color: var(--accent-red); margin-bottom: 20px;"></i>
                    <h1 class="a-title">Article Not Found</h1>
                    <a href="index.html" class="auth-btn" style="width: auto; padding: 10px 20px; display:inline-block;">Return to Homepage</a>
                </div>
            `;
        }
    }

    // Scroll Header Observer
    window.addEventListener('scroll', () => {
        const h = document.getElementById('mainHeader');
        if(h) { if(window.scrollY > 40) h.classList.add('scrolled'); else h.classList.remove('scrolled'); }
    });

    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }}));
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

});
