// 电子书交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const chapterItems = document.querySelectorAll('.nav-item');
    const chapters = document.querySelectorAll('.chapter');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    // 移动端侧边栏切换
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // 点击页面其他区域关闭侧边栏（移动端）
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // 章节导航点击处理
    chapterItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            chapterItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 获取目标章节
            const targetId = this.getAttribute('href').substring(1);
            const targetChapter = document.getElementById(targetId);
            
            if (targetChapter) {
                // 平滑滚动到目标章节
                targetChapter.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 移动端关闭侧边栏
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });
    
    // 滚动监听，更新章节导航状态和阅读进度
    function updateReadingProgress() {
        let current = '';
        let totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        let currentScroll = window.pageYOffset;
        let progress = (currentScroll / totalHeight) * 100;
        
        // 更新进度条
        if (progressFill) {
            progressFill.style.width = Math.min(progress, 100) + '%';
        }
        if (progressText) {
            progressText.textContent = Math.round(Math.min(progress, 100)) + '%';
        }
        
        // 更新当前章节
        chapters.forEach(chapter => {
            const chapterTop = chapter.offsetTop;
            const chapterHeight = chapter.clientHeight;
            
            if (window.pageYOffset >= chapterTop - 100) {
                current = chapter.getAttribute('id');
            }
        });
        
        chapterItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', updateReadingProgress);
    
    // 初始化状态
    updateReadingProgress();
    
    // 窗口大小改变时的处理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
        }
        updateReadingProgress();
    });
    
    // 字体大小控制
    let currentFontSize = 16;
    const fontDecrease = document.getElementById('fontDecrease');
    const fontIncrease = document.getElementById('fontIncrease');
    const mainContent = document.querySelector('.main-content');
    
    if (fontDecrease) {
        fontDecrease.addEventListener('click', function() {
            if (currentFontSize > 12) {
                currentFontSize -= 2;
                if (mainContent) {
                    mainContent.style.fontSize = currentFontSize + 'px';
                }
                localStorage.setItem('ebookFontSize', currentFontSize);
            }
        });
    }
    
    if (fontIncrease) {
        fontIncrease.addEventListener('click', function() {
            if (currentFontSize < 24) {
                currentFontSize += 2;
                if (mainContent) {
                    mainContent.style.fontSize = currentFontSize + 'px';
                }
                localStorage.setItem('ebookFontSize', currentFontSize);
            }
        });
    }
    
    // 从本地存储恢复字体大小
    const savedFontSize = localStorage.getItem('ebookFontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        if (mainContent) {
            mainContent.style.fontSize = currentFontSize + 'px';
        }
    }
    
    // 主题切换
    const themeBtns = document.querySelectorAll('.theme-btn');
    const body = document.body;
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有主题类
            body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
            themeBtns.forEach(b => b.classList.remove('active'));
            
            // 添加选中的主题
            const theme = this.dataset.theme;
            
            body.classList.add('theme-' + theme);
            this.classList.add('active');
            
            // 保存主题到本地存储
            localStorage.setItem('ebookTheme', theme);
        });
    });
    
    // 从本地存储恢复主题
    const savedTheme = localStorage.getItem('ebookTheme') || 'light';
    body.classList.add('theme-' + savedTheme);
    const activeThemeBtn = document.querySelector('.theme-btn.' + savedTheme);
    if (activeThemeBtn) {
        activeThemeBtn.classList.add('active');
    }
    
    // 书签功能
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    let bookmarks = JSON.parse(localStorage.getItem('ebookBookmarks') || '[]');
    
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            const currentChapter = getCurrentChapter();
            const currentScroll = window.pageYOffset;
            
            const bookmark = {
                chapter: currentChapter,
                scroll: currentScroll,
                timestamp: new Date().toISOString(),
                title: document.querySelector('#' + currentChapter + ' .chapter-title')?.textContent || '未知章节'
            };
            
            // 检查是否已存在相同章节的书签
            const existingIndex = bookmarks.findIndex(b => b.chapter === currentChapter);
            if (existingIndex >= 0) {
                bookmarks[existingIndex] = bookmark;
            } else {
                bookmarks.push(bookmark);
            }
            
            localStorage.setItem('ebookBookmarks', JSON.stringify(bookmarks));
            
            // 显示反馈
            this.style.color = '#3b82f6';
            setTimeout(() => {
                this.style.color = '';
            }, 1000);
        });
    }
    
    // 获取当前章节ID
    function getCurrentChapter() {
        let current = 'chapter-1';
        
        chapters.forEach(chapter => {
            const chapterTop = chapter.offsetTop;
            if (window.pageYOffset >= chapterTop - 100) {
                current = chapter.getAttribute('id');
            }
        });
        
        return current;
    }
    
    // 语音朗读功能
    let speechSynthesis = window.speechSynthesis;
    let speaking = false;
    let currentUtterance = null;

    function startSpeaking(text) {
        if (speaking) {
            speechSynthesis.cancel();
            speaking = false;
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = function() {
            speaking = false;
            currentUtterance = null;
        };
        
        speaking = true;
        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    // 添加语音朗读按钮
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach(chapter => {
        const speakButton = document.createElement('button');
        speakButton.className = 'speak-btn';
        speakButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        chapter.querySelector('.chapter-header').appendChild(speakButton);
        
        speakButton.addEventListener('click', function() {
            const text = chapter.querySelector('.chapter-content').textContent;
            startSpeaking(text);
            
            // 更新按钮状态
            this.innerHTML = speaking ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });
    });

    // 添加笔记功能
    const noteSystem = {
        notes: JSON.parse(localStorage.getItem('ebookNotes') || '{}'),
        
        addNote: function(chapterId, text) {
            if (!this.notes[chapterId]) {
                this.notes[chapterId] = [];
            }
            this.notes[chapterId].push({
                text: text,
                timestamp: new Date().toISOString(),
                position: window.pageYOffset
            });
            this.saveNotes();
        },
        
        saveNotes: function() {
            localStorage.setItem('ebookNotes', JSON.stringify(this.notes));
        },
        
        showNotes: function(chapterId) {
            const notes = this.notes[chapterId] || [];
            const notesList = document.createElement('div');
            notesList.className = 'notes-list';
            
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-item';
                noteElement.innerHTML = `
                    <div class="note-text">${note.text}</div>
                    <div class="note-meta">
                        <span class="note-date">${new Date(note.timestamp).toLocaleString()}</span>
                        <button class="note-delete"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                notesList.appendChild(noteElement);
            });
            
            return notesList;
        }
    };

    // 为每个章节添加笔记按钮
    chapters.forEach(chapter => {
        const noteButton = document.createElement('button');
        noteButton.className = 'note-btn';
        noteButton.innerHTML = '<i class="fas fa-sticky-note"></i>';
        chapter.querySelector('.chapter-header').appendChild(noteButton);
        
        noteButton.addEventListener('click', function() {
            const chapterId = chapter.id;
            const noteDialog = document.createElement('div');
            noteDialog.className = 'note-dialog';
            noteDialog.innerHTML = `
                <div class="note-dialog-content">
                    <h3>笔记</h3>
                    <textarea placeholder="添加新笔记..."></textarea>
                    <button class="add-note-btn">添加</button>
                    <div class="notes-container"></div>
                </div>
            `;
            
            document.body.appendChild(noteDialog);
            
            const notesContainer = noteDialog.querySelector('.notes-container');
            notesContainer.appendChild(noteSystem.showNotes(chapterId));
            
            const textarea = noteDialog.querySelector('textarea');
            const addButton = noteDialog.querySelector('.add-note-btn');
            
            addButton.addEventListener('click', function() {
                const text = textarea.value.trim();
                if (text) {
                    noteSystem.addNote(chapterId, text);
                    textarea.value = '';
                    notesContainer.innerHTML = '';
                    notesContainer.appendChild(noteSystem.showNotes(chapterId));
                }
            });
            
            noteDialog.addEventListener('click', function(e) {
                if (e.target === noteDialog) {
                    document.body.removeChild(noteDialog);
                }
            });
        });
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 按 'n' 键跳转到下一章
        if (e.key === 'n' || e.key === 'N') {
            const currentChapter = getCurrentChapter();
            const currentIndex = Array.from(chapters).findIndex(ch => ch.id === currentChapter);
            if (currentIndex < chapters.length - 1) {
                const nextChapter = chapters[currentIndex + 1];
                nextChapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        // 按 'p' 键跳转到上一章
        if (e.key === 'p' || e.key === 'P') {
            const currentChapter = getCurrentChapter();
            const currentIndex = Array.from(chapters).findIndex(ch => ch.id === currentChapter);
            if (currentIndex > 0) {
                const prevChapter = chapters[currentIndex - 1];
                prevChapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        // 按 'b' 键添加书签
        if (e.key === 'b' || e.key === 'B') {
            if (bookmarkBtn) {
                bookmarkBtn.click();
            }
        }
        
        // 按 't' 键切换侧边栏
        if (e.key === 't' || e.key === 'T') {
            if (sidebarToggle) {
                sidebarToggle.click();
            }
        }
    });
    
    // 平滑滚动动画
    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.case-study, .lesson-card, .trend-item');
        
        animatedElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // 初始化动画样式
    const animatedElements = document.querySelectorAll('.case-study, .lesson-card, .trend-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // 监听滚动事件进行动画
    window.addEventListener('scroll', handleScrollAnimations);
    
    // 初始检查
    handleScrollAnimations();
    
    // 添加主题样式
    const style = document.createElement('style');
    style.textContent = `
        .theme-dark {
            background-color: #1a1a1a !important;
            color: #e5e5e5 !important;
        }
        .theme-dark .sidebar {
            background-color: #2d2d2d !important;
            border-right-color: #404040 !important;
        }
        .theme-dark .chapter {
            border-bottom-color: #404040 !important;
        }
        .theme-sepia {
            background-color: #f7f3e9 !important;
            color: #5c4b37 !important;
        }
        .theme-sepia .sidebar {
            background-color: #f0ead6 !important;
        }
    `;
    document.head.appendChild(style);
});