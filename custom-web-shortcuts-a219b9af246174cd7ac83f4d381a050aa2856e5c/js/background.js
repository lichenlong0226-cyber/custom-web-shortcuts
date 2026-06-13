// Background service worker
console.log('[CustomWebShortcuts-BG] 后台脚本已启动');

// 启动时创建右键菜单（清除旧菜单避免重复）
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
        id: "customWebShortcut",
        title: "为此元素添加快捷键",
        contexts: ["all"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('[CustomWebShortcuts-BG] 创建右键菜单失败:', chrome.runtime.lastError);
        } else {
            console.log('[CustomWebShortcuts-BG] 右键菜单已创建');
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['shortcuts'], (result) => {
        if (!result.shortcuts) {
            chrome.storage.sync.set({
                shortcuts: []
            });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptions') {
        console.log('[CustomWebShortcuts-BG] 收到打开设置页请求');
        chrome.runtime.openOptionsPage();
        return;
    }
    if (request.action === 'getElementSelector') {
        chrome.storage.sync.get(['pendingSelector'], (result) => {
            if (result.pendingSelector) {
                chrome.storage.sync.remove('pendingSelector');
                sendResponse({ selector: result.pendingSelector });
            }
        });
        return true;
    }
    if (request.action === 'getShortcuts') {
        chrome.storage.sync.get(['shortcuts'], (result) => {
            sendResponse({ shortcuts: result.shortcuts || [] });
        });
        return true;
    }
});

// 右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "customWebShortcut") {
        chrome.storage.sync.get(['pendingClickSelector'], (result) => {
            const sel = result.pendingClickSelector;
            if (sel) {
                chrome.storage.sync.remove('pendingClickSelector');
                // 注入脚本，复制选择器到剪贴板并显示提示
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (selector) => {
                        // 复制到剪贴板
                        try {
                            navigator.clipboard.writeText(selector);
                        } catch(e) {
                            const ta = document.createElement('textarea');
                            ta.value = selector;
                            ta.style.position = 'fixed';
                            ta.style.opacity = '0';
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand('copy');
                            ta.remove();
                        }
                        // 显示绿色提示
                        const toast = document.createElement('div');
                        toast.textContent = '✅ 已复制: ' + selector;
                        Object.assign(toast.style, {
                            position: 'fixed', top: '16px', left: '50%',
                            transform: 'translateX(-50%)', background: '#4CAF50',
                            color: '#fff', padding: '12px 24px', borderRadius: '8px',
                            fontSize: '16px', zIndex: '2147483647',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            fontFamily: 'sans-serif'
                        });
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2500);
                    },
                    args: [sel]
                });
            }
        });
    }
});
