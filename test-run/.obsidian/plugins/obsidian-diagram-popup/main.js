'use strict';

var obsidian = require('obsidian');

class MermaidPopupSettingTab extends obsidian.PluginSettingTab {
    plugin;
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        const tableContainer = containerEl.createDiv({ cls: 'setting-table' });
        const table = tableContainer.createEl('table');
        const tbody = table.createEl('table');
        const row_01_popup_sz_and_dg_h_title = tbody.createEl('tr');
        const row_02_popup_sz_and_dg_h_val = tbody.createEl('tr');
        const td_01_1_popup_sz_title = row_01_popup_sz_and_dg_h_title.createEl('td');
        let popup_sz_title = td_01_1_popup_sz_title.createEl('h2', { text: 'Popup Size Init' });
        popup_sz_title.classList.add('config-text');
        const td_02_1_popup_sz = row_02_popup_sz_and_dg_h_val.createEl('td');
        // 弹窗初始化
        new obsidian.Setting(td_02_1_popup_sz)
            .setName('Choose the Popup Size')
            .addDropdown(dropdown => {
            let ddPopupSizeInit = this.plugin.settings.kvMapPopupSizeInit;
            for (const key in ddPopupSizeInit) {
                dropdown.addOption(key, ddPopupSizeInit[key]);
            }
            dropdown
                .setValue(this.plugin.settings.PopupSizeInitValue)
                .onChange(async (value) => {
                this.plugin.settings.PopupSizeInitValue = value;
                await this.plugin.saveSettings();
            });
        });
        let td_01_2_dg_h = row_01_popup_sz_and_dg_h_title.createEl('td');
        let td_02_1_dg_h_title = td_01_2_dg_h.createEl('h2', { text: 'Original Diagram Height' });
        td_02_1_dg_h_title.classList.add('config-text');
        const td_02_2_dg_h_val = row_02_popup_sz_and_dg_h_val.createEl('td');
        td_02_2_dg_h_val.classList.add('ori_diagram_height');
        let dg_h_val = this.plugin.settings.DiagramHeightVal;
        let dg_h_min = this.plugin.settings.DiagramHeightMin;
        let dg_h_max = this.plugin.settings.DiagramHeightMax;
        let dg_h_step = this.plugin.settings.DiagramHeightStep;
        let dg_h_val_min = td_02_2_dg_h_val.createEl('p');
        dg_h_val_min.setText(dg_h_min);
        let dg_h_val_input = td_02_2_dg_h_val.createEl('input');
        dg_h_val_input.setAttribute('type', 'range');
        dg_h_val_input.setAttribute('min', dg_h_min);
        dg_h_val_input.setAttribute('max', dg_h_max);
        dg_h_val_input.setAttribute('step', dg_h_step);
        dg_h_val_input.setAttribute('value', dg_h_val);
        let dg_h_val_max = td_02_2_dg_h_val.createEl('p');
        dg_h_val_max.setText(dg_h_max);
        let dg_h_val_cur_title = td_02_2_dg_h_val.createEl('p', { text: 'current:' });
        dg_h_val_cur_title.classList.add('ori_diagram_height_cur');
        let dg_h_val_cur = td_02_2_dg_h_val.createEl('p');
        dg_h_val_cur.classList.add('ori_diagram_height_val');
        dg_h_val_cur.setText(dg_h_val);
        // 监听 input 事件
        dg_h_val_input.addEventListener('input', (event) => {
            const value = dg_h_val_input.value; // 获取当前值
            dg_h_val_cur.setText(value + ''); // 更新显示
            this.plugin.settings.DiagramHeightVal = value;
            this.plugin.saveSettings();
        });
        this.setInfo(td_02_2_dg_h_val, 'Click for tips on Original Diagram Height Setting.', 'Original Diagram Height Setting', 'Under proportional scaling, ' +
            'adapt to the width of editor, ' +
            'and then if the height is still greater than the value of \'Original Diagram Height\',' +
            'it will adapt again. ');
        const row_1 = tbody.createEl('tr');
        const row_2 = tbody.createEl('tr');
        const td_1_1 = row_1.createEl('td');
        // 缩放设置标题
        let titleZoomRatio = td_1_1.createEl('h2', { text: 'Zoom Ratio' });
        titleZoomRatio.classList.add('config-text');
        const td_2_1 = row_2.createEl('td');
        // 缩放设置
        new obsidian.Setting(td_2_1)
            .setName('Choose the ratio for zooming in or out')
            .addDropdown(dropdown => {
            let ddZoomRatio = this.plugin.settings.kvMapZoomRatio;
            for (const key in ddZoomRatio) {
                dropdown.addOption(key, ddZoomRatio[key]);
            }
            dropdown
                .setValue(this.plugin.settings.ZoomRatioValue)
                .onChange(async (value) => {
                this.plugin.settings.ZoomRatioValue = value;
                await this.plugin.saveSettings();
            });
        });
        const td_1_2 = row_1.createEl('td');
        // 移动步长设置标题
        let titleMoveStep = td_1_2.createEl('h2', { text: 'Move Step' });
        titleMoveStep.classList.add('config-text');
        const td_2_2 = row_2.createEl('td');
        // 移动步长设置
        new obsidian.Setting(td_2_2)
            .setName('Choose the step for moving')
            .addDropdown(dropdown => {
            let ddZoomRatio = this.plugin.settings.kvMapMoveStep;
            for (const key in ddZoomRatio) {
                dropdown.addOption(key, ddZoomRatio[key]);
            }
            dropdown
                .setValue(this.plugin.settings.MoveStepValue)
                .onChange(async (value) => {
                this.plugin.settings.MoveStepValue = value;
                await this.plugin.saveSettings();
            });
        });
        // 开启弹窗按钮位置
        let title_btn_pos = containerEl.createEl('h2', { text: 'Open Popup Button Relative Position Init' });
        title_btn_pos.classList.add('config-text');
        const kvRow_open_btn = containerEl.createDiv({ cls: 'kv-row open_btn_pos' });
        this.slideInput(kvRow_open_btn, "x:", this.plugin.settings.open_btn_pos_x, (val) => { this.plugin.settings.open_btn_pos_x = val; });
        this.slideInput(kvRow_open_btn, "y:", this.plugin.settings.open_btn_pos_y, (val) => { this.plugin.settings.open_btn_pos_y = val; });
        this.setInfo(kvRow_open_btn, 'Click for tips on Open Popup Button Relative Position Init Setting.', 'Open Popup Button Relative Position Init Setting', 'The origin of open popup button relative position, is at top left of the diagram container.' +
            'In the setting, x represents the width ratio from the origin, and y represents the height ratio from that.');
        let title = containerEl.createEl('h2', { text: 'Add New Diagram' });
        title.classList.add('config-text');
        // 添加文本说明
        containerEl.createEl('p', { text: 'This plugin supports customing diagrams from mermaid, plantuml, graphviz and so on. ' });
        // 创建一个 div 来包含输入框和按钮，并使用 Flexbox 布局
        const kvRow = containerEl.createDiv({ cls: 'kv-row' });
        // 创建第一个输入框 (Key)
        const keyInput = kvRow.createEl('input', { type: 'text', placeholder: 'Input Diagram Source please' });
        // 创建第二个输入框 (Value)
        const valueInput = kvRow.createEl('input', { type: 'text', placeholder: 'Input Class Name please' });
        valueInput.setAttr('title', 'format: start with \'.\', and then \'A-Za-z0-9\'');
        // 创建保存按钮
        const saveButton = kvRow.createEl('button', { text: 'save' });
        // 添加保存按钮的点击事件
        saveButton.onclick = async () => {
            const key = keyInput.value.trim();
            const value = valueInput.value.trim();
            if (key && value) {
                // 判断 key 是否已存在
                if (this.plugin.settings.kvMapReserved[key] || this.plugin.settings.kvMap[key] || this.plugin.settings.kvMapDefault[key]) {
                    new obsidian.Notice('Diagram Source exists');
                    return;
                }
                this.plugin.settings.kvMap[key] = value;
                await this.plugin.saveSettings();
                //this.displayKvMap(containerEl);
                this.display();
                new obsidian.Notice(`Saved Diagram Source And Class Name: ${key} -> ${value}`);
                // 清空输入框
                keyInput.value = '';
                valueInput.value = '';
            }
            else {
                new obsidian.Notice('Input Diagram Source and Class Name please');
            }
        };
        // 创建复位按钮
        const resetButton = kvRow.createEl('button', { text: 'reset' });
        // 添加复位按钮的点击事件
        resetButton.onclick = async () => {
            // 弹出确认提示窗口
            const confirmed = resetButton.win.confirm("Confirm to reset? It could not be restored!");
            if (confirmed) {
                // 用户确认，执行删除操作
                this.plugin.settings.kvMap = {};
                this.plugin.saveData(this.plugin.settings);
                new obsidian.Notice("reset success");
                //this.displayKvMap(containerEl);
                this.display();
            }
            else {
                // 用户取消，不执行任何操作
                new obsidian.Notice("reset canceled");
            }
        };
        // 显示保存后的键值对
        this.displayKvMap(containerEl);
        let titleConnect = containerEl.createEl('h2', { text: 'How to work in other plugins' });
        titleConnect.classList.add('config-text-connect');
        containerEl.createEl('p', { text: '\'.diagram-popup\' is a preserved class for other plugins to work with.' });
        containerEl.createEl('p', { text: 'if you add it to the class list of your target container, it will get the functionality.' });
    }
    setInfo(containerEl, tip, title, msg) {
        const addSettings = new obsidian.Setting(containerEl);
        addSettings.addExtraButton((extra) => {
            extra.setIcon('info');
            extra.setTooltip(tip);
            extra.onClick(() => {
                let msgModal = new obsidian.Modal(this.app);
                msgModal.setTitle(title);
                msgModal.setContent(msg);
                msgModal.open();
            });
            extra.extraSettingsEl.closest('.setting-item')?.classList.add('settings-icon');
        });
    }
    slideInput(containerEl, title, value, saveVal) {
        let input_title = containerEl.createEl('p');
        input_title.classList.add('open_btn_pos_slide_title');
        input_title.setText(title);
        let input_val_min = containerEl.createEl('p');
        input_val_min.setText('0');
        let input = containerEl.createEl('input');
        input.classList.add('open_btn_pos_slide_width');
        input.setAttribute('type', 'range');
        input.setAttribute('min', '0');
        input.setAttribute('max', '100');
        input.setAttribute('step', '10');
        input.setAttribute('value', value);
        let input_val_max = containerEl.createEl('p');
        input_val_max.setText('100%');
        let input_val_cur_title = containerEl.createEl('p', { text: 'current:' });
        input_val_cur_title.classList.add('open_btn_pos_cur_title');
        let input_val_cur = containerEl.createEl('p');
        input_val_cur.classList.add('open_btn_pos_cur_val');
        input_val_cur.setText(value);
        let input_val_cur_per = containerEl.createEl('p');
        input_val_cur_per.setText('%');
        input_val_cur_per.classList.add('open_btn_pos_cur_per');
        // 监听 input 事件
        input.addEventListener('input', (event) => {
            const value = input.value; // 获取当前值
            input_val_cur.setText(value + ''); // 更新显示
            saveVal(value);
            this.plugin.saveSettings();
        });
    }
    // 在页面下方显示所有保存的键值对（以表格形式）
    displayKvMap(containerEl) {
        // 清除旧的显示内容
        const existingDisplay = containerEl.querySelector('.kv-display');
        if (existingDisplay)
            existingDisplay.remove();
        // 创建新的显示容器
        const kvDisplay = containerEl.createDiv({ cls: 'kv-display' });
        // 获取所有键值对
        // 合并两个对象
        let mergedMap = { ...this.plugin.settings.kvMapReserved, ...this.plugin.settings.kvMapDefault, ...this.plugin.settings.kvMap };
        // 转换为二维数组
        let kvEntries = Object.entries(mergedMap);
        if (kvEntries.length > 0) {
            // 创建表格元素
            const table = kvDisplay.createEl('table');
            // 创建标题栏
            const thead = table.createEl('thead');
            const headerRow = thead.createEl('tr');
            headerRow.createEl('th', { text: 'Diagram Source' });
            headerRow.createEl('th', { text: 'Class Name' });
            headerRow.createEl("th", { text: "Actions" }); // 添加 "Actions" 标题列
            // 创建表格主体
            const tbody = table.createEl('tbody');
            // 循环遍历键值对，添加到表格中
            kvEntries.forEach(([key, value]) => {
                const row = tbody.createEl('tr');
                row.createEl('td', { text: key });
                row.createEl('td', { text: value });
                // 添加删除按钮
                const actionsTd = row.createEl("td");
                if (Object.values(this.plugin.settings.kvMapDefault).includes(value))
                    return;
                if (Object.values(this.plugin.settings.kvMapReserved).includes(value))
                    return;
                const deleteButton = actionsTd.createEl("button", { text: "del" });
                // 绑定删除事件
                deleteButton.addEventListener("click", () => {
                    delete this.plugin.settings.kvMap[key]; // 删除 KV 对
                    //this.displayKvMap(containerEl);
                    this.display();
                    this.plugin.saveData(this.plugin.settings);
                });
            });
        }
        else {
            kvDisplay.setText('No Diagram Setting Saved');
        }
    }
}

