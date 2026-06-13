// Content script - 在网页中执行

let shortcuts = [];

// 初始化
chrome.storage.sync.get(['shortcuts'], (result) => {
    shortcuts = result.shortcuts || [];
});

// 监听快捷键设置更新
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'shortcutsUpdated') {
        chrome.storage.sync.get(['shortcuts'], (result) => {
            shortcuts = result.shortcuts || [];
        });
    }
});

// 监听键盘事件
document.addEventListener('keydown', (e) => {
    handleKeyEvent(e);
}, true);

function handleKeyEvent(event) {
    const combination = getKeysCombination(event);
    
    shortcuts.forEach(shortcut => {
        if (!isShortcutActive(shortcut)) {
            return;
        }

        if (combination.toUpperCase() === shortcut.key.toUpperCase()) {
            event.preventDefault();
            event.stopPropagation();
            
            const element = document.querySelector(shortcut.selector);
            if (element) {
                element.click();
                showClickFeedback(element);
            } else {
                console.warn(`找不到选择器为 "${shortcut.selector}" 的元素`);
            }
        }
    });
}

function getKeysCombination(event) {
    const keys = [];
    
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (event.metaKey) keys.push('Meta');
    
    const key = event.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
        keys.push(key.length === 1 ? key.toUpperCase() : key);
    }
    
    return keys.join('+');
}

function isShortcutActive(shortcut) {
    if (shortcut.scope === 'all') {
        return true;
    }
    
    if (shortcut.scope === 'specific' && shortcut.url) {
        const currentUrl = window.location.hostname;
        return currentUrl.includes(shortcut.url);
    }
    
    return false;
}

function showClickFeedback(element) {
    const originalBackground = element.style.background;
    const originalBoxShadow = element.style.boxShadow;
    
    element.style.background = '#90EE90';
    element.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
    
    setTimeout(() => {
        element.style.background = originalBackground;
        element.style.boxShadow = originalBoxShadow;
    }, 200);
}
