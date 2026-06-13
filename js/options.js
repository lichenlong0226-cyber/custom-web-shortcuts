const MAX_SHORTCUTS = 10;

document.addEventListener('DOMContentLoaded', () => {
    loadShortcuts();
    
    document.getElementById('addShortcutBtn').addEventListener('click', addShortcut);
    document.getElementById('saveBtn').addEventListener('click', saveShortcuts);
    document.getElementById('resetBtn').addEventListener('click', resetShortcuts);
});

function loadShortcuts() {
    chrome.storage.sync.get(['shortcuts'], (result) => {
        const shortcuts = result.shortcuts || [];
        renderShortcuts(shortcuts);
    });
}

function renderShortcuts(shortcuts) {
    const container = document.getElementById('shortcutsContainer');
    container.innerHTML = '';

    shortcuts.forEach((shortcut, index) => {
        const shortcutItem = createShortcutItem(shortcut, index);
        container.appendChild(shortcutItem);
    });

    const addBtn = document.getElementById('addShortcutBtn');
    addBtn.disabled = shortcuts.length >= MAX_SHORTCUTS;
    if (shortcuts.length >= MAX_SHORTCUTS) {
        addBtn.textContent = `+ 添加快捷键 (已达上限 ${MAX_SHORTCUTS})`;
    }
}

function createShortcutItem(shortcut, index) {
    const item = document.createElement('div');
    item.className = 'shortcut-item';
    item.innerHTML = `
        <div class="shortcut-row">
            <div class="form-group">
                <label>快捷键 (如 Ctrl+1)</label>
                <input type="text" class="shortcut-key" value="${shortcut.key || ''}" 
                       placeholder="例如: Ctrl+1, Alt+S, Shift+P">
            </div>
            <div class="form-group">
                <label>CSS 选择器</label>
                <input type="text" class="shortcut-selector" value="${shortcut.selector || ''}" 
                       placeholder="例如: #submitBtn 或 .save-button">
            </div>
        </div>
        <div class="shortcut-row">
            <div class="form-group">
                <label>应用范围</label>
                <select class="shortcut-scope">
                    <option value="all" ${shortcut.scope === 'all' || !shortcut.scope ? 'selected' : ''}>所有网站</option>
                    <option value="specific" ${shortcut.scope === 'specific' ? 'selected' : ''}>特定网站</option>
                </select>
            </div>
            <div class="form-group">
                <label>网站 URL (特定网站时)</label>
                <input type="text" class="shortcut-url" value="${shortcut.url || ''}" 
                       placeholder="例如: github.com 或 example.com">
            </div>
        </div>
        <div class="shortcut-actions">
            <button class="btn-delete" onclick="deleteShortcut(${index})">🗑️ 删除</button>
        </div>
    `;
    return item;
}

function addShortcut() {
    chrome.storage.sync.get(['shortcuts'], (result) => {
        const shortcuts = result.shortcuts || [];
        
        if (shortcuts.length >= MAX_SHORTCUTS) {
            showStatus('已达到最大快捷键数量', 'error');
            return;
        }

        shortcuts.push({
            key: '',
            selector: '',
            scope: 'all',
            url: ''
        });

        renderShortcuts(shortcuts);
    });
}

function deleteShortcut(index) {
    if (confirm('确认删除这个快捷键吗？')) {
        chrome.storage.sync.get(['shortcuts'], (result) => {
            const shortcuts = result.shortcuts || [];
            shortcuts.splice(index, 1);
            renderShortcuts(shortcuts);
        });
    }
}

function saveShortcuts() {
    const items = document.querySelectorAll('.shortcut-item');
    const shortcuts = [];

    items.forEach(item => {
        const key = item.querySelector('.shortcut-key').value.trim();
        const selector = item.querySelector('.shortcut-selector').value.trim();
        const scope = item.querySelector('.shortcut-scope').value;
        const url = item.querySelector('.shortcut-url').value.trim();

        if (key && selector) {
            shortcuts.push({
                key: key,
                selector: selector,
                scope: scope,
                url: url
            });
        }
    });

    chrome.storage.sync.set({ shortcuts: shortcuts }, () => {
        showStatus('✅ 设置已保存！', 'success');
        
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'shortcutsUpdated' }).catch(() => {});
            });
        });
    });
}

function resetShortcuts() {
    if (confirm('确认重置所有快捷���吗？此操作无法撤销。')) {
        chrome.storage.sync.set({ shortcuts: [] }, () => {
            renderShortcuts([]);
            showStatus('✅ 已重置！', 'success');
        });
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    
    setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
    }, 3000);
}
