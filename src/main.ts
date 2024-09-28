import { Plugin, MarkdownView, setIcon  } from 'obsidian';
import MermaidPopupSettingTab from './settings';

interface MermaidPopupSetting {
    kvMap: Record<string, string>;
    kvMapDefault: Record<string, string>;
    kvMapReserved: Record<string, string>;

    ZoomRatioValue:string;
    kvMapZoomRatio: Record<string, string>;
    MoveStepValue:string;
    kvMapMoveStep: Record<string, string>;
};

const DEFAULT_SETTINGS: MermaidPopupSetting = {
    kvMap: {},
    kvMapDefault: {
        'Mermaid':'.mermaid'
    },
    kvMapReserved:{
        'Reserved': '.diagram-popup'
    },
    ZoomRatioValue:'0.1',
    kvMapZoomRatio:{
        '0.1':'0.1',
        '0.2':'0.2',
        '0.3':'0.3'
    },
    MoveStepValue:'30',
    kvMapMoveStep:{
        '20':'20',
        '30':'30',
        '40':'40',
        '50':'60',
        '60':'60',
    },    
};

export default class MermaidPopupPlugin extends Plugin {
    settings!: MermaidPopupSetting;

    async onload() {
        console.log('Loading Mermaid Popup Plugin ' + this.manifest.version);

        // 加载设置
        await this.loadSettings();

        // 添加设置页面
        this.addSettingTab(new MermaidPopupSettingTab(this.app, this));

        this.registerMarkdownPostProcessor((element, context) => {
            this.registerMarkdownPostProcessor_MermaidPopup(element);
        });
      
        // 监听模式切换事件
        this.registerEvent(this.app.workspace.on('layout-change', () => {
            let view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view && view.getViewType() === 'markdown') {
                // 类型断言为 MarkdownView，以便访问 contentEl
                const mode = view.getMode();
                if (mode === 'preview') {
                    let container = view.containerEl.childNodes[1].childNodes[1] as HTMLElement; // 阅读容器
                    this.ObserveToAddPopupButton_in_Preview(container, true)
                }
                else{
                    let container = view.containerEl.childNodes[1].childNodes[0] as HTMLElement; // 编辑容器
                    this.ObserveToAddPopupButton(container)
                }
            }
        }));
    }

    onunload() {
        console.log('Unloading Mermaid Popup Plugin ' + this.manifest.version);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }  

    isPreviewMode(){
        let view = this.app.workspace.getActiveViewOfType(MarkdownView);
        let mode = view?.getViewType();
        return mode == "preview";
    }

    // 渲染直接生成，可直接判断添加按钮和弹窗事件
    registerMarkdownPostProcessor_MermaidPopup(ele: HTMLElement){
        let closestElement = this.GetSettingsClassElementClosest(ele);
        if (!closestElement)
            return;
        if (!closestElement.hasAttribute('data-mermaid-popup-bound')) {
            this.registerMermaidPopup(closestElement);
            closestElement.setAttribute('data-mermaid-popup-bound', 'true');
        }   
    }

    // 渲染后添加按钮和弹窗事件
    registerMermaidPopup(myView: HTMLElement) {
        // 移除之前可能绑定的事件，防止多次绑定
        myView.removeEventListener('click', this.handleMermaidClick);
        this.ObserveToAddPopupButton(myView);
        this.registerDomEvent(myView, 'click', this.handleMermaidClick);
    }

    ObserveToAddPopupButton(myView: HTMLElement){
        const observer = new MutationObserver((mutationsList, observer) => {
            console.log('mutationsList', mutationsList);
            for (let i=0;i<mutationsList.length;i++) {
                let mutation = mutationsList[i];
                if (mutation.type !== "childList") {
                    continue;
                }
                if (mutation.addedNodes.length < 1) {
                    continue;
                }
                mutation.addedNodes.forEach(
                    (node)=>{
                        this.doAddPopupButton(node as HTMLElement);
                    }
                );                
            }
        });

        observer.observe(myView, { childList: true, subtree: true });
    }

    ObserveToAddPopupButton_in_Preview(myView: HTMLElement, isPreviewMode:boolean){
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let i=0;i<mutationsList.length;i++) {
                let mutation = mutationsList[i];
                if (mutation.type !== "childList") {
                    continue;
                }
                if (mutation.addedNodes.length < 1) {
                    continue;
                }
                mutation.addedNodes.forEach(
                    (node)=>{
                        this.doAddPopupButton(node as HTMLElement, isPreviewMode);
                    }
                );                
            }
        });

        observer.observe(myView, { childList: true, subtree: true });
    }
    
    GetSettingsClassElementAll(contentEl:HTMLElement){
        let mapDiagramClassAll = this.GetSettingsDiagramClassAll();
        let selector = Object.values(mapDiagramClassAll).join(', ');
        return contentEl.querySelectorAll(selector);
    }

    GetSettingsDiagramClassAll(){
        return { ...this.settings.kvMapReserved, ...this.settings.kvMapDefault, ...this.settings.kvMap };
    }

    doAddPopupButton(node: HTMLElement, isPreviewMode:boolean = false){
        // Find target diagrams and append a button to each
        let closestElement = this.GetSettingsClassElementClosest(node);
        if (closestElement)
            this.addPopupButton(closestElement, node, isPreviewMode);
    }

    // Add a button to each Mermaid diagram for triggering the popup
    addPopupButton(target: HTMLElement, start:HTMLElement, isPreviewMode:boolean = false) {

        let popupButtonClass = 'mermaid-popup-button';
        let popupButtonClass_Reading = 'mermaid-popup-button-reading';
        let popupButtonClass_Reading_container = 'mermaid-popup-button-reading-container';
        // Ensure the button is only added once
        if (!isPreviewMode && target.querySelector('.' + popupButtonClass)) 
            return;

        if (isPreviewMode && target.querySelector('.' + popupButtonClass_Reading))
            return;

        // Create the popup button
        const popupButton = target.doc.createElement('button');
        
        if (isPreviewMode && !target.classList.contains(popupButtonClass_Reading_container))
            target.classList.add(popupButtonClass_Reading_container);

        popupButton.classList.add(isPreviewMode?popupButtonClass_Reading:popupButtonClass);
        popupButton.textContent = 'Open Popup';
        setIcon(popupButton, 'maximize');
        popupButton.title = 'Open Popup';

        target.appendChild(popupButton);

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

    makeButtonDraggable(button: HTMLElement, mermaidDiv: HTMLElement, onDragStart: () => void) {
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

            let hasMoved = false; // 标记是否发生了移动

            // Call function when mouse is moved
            button.doc.onmousemove = (e) => {
                e.preventDefault();
    
                // Calculate the new cursor position
                posX = mouseX - e.clientX;
                posY = mouseY - e.clientY;
                mouseX = e.clientX;
                mouseY = e.clientY;

                hasMoved = true;
                onDragStart(); // 标记为拖动

                let btn_posX = button.offsetLeft - posX;
                let btn_posY = button.offsetTop - posY;
                btn_posX = btn_posX < 0 ? 0 : btn_posX;
                btn_posX = button.parentElement ?
                    ((btn_posX + button.offsetWidth) > button.parentElement?.offsetWidth ? button.offsetLeft : btn_posX)
                    :btn_posX;
                btn_posY = btn_posY < 0 ? 0 : btn_posY;
                btn_posY = button.parentElement ?
                    ((btn_posY + button.offsetHeight) > button.parentElement?.offsetHeight ? button.offsetTop : btn_posY)
                    :btn_posY;                
                // Set the element's new position
                button.setCssStyles({
                    bottom: 'auto',
                    right: 'auto',
                    left: btn_posX  + "px",
                    top: btn_posY+ "px"
                });                
            };
    
            // Stop moving when mouse is released
            button.doc.onmouseup = () => {
                button.doc.onmousemove = null;
                button.doc.onmouseup = null;
            };
        };
    }   
    
    GetPosButtonToMermaid(eleBtn: HTMLElement, eleDiv: HTMLElement){
        // 获取按钮和 div 的位置信息
        const divRect = eleDiv.getBoundingClientRect();
        const buttonRect = eleBtn.getBoundingClientRect();

        // 计算按钮相对于 div 的位置
        const buttonRelativeTop = buttonRect.top - divRect.top;
        const buttonRelativeLeft = buttonRect.left - divRect.left;
        return { top: buttonRelativeTop, left:buttonRelativeLeft};
    }

    IsClassListContains_SettingsDiagramClass(ele:HTMLElement){
        if (ele.classList == null || ele.classList.length == 0)
            return false;
        let mergedMap = this.GetSettingsDiagramClassAll();
        for(var i=0;i<ele.classList.length;i++)
        {
            if (Object.values(mergedMap).includes('.' + ele.classList[i]))
                return true;
        }
        return false;
    }

    GetSettingsClassElementClosest(startElement:HTMLElement){
        
        let _parent = startElement;

        while(_parent){
            if(this.IsClassListContains_SettingsDiagramClass(_parent)){
                return _parent;
            }

            if (_parent.parentElement)
                _parent = _parent.parentElement;
            else 
                break;
        }
        return null
    }

    // 绑定新的事件处理
    handleMermaidClick = (evt: MouseEvent) => {
        if (!evt.ctrlKey) return;
        evt.stopPropagation();

        let targetElement = evt.target as HTMLElement;
        let closestElement = this.GetSettingsClassElementClosest(targetElement);
        if(closestElement)
            this.openPopup(closestElement);
    };

    openPopup(targetElement: HTMLElement) {
        // targetElement.requestFullscreen();
        // return;

        // popup-overlay
        const overlay = targetElement.doc.createElement('div');
        overlay.classList.add('popup-overlay');

        // copy target
        let targetElementClone = targetElement.cloneNode(true);
        let targetElementInPopup = targetElementClone as HTMLElement;
        const childElement = targetElementInPopup.querySelector('.mermaid-popup-button'); // 获取需要删除的子元素
        if (childElement) {
            targetElementInPopup.removeChild(childElement); // 从父元素中删除子元素
        }        
        targetElementInPopup.classList.add('popup-content', 'draggable', 'resizable');

        let _doc = targetElementInPopup.doc;
        // Create a container for the control buttons
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

        // Append popup and button container to the overlay
        overlay.appendChild(targetElementInPopup);
        overlay.appendChild(buttonContainer);
        _doc.body.appendChild(overlay);

        // Close popup on overlay click
        overlay.addEventListener('click', (evt) => {
            evt.doc.body.removeChild(overlay);
        });

        // Stop propagation to prevent closing when clicking on popup content
        targetElementInPopup.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        // Stop propagation to prevent closing when clicking on control buttons and container
        buttonContainer.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        zoomInButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(targetElementInPopup, true);
        });

        zoomOutButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(targetElementInPopup, false);
        });

        upButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(targetElementInPopup, 0, -1);
        });

        downButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(targetElementInPopup, 0, 1);
        });

        leftButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(targetElementInPopup, -1, 0);
        });

        rightButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(targetElementInPopup, 1, 0);
        });

        closeButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.doc.body.removeChild(overlay);
        });

        // Listen for the Escape key to close the popup
        targetElementInPopup.doc.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                targetElementInPopup.doc.body.removeChild(overlay);
            }
        });        

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

    // Helper method to move the popup
    movePopup(popup: HTMLElement, dx: number, dy: number) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);

        // Calculate new position
        const newX = matrix.m41 + (dx==0 ? dx : dx * parseInt(this.settings.MoveStepValue));
        const newY = matrix.m42 + (dy==0 ? dy : dy * parseInt(this.settings.MoveStepValue));

        popup.setCssStyles({transform : `translate(${newX}px, ${newY}px) scale(${matrix.a})`});
    }

    // Helper method to zoom the popup and SVG
    zoomPopup(popup: HTMLElement, isOut:boolean) {
        this.zoomPopupCore(popup, isOut, 1, 1);
    }

    // Helper method to zoom the popup at the cursor position
    zoomPopupAtCursor(popup: HTMLElement, isOut:boolean, evt: WheelEvent) {

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
    zoomPopupCore(popup: HTMLElement, isOut:boolean, offsetX: number, offsetY: number) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;

        // isOut, 1.1
        let symbol:number = isOut ? 1:-1;
        const newScale = currentScale * (1+ symbol * parseFloat(this.settings.ZoomRatioValue));

        // Adjust the translation to keep the popup centered relative to the overlay
        const newX = matrix.m41 - offsetX * symbol * parseFloat(this.settings.ZoomRatioValue);
        const newY = matrix.m42 - offsetY * symbol * parseFloat(this.settings.ZoomRatioValue);

        popup.setCssStyles({
            transformOrigin : 'center center', // Ensure scaling is centered
            transform : `translate(${newX}px, ${newY}px) scale(${newScale})`
        });
    }    

    // Helper method to make the popup draggable
    makeDraggable(element: HTMLElement) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        const mouseDownHandler = (e: MouseEvent) => {
            isDragging = true;
            if (!e.target)
                return;
            const ele_target = e.target as HTMLElement;
            const style = ele_target.win.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
            startX = e.clientX - matrix.m41;
            startY = e.clientY - matrix.m42;
            e.doc.addEventListener('mousemove', mouseMoveHandler);
            e.doc.addEventListener('mouseup', mouseUpHandler);
            ele_target.closest('.popup-content')?.classList.add('dragging');
        };

        const mouseMoveHandler = (e: MouseEvent) => {
            if (!isDragging) return;
            if (!e.target)
                return;
            const ele_target = e.target as HTMLElement;
            const style = ele_target.win.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);

            // 直接计算当前鼠标位置与起始位置的差值
            initialX = e.clientX - startX;
            initialY = e.clientY - startY;

            element.setCssStyles({transform : `translate(${initialX}px, ${initialY}px) scale(${matrix.a})`});
        };

        const mouseUpHandler = (e: MouseEvent) => {
            isDragging = false;
            e.doc.removeEventListener('mousemove', mouseMoveHandler);
            e.doc.removeEventListener('mouseup', mouseUpHandler);

            const ele_target = e.target as HTMLElement;
            ele_target.closest('.popup-content')?.classList.remove('dragging');
        };

        element.addEventListener('mousedown', mouseDownHandler);
    }    
}
