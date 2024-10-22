import { Plugin, MarkdownView, setIcon  } from 'obsidian';
import MermaidPopupSettingTab from './settings';

interface MermaidPopupSetting {
    kvMap: Record<string, string>;
    kvMapDefault: Record<string, string>;
    kvMapReserved: Record<string, string>;

    PopupSizeInitValue:string;
    kvMapPopupSizeInit: Record<string, string>;

    DiagramHeightVal:string;
    DiagramHeightMin:string;
    DiagramHeightMax:string;
    DiagramHeightStep:string;

    ZoomRatioValue:string;
    kvMapZoomRatio: Record<string, string>;
    MoveStepValue:string;
    kvMapMoveStep: Record<string, string>;

    open_btn_pos_x:string;
    open_btn_pos_y:string;
};

const DEFAULT_SETTINGS: MermaidPopupSetting = {
    kvMap: {},
    kvMapDefault: {
        'Mermaid':'.mermaid'
    },
    kvMapReserved:{
        'Reserved': '.diagram-popup'
    },
    PopupSizeInitValue:'1.50',
    kvMapPopupSizeInit:{
        '1.00':'1.00',
        '1.25':'1.25',        
        '1.50':'1.50',
        '1.75':'1.75',
        '2.00':'2.00',
        '2.25':'2.25',        
        '2.50':'2.50',
        '2.75':'2.75',
        '3.00':'3.00'        
    },

    DiagramHeightVal:'600',
    DiagramHeightMin:'50',
    DiagramHeightMax:'1500',
    DiagramHeightStep:'50',

    ZoomRatioValue:'0.2',
    kvMapZoomRatio:{
        '0.1':'0.1',
        '0.2':'0.2',
        '0.3':'0.3',
        '0.4':'0.4'
    },
    MoveStepValue:'30',
    kvMapMoveStep:{
        '20':'20',
        '30':'30',
        '40':'40',
        '50':'60',
        '60':'60',
    },
    open_btn_pos_x:'90',
    open_btn_pos_y:'90',
};

export default class MermaidPopupPlugin extends Plugin {
    settings!: MermaidPopupSetting;
    observer_editting!:MutationObserver | null;
    observer_reading!:MutationObserver | null; 
    openPopupBtn='mermaid-popup-button';
    openPopupBtnReading='mermaid-popup-button-reading';

