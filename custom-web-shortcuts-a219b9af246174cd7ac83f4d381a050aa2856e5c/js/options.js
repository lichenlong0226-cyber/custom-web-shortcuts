const MAX_SHORTCUTS = 10;

document.addEventListener('DOMContentLoaded', () => {
    loadShortcuts();
    
    // 检查是否有从右键菜单传入的选择器，有则自动添加
    chrome.storage.sync.get(['pendingSelector'], (result) => {
        if (result.pendingSelector) {
            const sel = result.pendingSelector;
            chrome.storage.sync.remove('pendingSelector');
            chrome.storage.sync.get(['shortcuts'], (r) => {
                const shortcuts = r.shortcuts || [];
                if (shortcuts.length < MAX_SHORTCUTS) {
                    shortcuts.push({ key: '', selector: sel, scope: 'all', url: '' });
                    renderShortcuts(shortcuts);
                    showStatus('✅ 已从右键菜单填入选择器: ' + sel, 'success');
                }
            });
        }
    });
    
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
                       placeholder="点击后按快捷键">
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
    
    // 设置按键识别
    const keyInput = item.querySelector('.shortcut-key');
    setupKeyCapture(keyInput);
    
    return item;
}

// 按键识别：点击输入框后直接按键盘，自动填入组合键
function setupKeyCapture(input) {
    input.addEventListener('focus', function() {
        this.value = '';
        this.placeholder = '按下快捷键...';
        this.classList.add('listening');
    });
    
    input.addEventListener('keydown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const keys = [];
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.altKey) keys.push('Alt');
        if (e.shiftKey) keys.push('Shift');
        if (e.metaKey) keys.push('Meta');
        
        const key = e.key;
        const isModifier = ['Control', 'Alt', 'Shift', 'Meta'].includes(key);
        
        if (!isModifier) {
            const keyStr = key.length === 1 ? key.toUpperCase() : key;
            keys.push(keyStr);
            this.value = keys.join('+');
            this.classList.remove('listening');
            this.placeholder = '点击后按快捷键';
            this.blur();
        }
    });
    
    input.addEventListener('blur', function() {
        this.classList.remove('listening');
        if (!this.value) {
            this.placeholder = '点击后按快捷键';
        }
    });
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
