// Content script - 在网页中执行
console.log('[CustomWebShortcuts] 内容脚本已加载');

// 右键记录：追踪最后一次右键点击的元素
let lastRightClickedElement = null;
document.addEventListener('contextmenu', (e) => {
    lastRightClickedElement = e.target;
    console.log('[CustomWebShortcuts] 右键点击元素:', e.target.tagName, e.target.className);
    // 右键时直接生成选择器并写入 storage，绕过消息传递
    const sel = generateSelector(e.target);
    chrome.storage.sync.set({ pendingClickSelector: sel });
    console.log('[CustomWebShortcuts] 选择器已存储:', sel);
}, true);

let shortcuts = [];

// 初始化
chrome.storage.sync.get(['shortcuts'], (result) => {
    shortcuts = result.shortcuts || [];
    console.log('[CustomWebShortcuts] 已加载快捷键:', JSON.stringify(shortcuts));
});

// 监听快捷键设置更新
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getElementSelector') {
        if (lastRightClickedElement) {
            const selector = generateSelector(lastRightClickedElement);
            console.log('[CustomWebShortcuts] 生成选择器:', selector);
            sendResponse({ selector: selector });
        }
        return true;
    }
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
    console.log('[CustomWebShortcuts] 按键检测:', combination);
    
    shortcuts.forEach(shortcut => {
        if (!isShortcutActive(shortcut)) {
            console.log('[CustomWebShortcuts] 跳过网站不匹配:', shortcut.key);
            return;
        }

        if (combination.toUpperCase() === shortcut.key.toUpperCase()) {
            console.log('[CustomWebShortcuts] 匹配成功! 选择器:', shortcut.selector);
            event.preventDefault();
            event.stopPropagation();
            
            const element = document.querySelector(shortcut.selector);
            if (element) {
                console.log('[CustomWebShortcuts] 找到元素:', element.tagName, element.className);
                // 处理锚点链接（<a href="#xxx">）和普通按钮
                if (element.tagName === 'A' && element.getAttribute('href')?.startsWith('#')) {
                    // 锚点链接：平滑滚动到目标元素
                    const targetId = element.getAttribute('href').slice(1);
                    if (targetId) {
                        const target = document.getElementById(targetId);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                } else {
                    element.click();
                }
               showClickFeedback(element);
            } else {
                console.warn(`找不到选择器为 "${shortcut.selector}" 的元素`);
            }
        }
    });
}

// 自动生成 CSS 选择器
function generateSelector(el) {
    // 1. 如果有 id，最精准
    if (el.id) return '#' + CSS.escape(el.id);
    
    const tag = el.tagName.toLowerCase();
    
    // 2. 优先用 href 精准定位（如 a[href="#header-id-2"]）
    const href = el.getAttribute('href');
    if (href && !href.startsWith('javascript:')) {
        return `${tag}[href="${CSS.escape(href)}"]`;
    }
    
    // 3. 用标签名 + class
    const classes = Array.from(el.classList).filter(c => !c.startsWith('wp-') && !c.startsWith('fusion-'));
    
    if (classes.length > 0) {
        const classPart = classes.map(c => '.' + CSS.escape(c)).join('');
        const full = tag + classPart;
        if (document.querySelectorAll(full).length === 1) return full;
        if (document.querySelectorAll(classPart).length === 1) return classPart;
        return full;
    }
    
    // 4. 按其他属性匹配
    const type = el.getAttribute('type');
    if (type) return `${tag}[type="${CSS.escape(type)}"]`;
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return `${tag}[aria-label="${CSS.escape(ariaLabel)}"]`;
    
    return tag;
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

// 选取模式：点击元素自动生成选择器