    async onload() {
        console.log(`Loading ${this.manifest.name} ${this.manifest.version}`);

        // 加载设置
        await this.loadSettings();

        // 添加设置页面
        this.addSettingTab(new MermaidPopupSettingTab(this.app, this));

        // this.registerMarkdownPostProcessor((element, context) => {
        //     //this.registerMarkdownPostProcessor_MermaidPopup(element);
        //     //console.log('registerMarkdownPostProcessor');
        // });
      
        // 监听模式切换事件
        this.registerEvent(this.app.workspace.on('layout-change', () => {
            let view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view){ // 编辑器关闭
                this.RelaseWhenfileClose();
            }
            if (view && view.getViewType() === 'markdown') {
                // 类型断言为 MarkdownView，以便访问 contentEl
                const mode = view.getMode();
                const isPreview = mode === 'preview';

                let containerClass = '.markdown-source-view';// 编辑容器
                if (isPreview) {
                    containerClass = '.markdown-preview-view'; // 阅读容器
                }
                let container = view.containerEl.querySelector(containerClass) as HTMLElement;
                let targetArr = this.GetSettingsClassElementAll(container)
                for(var i=0;i<targetArr.length;i++)
                {
                    this.addPopupButton(targetArr[i] as HTMLElement, isPreview);
                    this.ObserveIsChnanged(targetArr[i] as HTMLElement, isPreview);
                }

                if (isPreview) {
                    this.ObserveToAddPopupButton_Reading(container, isPreview);
                }
                else{
                    this.ObserveToAddPopupButton(container, isPreview);
                }
            }
        }));
    }

    RelaseWhenfileClose()
    {
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

    isPreviewMode(){
        let view = this.app.workspace.getActiveViewOfType(MarkdownView);
        return view && view.getViewType() === 'markdown' && view.getMode() == "preview";
    }

    // 渲染直接生成，可直接判断添加按钮和弹窗事件
    registerMarkdownPostProcessor_MermaidPopup(ele: HTMLElement){
        let parentElement = ele.parentElement;
        if (parentElement) {
            this.addPopupButton(parentElement, false);
        }   
    }

    // targetNode ：target diagram
    ObserveIsChnanged(targetNode:HTMLElement, isPreviewMode:boolean = false){
        const config = { childList: true, subtree: true };
        const callback = (mutationsList:MutationRecord[], observer:MutationObserver) => {
            // if (!targetNode.classList.contains('open_btn_pos'))
            // {
            //     targetNode.classList.add('open_btn_pos')
            //     this.removeOpenBtn(targetNode);
            //     this.addPopupButton(targetNode, isPreviewMode);
            // }

            // let {popupButtonClass, popupButtonClass_container} = this.getOpenBtnInMd_Mark();
            // let btn = targetNode.getElementsByClassName(popupButtonClass);
            // if(btn && btn.length >0){
            //     targetNode.classList.add('open_btn_pos')
            //     this.removeOpenBtn(targetNode);
            // }
            // this.addPopupButton(targetNode, isPreviewMode);
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    removeOpenBtn(targetNode:HTMLElement){
        let {popupButtonClass, popupButtonClass_container} = this.getOpenBtnInMd_Mark();
        targetNode.classList.remove(popupButtonClass_container);
        let btn = targetNode.getElementsByClassName(popupButtonClass);
        if(!btn || btn.length < 1)
            return;
        targetNode.removeChild(btn[0] as Node);
    }

    // 获取 
    getOpenBtnInMd_Mark(){
        let popupButtonClass = 'mermaid-popup-button';
        let popupButtonClass_container = 'mermaid-popup-button-container';
        if (this.isPreviewMode()){
            popupButtonClass_container = 'mermaid-popup-button-container-reading';
            popupButtonClass = 'mermaid-popup-button-reading'
        }
        return {popupButtonClass, popupButtonClass_container}
    }

    ObserveToAddPopupButton(myView: HTMLElement, isPreviewMode:boolean = false){
        if (this.observer_editting)
            return;
        this.observer_editting = new MutationObserver((mutationsList, observer) => {
            for (let i=0;i<mutationsList.length;i++) {
                let mutation = mutationsList[i];
                if (mutation.type !== "childList") {
                    continue;
                }

                let target = mutation.target as HTMLElement;
                if(this.IsClassListContains_SettingsDiagramClass(target))
                    this.addPopupButton(target, isPreviewMode);   

                for(let i=0;i<mutation.addedNodes.length;i++){
                    let nodeEle = mutation.addedNodes[i] as HTMLElement;
                    if(this.IsClassListContains_SettingsDiagramClass(nodeEle))
                        this.addPopupButton(nodeEle, isPreviewMode);                   
                }

            
            }
        });

        this.observer_editting.observe(myView, { childList: true, subtree: true});
    }

    ObserveToAddPopupButton_Reading(myView: HTMLElement, isPreviewMode:boolean){
        if (this.observer_reading)
            return;
        this.observer_reading = new MutationObserver((mutationsList, observer) => {
            let containerArr = this.GetSettingsClassElementAll(myView);
            for(var i=0;i<containerArr.length;i++){
                let container = containerArr[i] as HTMLElement;
                if(this.IsClassListContains_SettingsDiagramClass(container))
                    this.addPopupButton(container, isPreviewMode); 
            }
        });

        this.observer_reading.observe(myView, { childList: true, subtree: true});
    }  

    GetSettingsClassElement(contentEl:HTMLElement){
        let selector = this.GetSettingsDiagramClassNameAll().join(', ');
        return contentEl.querySelector(selector);
    }
    
    GetSettingsClassElementAll(contentEl:HTMLElement){
        let selector = this.GetSettingsDiagramClassNameAll().join(', ');
        return contentEl.querySelectorAll(selector);
    }

    GetSettingsDiagramClassNameAll(){
        let mapDiagramClassAll =  { ...this.settings.kvMapReserved, ...this.settings.kvMapDefault, ...this.settings.kvMap };
        return Object.values(mapDiagramClassAll);
    }

    // Add a button to each Mermaid diagram for triggering the popup
    addPopupButton(target: HTMLElement, isPreviewMode:boolean = false) {
        let popupButtonClass = 'mermaid-popup-button';
        let popupButtonClass_container = 'mermaid-popup-button-container';
        if (isPreviewMode){
            popupButtonClass_container = 'mermaid-popup-button-container-reading';
            popupButtonClass = 'mermaid-popup-button-reading'
        }

        if (target.querySelector('.' + popupButtonClass)) 
            return;

        // Create the popup button
        const popupButton = target.doc.createElement('button');
        
        if (!target.classList.contains(popupButtonClass_container))
            target.classList.add(popupButtonClass_container);

        popupButton.classList.add(popupButtonClass);
        popupButton.textContent = 'Open Popup';
        setIcon(popupButton, 'maximize');
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

    setPopupBtnPos(btn: HTMLElement, target: HTMLElement){
        let w_b = btn.offsetWidth;
        let h_b = btn.offsetHeight;
        //console.log('w_b', w_b, 'h_b', h_b);
  
        let w = target.offsetWidth;
        let h = target.offsetHeight;

        let x_setting = this.settings.open_btn_pos_x;
        let y_setting = this.settings.open_btn_pos_y;

        let left = this.getWidth(target) * parseFloat(x_setting) / 100;
        let top = this.getHeight(target) * parseFloat(y_setting) / 100

        left = (left+w_b) > w ? (left-w_b) : left;
        top = (top+h_b) > h ? (top-h_b) : top;

        left = left < 0 ? 0 : left;
        top = top < 0 ? 0 : top;

        btn.setCssStyles({
            left: left + 'px',
            top: top + 'px'
        });
    }

    adjustDiagramWidthAndHeight_ToContainer(container: HTMLElement){
        let desEle = this.getDiagramElement(container) as HTMLElement;
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
            height: des_h*rate + 'px',
            width: des_w*rate + 'px'
        });
    }

    getWidth(ele:HTMLElement){
        return parseFloat(ele.getCssPropertyValue('width'));
    }

    getHeight(ele:HTMLElement){
        return parseFloat(ele.getCssPropertyValue('height'));
    }

    getDiagramElement(container: HTMLElement){
        let diagramSvg = Array.from(container.children).find(child => child.tagName.toLowerCase() === 'svg');
        if (diagramSvg){
            return diagramSvg;
        }

        let diagramImg = Array.from(container.children).find(child => child.tagName.toLowerCase() === 'img');
        if (diagramImg)
            return diagramImg;

        return null;
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
        let classnameArr = this.GetSettingsDiagramClassNameAll();
        for(var i=0;i<classnameArr.length;i++){
            let name = classnameArr[i];
            name = name.substring(1);
            if (ele.classList.contains(name))
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
        let childElement = targetElementInPopup.querySelector('.' + this.openPopupBtn); // 获取需要删除的子元素
        if (childElement) {
            targetElementInPopup.removeChild(childElement); // 从父元素中删除子元素
        }
        else{
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
        
        this.setPopupSize(targetElementInPopup, targetElement);

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
    setPopupSize(_targetElementInPopup:HTMLElement, _targetElement:HTMLElement){
        let multiVal = parseFloat(this.settings.PopupSizeInitValue);
        if (typeof multiVal != "number"){
            return;
        }

        let width_tar_md = this.getWidth(_targetElement);
        let height_tar_md = this.getHeight(_targetElement);   
        let _diag_md = this.getDiagramElement(_targetElement) as HTMLElement;
        let width_diag_md = this.getWidth(_diag_md);
        let height_diag_md = this.getHeight(_diag_md);

        let width_tar_inpopup = this.getWidth(_targetElementInPopup);
        let height_tar_inpopup = this.getHeight(_targetElementInPopup);   
        let _diag_inpopup = this.getDiagramElement(_targetElementInPopup) as HTMLElement;
        let width_diag_inpopup = this.getWidth(_diag_inpopup);
        let height_diag_inpopup = this.getHeight(_diag_inpopup);

        _targetElementInPopup.setCssStyles({
            width: width_tar_md + 'px',
            height: height_tar_md + 'px'
        });

        _diag_inpopup.setCssStyles({
            width: width_diag_md + 'px',
            height: height_diag_md + 'px'
        });

        _targetElementInPopup.setCssStyles({
            transform: `scale(${multiVal})`
        });
    }

    createButtonContainer(_doc:Document, _targetElementInPopup:HTMLElement, _overlay:HTMLElement){
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
        let symbol:number = isOut ? -1:1;
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