const DEFAULT_SETTINGS = {
    kvMap: {},
    kvMapDefault: {
        'Mermaid': '.mermaid'
    },
    kvMapReserved: {
        'Reserved': '.diagram-popup'
    },
    PopupSizeInitValue: '1.50',
    kvMapPopupSizeInit: {
        '1.00': '1.00',
        '1.25': '1.25',
        '1.50': '1.50',
        '1.75': '1.75',
        '2.00': '2.00',
        '2.25': '2.25',
        '2.50': '2.50',
        '2.75': '2.75',
        '3.00': '3.00'
    },
    DiagramHeightVal: '600',
    DiagramHeightMin: '50',
    DiagramHeightMax: '1500',
    DiagramHeightStep: '50',
    ZoomRatioValue: '0.2',
    kvMapZoomRatio: {
        '0.1': '0.1',
        '0.2': '0.2',
        '0.3': '0.3',
        '0.4': '0.4'
    },
    MoveStepValue: '30',
    kvMapMoveStep: {
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '60',
        '60': '60',
    },
    open_btn_pos_x: '90',
    open_btn_pos_y: '90',
};
class MermaidPopupPlugin extends obsidian.Plugin {
    settings;
    observer_editting;
    observer_reading;
    openPopupBtn = 'mermaid-popup-button';
    openPopupBtnReading = 'mermaid-popup-button-reading';
    async onload() {
        console.log(`Loading ${this.manifest.name} ${this.manifest.version}`);
        // 加载设置
        await this.loadSettings();
        // 添加设置页面
        this.addSettingTab(new MermaidPopupSettingTab(this.app, this));
        this.registerMarkdownPostProcessor((element, context) => {
            //this.registerMarkdownPostProcessor_MermaidPopup(element);
        });
        // 监听模式切换事件
        this.registerEvent(this.app.workspace.on('layout-change', () => {
            let view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
            if (!view) { // 编辑器关闭
                this.RelaseWhenfileClose();
            }
            if (view && view.getViewType() === 'markdown') {
                // 类型断言为 MarkdownView，以便访问 contentEl
                const mode = view.getMode();
                const isPreview = mode === 'preview';
                //let container = view.containerEl.childNodes[1].childNodes[0] as HTMLElement; // 编辑容器
                let container = view.containerEl.querySelector('.markdown-source-view'); // 编辑容器
                if (isPreview) {
                    //container = view.containerEl.childNodes[1].childNodes[1] as HTMLElement; // 阅读容器
                    container = view.containerEl.querySelector('.markdown-preview-view'); // 阅读容器
                    let targetArr = this.GetSettingsClassElementAll(container);
                    for (var i = 0; i < targetArr.length; i++)
                        this.addPopupButton(targetArr[i], isPreview);
                    this.ObserveToAddPopupButton_Reading(container, isPreview);
                    return;
                }
                let targetArr = this.GetSettingsClassElementAll(container);
                for (var i = 0; i < targetArr.length; i++)
                    this.addPopupButton(targetArr[i]);
                this.ObserveToAddPopupButton(container);
                //this.ObserveToAddPopupButton(view.containerEl, false);
            }
        }));
    }
    RelaseWhenfileClose() {
        this.observer_editting?.disconnect();
        this.observer_editting = null;
        this.observer_reading?.disconnect();
        this.observer_reading = null;
    }
    onunload() {
        console.log(`Unloading ${this.manifest.name} ${this.manifest.version}`);
    }
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    isPreviewMode() {
        let view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        let mode = view?.getViewType();
        return mode == "preview";
    }
    // 渲染直接生成，可直接判断添加按钮和弹窗事件
    registerMarkdownPostProcessor_MermaidPopup(ele) {
        let parentElement = ele.parentElement;
        if (parentElement) {
            this.addPopupButton(parentElement, false);
        }
    }
    ObserveToAddPopupButton(myView, isPreviewMode = false) {
        if (this.observer_editting)
            return;
        this.observer_editting = new MutationObserver((mutationsList, observer) => {
            for (let i = 0; i < mutationsList.length; i++) {
                let mutation = mutationsList[i];
                if (mutation.type !== "childList") {
                    continue;
                }
                if (mutation.addedNodes.length < 1) {
                    continue;
                }
                // let target = mutation.target as HTMLElement;
                // let container = this.GetSettingsClassElement(target);
                // if (!container)
                //     return;
                // this.addPopupButton(container as HTMLElement, isPreviewMode);    
                mutation.addedNodes.forEach((node) => {
                    let nodeEle = node;
                    if (this.IsClassListContains_SettingsDiagramClass(nodeEle))
                        this.addPopupButton(nodeEle, isPreviewMode);
                });
            }
        });
        this.observer_editting.observe(myView, { childList: true, subtree: true });
    }
    ObserveToAddPopupButton_Reading(myView, isPreviewMode) {
        if (this.observer_reading)
            return;
        this.observer_reading = new MutationObserver((mutationsList, observer) => {
            let containerArr = this.GetSettingsClassElementAll(myView);
            for (var i = 0; i < containerArr.length; i++) {
                let container = containerArr[i];
                if (this.IsClassListContains_SettingsDiagramClass(container))
                    this.addPopupButton(container, isPreviewMode);
            }
        });
        this.observer_reading.observe(myView, { childList: true, subtree: true });
    }
    GetSettingsClassElement(contentEl) {
        let selector = this.GetSettingsDiagramClassNameAll().join(', ');
        return contentEl.querySelector(selector);
    }
    GetSettingsClassElementAll(contentEl) {
        let selector = this.GetSettingsDiagramClassNameAll().join(', ');
        return contentEl.querySelectorAll(selector);
    }
    GetSettingsDiagramClassNameAll() {
        let mapDiagramClassAll = { ...this.settings.kvMapReserved, ...this.settings.kvMapDefault, ...this.settings.kvMap };
        return Object.values(mapDiagramClassAll);
    }
    // Add a button to each Mermaid diagram for triggering the popup
    addPopupButton(target, isPreviewMode = false) {
        let popupButtonClass = 'mermaid-popup-button';
        let popupButtonClass_container = 'mermaid-popup-button-container';
        if (isPreviewMode) {
            popupButtonClass_container = 'mermaid-popup-button-container-reading';
            popupButtonClass = 'mermaid-popup-button-reading';
        }
        if (target.querySelector('.' + popupButtonClass))
            return;
        // Create the popup button
        const popupButton = target.doc.createElement('button');
        if (!target.classList.contains(popupButtonClass_container))
            target.classList.add(popupButtonClass_container);
        popupButton.classList.add(popupButtonClass);
        popupButton.textContent = 'Open Popup';
        obsidian.setIcon(popupButton, 'maximize');
        popupButton.title = 'Open Popup';
        target.appendChild(popupButton);
        this.adjustDiagramWidthAndHeight_ToContainer(target);
        this.setPopupBtnPos(popupButton, target);
        // bind click to popup
        this.registerDomEvent(target, 'click', this.handleMermaidClick);
        let isDragging = false;
        // Add click event listener for the button to open the popup
        popupButton.addEventListener('click', (evt) => {
            // Only trigger popup if no dragging occurred
            if (!isDragging) {
                evt.stopPropagation(); // Prevent triggering any other click events
                this.openPopup(target);
            }
            // Reset the dragging flag after click
            isDragging = false;
        });
        // Make the button draggable
        this.makeButtonDraggable(popupButton, target, () => {
            isDragging = true; // Set dragging to true during the drag
        });
    }
    setPopupBtnPos(btn, target) {
        let w_b = btn.offsetWidth;
        let h_b = btn.offsetHeight;
        console.log('w_b', w_b, 'h_b', h_b);
        let w = target.offsetWidth;
        let h = target.offsetHeight;
        let x_setting = this.settings.open_btn_pos_x;
        let y_setting = this.settings.open_btn_pos_y;
        let left = this.getWidth(target) * parseFloat(x_setting) / 100;
        let top = this.getHeight(target) * parseFloat(y_setting) / 100;
        left = (left + w_b) > w ? (left - w_b) : left;
        top = (top + h_b) > h ? (top - h_b) : top;
        left = left < 0 ? 0 : left;
        top = top < 0 ? 0 : top;
        btn.setCssStyles({
            left: left + 'px',
            top: top + 'px'
        });
    }
    adjustDiagramWidthAndHeight_ToContainer(container) {
        let desEle = this.getDiagramElement(container);
        if (!desEle)
            return;
        let des_w = this.getWidth(desEle);
        let des_h = this.getHeight(desEle);
        let rate_by_width = 1;
        if (des_w > container.offsetWidth) // 图表宽超容器
         {
            rate_by_width = container.offsetWidth / des_w;
        }
        let rate_by_height = 1;
        let dg_h_val = parseInt(this.settings.DiagramHeightVal);
        if (des_h > dg_h_val) // 图表高超容器
         {
            rate_by_height = dg_h_val / des_h;
        }
        if (rate_by_width == 1 && rate_by_height == 1)
            return;
        let rate = rate_by_width < rate_by_height ? rate_by_width : rate_by_height;
        desEle.setCssStyles({
            height: des_h * rate + 'px',
            width: des_w * rate + 'px'
        });
    }
    getWidth(ele) {
        return parseFloat(ele.getCssPropertyValue('width'));
    }
    getHeight(ele) {
        return parseFloat(ele.getCssPropertyValue('height'));
    }
    getDiagramElement(container) {
        let diagramSvg = Array.from(container.children).find(child => child.tagName.toLowerCase() === 'svg');
        if (diagramSvg) {
            return diagramSvg;
        }
        let diagramImg = Array.from(container.children).find(child => child.tagName.toLowerCase() === 'img');
        if (diagramImg)
            return diagramImg;
        return null;
    }
    makeButtonDraggable(button, mermaidDiv, onDragStart) {
        // posX, posY, 移动步长
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
        button.onmousedown = (e) => {
            e.preventDefault();
            // Get the mouse cursor position at startup
            mouseX = e.clientX;
            mouseY = e.clientY;
            //button = 0;
            // 初始化按钮样式位置偏移量
            button.setCssStyles({
                left: button.offsetLeft + "px",
                top: button.offsetTop + "px"
            });
            // Call function when mouse is moved
            button.doc.onmousemove = (e) => {
                e.preventDefault();
                // Calculate the new cursor position
                posX = mouseX - e.clientX;
                posY = mouseY - e.clientY;
                mouseX = e.clientX;
                mouseY = e.clientY;
                onDragStart(); // 标记为拖动
                let btn_posX = button.offsetLeft - posX;
                let btn_posY = button.offsetTop - posY;
                btn_posX = btn_posX < 0 ? 0 : btn_posX;
                btn_posX = button.parentElement ?
                    ((btn_posX + button.offsetWidth) > button.parentElement?.offsetWidth ? button.offsetLeft : btn_posX)
                    : btn_posX;
                btn_posY = btn_posY < 0 ? 0 : btn_posY;
                btn_posY = button.parentElement ?
                    ((btn_posY + button.offsetHeight) > button.parentElement?.offsetHeight ? button.offsetTop : btn_posY)
                    : btn_posY;
                // Set the element's new position
                button.setCssStyles({
                    bottom: 'auto',
                    right: 'auto',
                    left: btn_posX + "px",
                    top: btn_posY + "px"
                });
            };
            // Stop moving when mouse is released
            button.doc.onmouseup = () => {
                button.doc.onmousemove = null;
                button.doc.onmouseup = null;
            };
        };
    }
    GetPosButtonToMermaid(eleBtn, eleDiv) {
        // 获取按钮和 div 的位置信息
        const divRect = eleDiv.getBoundingClientRect();
        const buttonRect = eleBtn.getBoundingClientRect();
        // 计算按钮相对于 div 的位置
        const buttonRelativeTop = buttonRect.top - divRect.top;
        const buttonRelativeLeft = buttonRect.left - divRect.left;
        return { top: buttonRelativeTop, left: buttonRelativeLeft };
    }
    IsClassListContains_SettingsDiagramClass(ele) {
        if (ele.classList == null || ele.classList.length == 0)
            return false;
        let classnameArr = this.GetSettingsDiagramClassNameAll();
        for (var i = 0; i < classnameArr.length; i++) {
            let name = classnameArr[i];
            name = name.substring(1);
            if (ele.classList.contains(name))
                return true;
        }
        return false;
    }
    GetSettingsClassElementClosest(startElement) {
        let _parent = startElement;
        while (_parent) {
            if (this.IsClassListContains_SettingsDiagramClass(_parent)) {
                return _parent;
            }
            if (_parent.parentElement)
                _parent = _parent.parentElement;
            else
                break;
        }
        return null;
    }
    // 绑定新的事件处理
    handleMermaidClick = (evt) => {
        if (!evt.ctrlKey)
            return;
        evt.stopPropagation();
        let targetElement = evt.target;
        let closestElement = this.GetSettingsClassElementClosest(targetElement);
        if (closestElement)
            this.openPopup(closestElement);
    };
    openPopup(targetElement) {
        // targetElement.requestFullscreen();
        // return;
        // popup-overlay
        const overlay = targetElement.doc.createElement('div');
        overlay.classList.add('popup-overlay');
        // copy target
        let targetElementClone = targetElement.cloneNode(true);
        let targetElementInPopup = targetElementClone;
        let childElement = targetElementInPopup.querySelector('.' + this.openPopupBtn); // 获取需要删除的子元素
        if (childElement) {
            targetElementInPopup.removeChild(childElement); // 从父元素中删除子元素
        }
        else {
            childElement = targetElementInPopup.querySelector('.' + this.openPopupBtnReading);
            if (childElement) {
                targetElementInPopup.removeChild(childElement);
            }
        }
        targetElementInPopup.classList.add('popup-content', 'draggable', 'resizable');
        let _doc = targetElementInPopup.doc;
        // Create a container for the control buttons
        let _buttonContainer = this.createButtonContainer(_doc, targetElementInPopup, overlay);
        // Append popup and button container to the overlay
        overlay.appendChild(targetElementInPopup);
        overlay.appendChild(_buttonContainer);
        _doc.body.appendChild(overlay);
        // Close popup on overlay click
        overlay.addEventListener('click', (evt) => {
            evt.doc.body.removeChild(overlay);
        });
        // Stop propagation to prevent closing when clicking on popup content
        targetElementInPopup.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });
        // Listen for the Escape key to close the popup
        targetElementInPopup.doc.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                targetElementInPopup.doc.body.removeChild(overlay);
            }
        });
        this.setPopupSize(targetElementInPopup, this.getWidth(targetElement), this.getHeight(targetElement));
        // Make the popup draggable
        this.makeDraggable(targetElementInPopup);
        // Make the popup resizable
        targetElementInPopup.classList.add('resizable');
        // Add mouse wheel event for zooming
        targetElementInPopup.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            const isOut = evt.deltaY > 0;
            this.zoomPopupAtCursor(targetElementInPopup, isOut, evt);
        });
    }
    setPopupSize(_targetElementInPopup, width_md, height_md) {
        let multiVal = parseFloat(this.settings.PopupSizeInitValue);
        if (typeof multiVal != "number") {
            return;
        }
        let w_t = this.getWidth(_targetElementInPopup);
        this.getHeight(_targetElementInPopup);
        let scale_num = width_md * multiVal / w_t;
        _targetElementInPopup.setCssStyles({
            transform: `scale(${scale_num})`
        });
    }
    createButtonContainer(_doc, _targetElementInPopup, _overlay) {
        const buttonContainer = _doc.createElement('div');
        buttonContainer.classList.add('button-container');
        // Create zoom in and zoom out buttons
        const zoomInButton = _doc.createElement('button');
        zoomInButton.classList.add('control-button', 'zoom-in');
        zoomInButton.textContent = '+';
        const zoomOutButton = _doc.createElement('button');
        zoomOutButton.classList.add('control-button', 'zoom-out');
        zoomOutButton.textContent = '-';
        // Create arrow buttons
        const upButton = _doc.createElement('button');
        upButton.classList.add('control-button', 'arrow-up');
        upButton.textContent = '↑';
        const downButton = _doc.doc.createElement('button');
        downButton.classList.add('control-button', 'arrow-down');
        downButton.textContent = '↓';
        const leftButton = _doc.doc.createElement('button');
        leftButton.classList.add('control-button', 'arrow-left');
        leftButton.textContent = '←';
        const rightButton = _doc.doc.createElement('button');
        rightButton.classList.add('control-button', 'arrow-right');
        rightButton.textContent = '→';
        // Create a close button
        const closeButton = _doc.doc.createElement('button');
        closeButton.classList.add('control-button', 'close-popup');
        closeButton.textContent = 'X';
        // Append buttons to the button container
        buttonContainer.appendChild(zoomInButton);
        buttonContainer.appendChild(zoomOutButton);
        buttonContainer.appendChild(upButton);
        buttonContainer.appendChild(downButton);
        buttonContainer.appendChild(leftButton);
        buttonContainer.appendChild(rightButton);
        buttonContainer.appendChild(closeButton);
        // Stop propagation to prevent closing when clicking on control buttons and container
        buttonContainer.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });
        zoomInButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(_targetElementInPopup, false);
        });
        zoomOutButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(_targetElementInPopup, true);
        });
        upButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(_targetElementInPopup, 0, -1);
        });
        downButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(_targetElementInPopup, 0, 1);
        });
        leftButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(_targetElementInPopup, -1, 0);
        });
        rightButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(_targetElementInPopup, 1, 0);
        });
        closeButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.doc.body.removeChild(_overlay);
        });
        return buttonContainer;
    }
    // Helper method to move the popup
    movePopup(popup, dx, dy) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        // Calculate new position
        const newX = matrix.m41 + (dx == 0 ? dx : dx * parseInt(this.settings.MoveStepValue));
        const newY = matrix.m42 + (dy == 0 ? dy : dy * parseInt(this.settings.MoveStepValue));
        popup.setCssStyles({ transform: `translate(${newX}px, ${newY}px) scale(${matrix.a})` });
    }
    // Helper method to zoom the popup and SVG
    zoomPopup(popup, isOut) {
        this.zoomPopupCore(popup, isOut, 1, 1);
    }
    // Helper method to zoom the popup at the cursor position
    zoomPopupAtCursor(popup, isOut, evt) {
        // Get the current position of the popup. 
        // popup 当前中心坐标 = 相对客户端左上的坐标 + 自身长宽/2
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;
        // Calculate the distance from the popup center to the mouse position
        const offsetX = evt.clientX - popupCenterX;
        const offsetY = evt.clientY - popupCenterY;
        this.zoomPopupCore(popup, isOut, offsetX, offsetY);
    }
    // Helper method to zoom the popup and SVG
    zoomPopupCore(popup, isOut, offsetX, offsetY) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;
        // isOut, 1.1
        let symbol = isOut ? -1 : 1;
        const newScale = currentScale * (1 + symbol * parseFloat(this.settings.ZoomRatioValue));
        // Adjust the translation to keep the popup centered relative to the overlay
        const newX = matrix.m41 - offsetX * symbol * parseFloat(this.settings.ZoomRatioValue);
        const newY = matrix.m42 - offsetY * symbol * parseFloat(this.settings.ZoomRatioValue);
        popup.setCssStyles({
            transformOrigin: 'center center',
            transform: `translate(${newX}px, ${newY}px) scale(${newScale})`
        });
    }
    // Helper method to make the popup draggable
    makeDraggable(element) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        const mouseDownHandler = (e) => {
            isDragging = true;
            if (!e.target)
                return;
            const ele_target = e.target;
            const style = ele_target.win.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
            startX = e.clientX - matrix.m41;
            startY = e.clientY - matrix.m42;
            e.doc.addEventListener('mousemove', mouseMoveHandler);
            e.doc.addEventListener('mouseup', mouseUpHandler);
            ele_target.closest('.popup-content')?.classList.add('dragging');
        };
        const mouseMoveHandler = (e) => {
            if (!isDragging)
                return;
            if (!e.target)
                return;
            const ele_target = e.target;
            const style = ele_target.win.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
            // 直接计算当前鼠标位置与起始位置的差值
            initialX = e.clientX - startX;
            initialY = e.clientY - startY;
            element.setCssStyles({ transform: `translate(${initialX}px, ${initialY}px) scale(${matrix.a})` });
        };
        const mouseUpHandler = (e) => {
            isDragging = false;
            e.doc.removeEventListener('mousemove', mouseMoveHandler);
            e.doc.removeEventListener('mouseup', mouseUpHandler);
            const ele_target = e.target;
            ele_target.closest('.popup-content')?.classList.remove('dragging');
        };
        element.addEventListener('mousedown', mouseDownHandler);
    }
}

module.exports = MermaidPopupPlugin;
