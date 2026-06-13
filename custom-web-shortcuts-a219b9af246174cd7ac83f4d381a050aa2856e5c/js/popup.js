document.addEventListener('DOMContentLoaded', () => {
    displayShortcuts();
    
    document.getElementById('openSettings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById('reloadBtn').addEventListener('click', displayShortcuts);
});

function displayShortcuts() {
    chrome.storage.sync.get(['shortcuts'], (result) => {
        const shortcuts = result.shortcuts || [];
        const list = document.getElementById('shortcutsList');

        if (shortcuts.length === 0) {
            list.innerHTML = '<p class="empty">暂无快捷键配置</p>';
            return;
        }

        list.innerHTML = '';
        shortcuts.forEach(shortcut => {
            const item = document.createElement('div');
            item.className = 'shortcut-display-item';
            item.innerHTML = `
                <div class="shortcut-key">${shortcut.key}</div>
                <div class="shortcut-info">
                    <div class="selector">${shortcut.selector}</div>
                    <div class="scope">${shortcut.scope === 'specific' ? `${shortcut.url}` : '所有网站'}</div>
                </div>
            `;
            list.appendChild(item);
        });
    });
}
