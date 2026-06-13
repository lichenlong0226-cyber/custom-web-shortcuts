# 🎯 Custom Web Shortcuts - Edge浏览器扩展

为任何网页添加自定义快捷键来快速点击按钮的 Microsoft Edge 浏览器扩展。

## ✨ 功能特性

- 🌐 **适用于所有网站** - 为任何网站配置快捷键
- ⌨️ **自定义快捷键** - 支持 Ctrl, Alt, Shift, Meta 组合键
- 🎯 **精准定位** - 使用 CSS 选择器点击目标按钮
- 💾 **云端同步** - 使用 Chrome 云存储自动同步设置
- 📊 **支持10个快捷键** - 足够满足日常需求
- 🌍 **按网站配置** - 可为特定网站配置不同快捷键
- ⚡ **快速反馈** - 点击时有绿色闪烁提示

## 📦 安装步骤

### 方法1：开发者模式安装（推荐用于开发）

1. 克隆或下载本仓库
```bash
git clone https://github.com/lichenlong0226-cyber/custom-web-shortcuts.git
cd custom-web-shortcuts
```

2. 打开 Edge 浏览器，进入 `edge://extensions/`

3. 开启右上角的 **开发者模式**

4. 点击 **加载解包的扩展程序**，选择本仓库文件夹

5. 完成！现在可以使用该扩展了

### 方法2：从源代码安装

1. 确保已有所有文件：
   - `manifest.json`
   - `popup.html`, `options.html`
   - `js/` 文件夹内的所有文件
   - `styles/` 文件夹内的所有文件

2. 按照方法1的步骤2-5进行

## 🚀 使用指南

### 配置快捷键

1. 点击扩展图标
2. 点击 **⚙️ 打开设置** 按钮
3. 点击 **+ 添加快捷键** 按钮
4. 填写以下信息：
   - **快捷键**：输入要使用的快捷键组合（如 `Ctrl+1`, `Alt+S`）
   - **CSS选择器**：输入目标按钮的选择器
   - **应用范围**：选择所有网站或特定网站
   - **网站URL**（可选）：如果选择特定网站，输入网址
5. 点击 **💾 保存设置**

### 获取CSS选择器

1. 在网页上右键点击要快速点击的按钮
2. 选择 **检查** (Inspect Element)
3. 查看代码，找到该按钮的 `id` 或 `class`：
   - 如果有 `id="submitBtn"`，则选择器为 `#submitBtn`
   - 如果有 `class="save-button"`，则选择器为 `.save-button`
   - 如果有 `class="btn primary"`，则选择器为 `.btn.primary` 或 `.btn`

### 快捷键格式

| 格式 | 说明 | 示例 |
|------|------|------|
| `Ctrl+数字` | Ctrl与数字组合 | `Ctrl+1`, `Ctrl+2` |
| `Alt+字母` | Alt与字母组合 | `Alt+S`, `Alt+D` |
| `Shift+字母` | Shift与字母组合 | `Shift+E`, `Shift+P` |
| `Meta+字母` | Win/Cmd与字母组合 | `Meta+K` |

## 📝 配置示例

### 例子1：GitHub 快速提交

| 快捷键 | 选择器 | 网站 |
|--------|--------|------|
| Ctrl+1 | `button[type="submit"]` | github.com |
| Ctrl+2 | `.js-comment-edit-button` | github.com |

### 例子2：邮箱快速发送

| 快捷键 | 选择器 | 网站 |
|--------|--------|------|
| Ctrl+Enter | `[aria-label="Send"]` | mail.google.com |

### 例子3：表单快速提交

| 快捷键 | 选择器 | 网站 |
|--------|--------|------|
| Ctrl+S | `#submitForm` | 所有网站 |

## 🔍 CSS 选择器速查

| 类型 | 语法 | 示例 |
|------|------|------|
| ID选择器 | `#id` | `#submitBtn` |
| Class选择器 | `.class` | `.save-button` |
| 标签选择器 | `tagname` | `button` |
| 属性选择器 | `[attr="value"]` | `[type="submit"]` |
| 多个class | `.class1.class2` | `.btn.primary` |
| 后代选择器 | `parent child` | `form button` |

## ⚠️ 常见问题

### Q: 快捷键不工作？
**A:** 
- 确保已保存设置
- 检查CSS选择器是否正确（F12检查元素）
- 确保快捷键格式正确（如 `Ctrl+1`）
- 尝试刷新网页

### Q: 只识别第一个元素？
**A:** CSS选择器只会点击第一个匹配的元素。如果有多个元素，请使用更具体的选择器。

### Q: 如何删除快捷键？
**A:** 在设置页面点击快捷键项下的 **🗑️ 删除** 按钮。

### Q: 数据会被保存吗？
**A:** 是的，所有设置都通过 Chrome 云存储保存，登录同一Microsoft账户的设备会自动同步。

## 🛠️ 技术栈

- **Manifest V3** - 最新的扩展开发标准
- **Chrome Storage API** - 用于数据持久化
- **Content Scripts** - 在网页中执行脚本
- **CSS Selectors** - 精准定位元素

## 📄 文件结构

```
custom-web-shortcuts/
├── manifest.json          # 扩展配置文件
├── popup.html            # 扩展弹窗界面
├── options.html          # 设置页面
├── js/
│   ├── popup.js         # 弹窗逻辑
│   ├── options.js       # 设置页逻辑
│   ├── content.js       # 网页脚本（处理快捷键）
│   └── background.js    # 后台服务
├── styles/
│   ├── popup.css        # 弹窗样式
│   └── options.css      # 设置页样式
└── README.md            # 本文件
```

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License - 自由使用和修改

## 💡 建议和反馈

如有建议或发现bug，请在 [GitHub Issues](https://github.com/lichenlong0226-cyber/custom-web-shortcuts/issues) 中提出。

---

**注意：** 此扩展仅在 Edge 浏览器中测试。Chrome 浏览器也应该能使用，但需要从 Chrome Web Store 安装（如果已发布）或使用开发者模式。
