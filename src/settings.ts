import { App, Plugin, PluginSettingTab, Setting, TFile, Notice } from 'obsidian';
import MermaidPopupPlugin from './main'

class MermaidPopupSettingTab extends PluginSettingTab {
    plugin: MermaidPopupPlugin;

    constructor(app: App, plugin: MermaidPopupPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();


        let titleZoomInit = containerEl.createEl('h2', { text: 'Popup Size Init' });
        titleZoomInit.classList.add('config-text');
        // 弹窗初始化
        new Setting(containerEl)
        .setName('Choose the Popup Size')
        .addDropdown(dropdown => {
            let ddPopupSizeInit = this.plugin.settings.kvMapPopupSizeInit;
            for(const key in ddPopupSizeInit){
                dropdown.addOption(key, ddPopupSizeInit[key])
            }
            dropdown
                .setValue(this.plugin.settings.PopupSizeInitValue)
                .onChange(async (value) => {
                    this.plugin.settings.PopupSizeInitValue = value;
                    await this.plugin.saveSettings();
                }
            )
        });  

        let titleZoomRatio = containerEl.createEl('h2', { text: 'Zoom Ratio' });
        titleZoomRatio.classList.add('config-text');

        // 弹窗初始化
        new Setting(containerEl)
        .setName('Choose the ratio for zooming in or out')
        .addDropdown(dropdown => {
            let ddZoomRatio = this.plugin.settings.kvMapZoomRatio;
            for(const key in ddZoomRatio){
                dropdown.addOption(key, ddZoomRatio[key])
            }
            dropdown
                .setValue(this.plugin.settings.ZoomRatioValue)
                .onChange(async (value) => {
                    this.plugin.settings.ZoomRatioValue = value;
                    await this.plugin.saveSettings();
                }
            
            )
        });   

        let titleMoveStep = containerEl.createEl('h2', { text: 'Move Step' });
        titleMoveStep.classList.add('config-text');

       // 移动步长
       new Setting(containerEl)
        .setName('Choose the step for moving')
        .addDropdown(dropdown => {
            let ddZoomRatio = this.plugin.settings.kvMapMoveStep;
            for(const key in ddZoomRatio){
                dropdown.addOption(key, ddZoomRatio[key])
            }
            dropdown
                .setValue(this.plugin.settings.MoveStepValue)
                .onChange(async (value) => {
                    this.plugin.settings.MoveStepValue = value;
                    await this.plugin.saveSettings();
                }
            
            )
        });           

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
                if(this.plugin.settings.kvMapReserved[key] || this.plugin.settings.kvMap[key] || this.plugin.settings.kvMapDefault[key] )
                {
                    new Notice('Diagram Source exists');
                    return;
                }

                this.plugin.settings.kvMap[key] = value;
                await this.plugin.saveSettings();
                //this.displayKvMap(containerEl);
                this.display();
                new Notice(`Saved Diagram Source And Class Name: ${key} -> ${value}`);

                // 清空输入框
                keyInput.value = '';
                valueInput.value = '';
            } else {
                new Notice('Input Diagram Source and Class Name please');
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
                new Notice("reset success");

                //this.displayKvMap(containerEl);
                this.display();
            } else {
                // 用户取消，不执行任何操作
                new Notice("reset canceled");
            }
        };     

        // 显示保存后的键值对
        this.displayKvMap(containerEl);

        let titleConnect = containerEl.createEl('h2', { text: 'How to work in other plugins' });
        titleConnect.classList.add('config-text-connect');

        containerEl.createEl('p', { text: '\'.diagram-popup\' is a preserved class for other plugins to work with.' })
        containerEl.createEl('p', { text: 'if you add it to the class list of your target container, it will get the functionality.' });
    }

    // 在页面下方显示所有保存的键值对（以表格形式）
    displayKvMap(containerEl: HTMLElement) {
        // 清除旧的显示内容
        const existingDisplay = containerEl.querySelector('.kv-display');
        if (existingDisplay) existingDisplay.remove();

        // 创建新的显示容器
        const kvDisplay = containerEl.createDiv({ cls: 'kv-display' });

        // 获取所有键值对

        // 合并两个对象
        let mergedMap = { ...this.plugin.settings.kvMapReserved ,...this.plugin.settings.kvMapDefault, ...this.plugin.settings.kvMap };

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
        } else {
            kvDisplay.setText('No Diagram Setting Saved');
        }
    }
}

export default MermaidPopupSettingTab;
