// c:\Users\UDESH THEEKSHANA\Desktop\news\admin.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MOCK SECURITY ---
    const overlay = document.getElementById('loginOverlay');
    overlay.style.transition = 'opacity 0.4s ease-out';
    if(sessionStorage.getItem('verityAdminAuth') === 'true') { overlay.style.display = 'none'; }
    document.getElementById('btnLogin').addEventListener('click', () => {
        if(document.getElementById('passInput').value === 'admin') {
            sessionStorage.setItem('verityAdminAuth', 'true');
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 400);
        } else document.getElementById('loginError').style.display = 'block';
    });
    document.getElementById('btnLogout').addEventListener('click', () => { sessionStorage.removeItem('verityAdminAuth'); window.location.reload(); });

    // --- 2. DB INITIALIZER ---
    let appState = JSON.parse(localStorage.getItem('verity_db'));
    if (!appState) {
        // Fallback catch (should be made by app.js ideally)
        appState = { categories: [], adsEnabled: true, seo: {}, posts: [], users: [] };
    }
    const saveState = () => localStorage.setItem('verity_db', JSON.stringify(appState));

    // --- 3. TAB NAVIGATION SYSTEM ---
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');
    const tabs = ['post', 'categories', 'ads', 'seo', 'users'];

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            pageTitle.textContent = item.textContent.trim();
            tabs.forEach(t => document.getElementById('tab-' + t).classList.remove('active'));
            const target = item.getAttribute('data-tab');
            document.getElementById('tab-' + target).classList.add('active');
        });
    });

    // --- 4. CATEGORIES MANAGER ---
    const catListContainer = document.getElementById('adminCatList');
    const catSelectDropdown = document.getElementById('postCategory');
    
    const renderCategories = () => {
        catListContainer.innerHTML = '';
        catSelectDropdown.innerHTML = '';
        appState.categories.forEach((cat, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span><i class="fa-solid fa-folder" style="color:var(--text-muted); margin-right:8px;"></i> ${cat}</span>
                            <button class="delete-cat" data-index="${index}"><i class="fa-solid fa-trash"></i></button>`;
            catListContainer.appendChild(li);

            const opt = document.createElement('option');
            opt.value = cat; opt.textContent = cat;
            catSelectDropdown.appendChild(opt);
        });

        document.querySelectorAll('.delete-cat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                appState.categories.splice(idx, 1);
                saveState(); renderCategories();
            });
        });
    };
    
    document.getElementById('btnAddCat').addEventListener('click', () => {
        const val = document.getElementById('newCatInput').value.trim();
        if(val && !appState.categories.includes(val)) {
            appState.categories.push(val);
            saveState(); renderCategories();
            document.getElementById('newCatInput').value = '';
        }
    });

    renderCategories();

    // --- 5. AD MANAGER ---
    const adToggle = document.getElementById('adToggle');
    adToggle.checked = appState.adsEnabled;
    adToggle.addEventListener('change', (e) => {
        appState.adsEnabled = e.target.checked;
        saveState();
    });

    // --- 6. SEO MANAGER ---
    const seoTitle = document.getElementById('seoTitle');
    const seoDesc = document.getElementById('seoDesc');
    const seoKeys = document.getElementById('seoKeys');

    if(seoTitle) {
        seoTitle.value = appState.seo.title || "";
        seoDesc.value = appState.seo.description || "";
        seoKeys.value = appState.seo.keywords || "";

        document.getElementById('btnSaveSeo').addEventListener('click', () => {
            appState.seo.title = seoTitle.value;
            appState.seo.description = seoDesc.value;
            appState.seo.keywords = seoKeys.value;
            saveState();

            const btn = document.getElementById('btnSaveSeo');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
            btn.style.background = 'var(--success)';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = 'var(--primary)'; }, 1500);
        });
    }

    // --- 7. POST CREATOR ---
    document.getElementById('postCountBadge').textContent = appState.posts.length;

    const inputs = {
        title: document.getElementById('postTitle'),
        category: document.getElementById('postCategory'),
        imageFile: document.getElementById('postImageFile'),
        imageBase64: document.getElementById('postImageBase64'),
        content: document.getElementById('postContent') // Note: Textarea ensures full capability
    };

    const preview = {
        title: document.getElementById('previewTitle'),
        category: document.getElementById('previewCat'),
        image: document.getElementById('previewImg'),
        desc: document.getElementById('previewDesc')
    };

    const updatePreview = () => {
        preview.title.textContent = inputs.title.value || "Your Article Title Will Appear Here";
        preview.category.textContent = inputs.category.value || "CATEGORY";
        preview.desc.textContent = (inputs.content.value.substring(0, 100) + '...') || "As you type, this card will dynamically update to reflect the first 100 characters of your article.";
        preview.image.src = inputs.imageBase64.value || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600";
    };

    ['input', 'change'].forEach(evt => {
        inputs.title.addEventListener(evt, updatePreview);
        inputs.category.addEventListener(evt, updatePreview);
        inputs.content.addEventListener(evt, updatePreview);
    });

    inputs.imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                inputs.imageBase64.value = evt.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('btnPublish').addEventListener('click', () => {
        if(!inputs.title.value || !inputs.content.value) return alert("Fill out Title and Full Content");
        
        appState.posts.unshift({
            id: Date.now(),
            timestamp: Date.now(),
            title: inputs.title.value,
            category: inputs.category.value,
            imageUrl: inputs.imageBase64.value || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800",
            content: inputs.content.value, // Full Textarea content
            comments: []
        });
        saveState();
        
        const btn = document.getElementById('btnPublish');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Published!';
        btn.style.background = 'var(--success)';
        document.getElementById('postCountBadge').textContent = appState.posts.length;
        
        setTimeout(() => {
            btn.innerHTML = orig; btn.style.background = 'var(--primary)';
            inputs.title.value = ''; inputs.imageFile.value = ''; inputs.imageBase64.value = ''; inputs.content.value = ''; updatePreview();
        }, 1500);
    });

    document.getElementById('btnClearDB').addEventListener('click', () => {
        if(confirm("Are you sure? This deletes ALL posts!")) {
            appState.posts = []; saveState(); window.location.reload();
        }
    });

    // --- 8. RENDER USER LIST ---
    const userTable = document.getElementById('userTableBody');
    const userEmpty = document.getElementById('userEmptyState');
    
    if(appState.users && appState.users.length > 0) {
        appState.users.forEach(u => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><i class="fa-regular fa-user" style="color:var(--text-muted); margin-right:8px;"></i> ${u.name}</td>
                <td style="color: var(--text-muted);">${u.email}</td>
            `;
            userTable.appendChild(row);
        });
    } else {
        userEmpty.style.display = 'block';
    }

});
