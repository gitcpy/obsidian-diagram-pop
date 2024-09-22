import { Plugin, MarkdownView, setIcon  } from 'obsidian';

export default class MermaidPopupPlugin extends Plugin {
    async onload() {
        console.log('Loading Mermaid Popup Plugin');

        this.registerMarkdownPostProcessor((element, context) => {
            this.doRegisterMermaidPopup(element);
        });
      
        // 监听模式切换事件
        this.registerEvent(this.app.workspace.on('layout-change', () => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view && view.getViewType() === 'markdown') {
                // 类型断言为 MarkdownView，以便访问 contentEl
                const markdownView = view as MarkdownView;
                this.doRegisterMermaidPopup(markdownView.contentEl);
            }
        }));
    }

    onunload() {
        console.log('Unloading Mermaid Popup Plugin');
    }

    // 确保每次只绑定一次事件
    doRegisterMermaidPopup(myView: HTMLElement){
        if (!myView.hasAttribute('data-mermaid-popup-bound')) {
            this.registerMermaidPopup(myView);
            myView.setAttribute('data-mermaid-popup-bound', 'true');
        }       
    }

    registerMermaidPopup(myView: HTMLElement) {
        // 移除之前可能绑定的事件，防止多次绑定
        myView.removeEventListener('click', this.handleMermaidClick);

        this.ObserveToAddPopupButton(myView);

        this.registerDomEvent(myView, 'click', this.handleMermaidClick);
    }

    ObserveToAddPopupButton(myView: HTMLElement){
        const observer = new MutationObserver((mutationsList, observer) => {
            this.doAddPopupButton(myView);
        });

        observer.observe(myView, { childList: true, subtree: true });
        this.doAddPopupButton(myView);
    }

    doAddPopupButton(myView: HTMLElement){
        // Find Mermaid diagrams and append a button to each
        const mermaidDivs = myView.querySelectorAll('.mermaid');
        mermaidDivs.forEach((mermaidDiv) => {
            this.addPopupButton(mermaidDiv as HTMLElement, myView);
        });
    }

    // Add a button to each Mermaid diagram for triggering the popup
    addPopupButton(mermaidDiv: HTMLElement, myView: HTMLElement) {
        // Ensure the button is only added once
        if (mermaidDiv.querySelector('.mermaid-popup-button')) return;
    
        // Create the popup button
        const popupButton = mermaidDiv.doc.createElement('button');
        popupButton.classList.add('mermaid-popup-button');
        popupButton.textContent = 'Open Popup';
        setIcon(popupButton, 'maximize');
        popupButton.title = 'Open Popup';

        // Append the button to the Mermaid diagram container
        mermaidDiv.style.position = 'relative'; // Ensure the diagram has relative positioning for the button
        mermaidDiv.appendChild(popupButton);

        let isDragging = false;

        // Add click event listener for the button to open the popup
        popupButton.addEventListener('click', (evt) => {
            // Only trigger popup if no dragging occurred
            if (!isDragging) {
                evt.stopPropagation(); // Prevent triggering any other click events
                const svg = mermaidDiv.querySelector('svg');
                if (svg) {
                    this.openPopup(svg as SVGSVGElement);
                }
            }
            // Reset the dragging flag after click
            isDragging = false;
        });
    
        // Make the button draggable
        this.makeButtonDraggable(popupButton, mermaidDiv, myView, () => {
            isDragging = true; // Set dragging to true during the drag
        });
    }

    makeButtonDraggable(button: HTMLElement, mermaidDiv: HTMLElement, myView: HTMLElement, onDragStart: () => void) {
        // posX, posY, 移动步长
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
    
        button.onmousedown = (e) => {
            e.preventDefault();
    
            // Get the mouse cursor position at startup
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            //button = 0;

            // 初始化按钮样式位置偏移量
            button.style.left = button.offsetLeft + "px";
            button.style.top = button.offsetTop + "px";

            let hasMoved = false; // 标记是否发生了移动

            // Call function when mouse is moved
            button.doc.onmousemove = (e) => {
                e.preventDefault();
    
                // Calculate the new cursor position
                posX = mouseX - e.clientX;
                posY = mouseY - e.clientY;
                mouseX = e.clientX;
                mouseY = e.clientY;

                // console.log("mX,mY,bL,bT, bcL, bcT, sL, sT\n", 
                //     mouseX,mouseY, 
                //     button.offsetLeft,button.offsetTop, 
                //     button.getBoundingClientRect().left, button.getBoundingClientRect().top,
                // button.style.left, button.style.top);

                // Set the element's new position
                //if (Math.abs(posX) > 3 || Math.abs(posY) > 3) {
                    hasMoved = true;
                    onDragStart(); // 标记为拖动
                //}

                // Set the element's new position
                button.style.bottom = 'auto';
                button.style.right = 'auto';
                button.style.top = (button.offsetTop - posY) + 'px';
                button.style.left = (button.offsetLeft - posX) + 'px';
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

    // 绑定新的事件处理
    handleMermaidClick = (evt: MouseEvent) => {
        if (!evt.ctrlKey) return;

        const target = evt.target as HTMLElement;
        const mermaidDiv = target.closest('.mermaid') as HTMLElement;
        if (mermaidDiv) {
            const svg = mermaidDiv.querySelector('svg');
            if (svg) {
                this.openPopup(svg as SVGSVGElement);
            }
        }
    };

    openPopup(svgElement: SVGSVGElement) {
        const overlay = svgElement.doc.createElement('div');
        overlay.classList.add('popup-overlay');

        const popup = svgElement.doc.createElement('div');
        popup.classList.add('popup-content', 'draggable', 'resizable');
        popup.appendChild(svgElement.cloneNode(true));

        // Create a container for the control buttons
        const buttonContainer = svgElement.doc.createElement('div');
        buttonContainer.classList.add('button-container');

        // Create zoom in and zoom out buttons
        const zoomInButton = svgElement.doc.createElement('button');
        zoomInButton.classList.add('control-button', 'zoom-in');
        zoomInButton.textContent = '+';

        const zoomOutButton = svgElement.doc.createElement('button');
        zoomOutButton.classList.add('control-button', 'zoom-out');
        zoomOutButton.textContent = '-';

        // Create arrow buttons
        const upButton = svgElement.doc.createElement('button');
        upButton.classList.add('control-button', 'arrow-up');
        upButton.textContent = '↑';

        const downButton = svgElement.doc.createElement('button');
        downButton.classList.add('control-button', 'arrow-down');
        downButton.textContent = '↓';

        const leftButton = svgElement.doc.createElement('button');
        leftButton.classList.add('control-button', 'arrow-left');
        leftButton.textContent = '←';

        const rightButton = svgElement.doc.createElement('button');
        rightButton.classList.add('control-button', 'arrow-right');
        rightButton.textContent = '→';

        // Create a close button
        const closeButton = svgElement.doc.createElement('button');
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
        overlay.appendChild(popup);
        overlay.appendChild(buttonContainer);
        svgElement.doc.body.appendChild(overlay);

        // Adjust SVG size to fit the popup-content
        this.adjustSvgSize(popup.querySelector('svg') as SVGSVGElement, popup);

        // Close popup on overlay click
        overlay.addEventListener('click', (evt) => {
            evt.doc.body.removeChild(overlay);
        });

        // Stop propagation to prevent closing when clicking on popup content
        popup.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        // Stop propagation to prevent closing when clicking on control buttons and container
        buttonContainer.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        zoomInButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(popup, 1.1, overlay);
        });

        zoomOutButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.zoomPopup(popup, 0.9, overlay);
        });

        upButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(popup, 0, -20);
        });

        downButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(popup, 0, 20);
        });

        leftButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(popup, -20, 0);
        });

        rightButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.movePopup(popup, 20, 0);
        });

        closeButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.doc.body.removeChild(overlay);
        });

        // Listen for the Escape key to close the popup
        popup.doc.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                svgElement.doc.body.removeChild(overlay);
            }
        });        

        // Make the popup draggable
        this.makeDraggable(popup);

        // Make the popup resizable
        popup.classList.add('resizable');

        const popup_style = popup.win.getComputedStyle(popup);
        //console.log('Popup position before:', popup_style.transform, popup.getBoundingClientRect());
        // Initialize popup position if not already set
        if (!popup_style.transform) {
            popup_style.transform = 'translate(0px, 0px)';
            //console.log('Popup position:', popup_style.transform, popup.getBoundingClientRect());
        }

        // Add mouse wheel event for zooming
        popup.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            const scale = evt.deltaY < 0 ? 1.1 : 0.9;
            this.zoomPopupAtCursor(popup, scale, overlay, evt);
        });
    }

    // Helper method to move the popup
    movePopup(popup: HTMLElement, dx: number, dy: number) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);

        // Calculate new position
        const newX = matrix.m41 + dx;
        const newY = matrix.m42 + dy;

        popup.setCssStyles({transform : `translate(${newX}px, ${newY}px) scale(${matrix.a})`});
    }

    // Helper method to zoom the popup and SVG
    zoomPopup(popup: HTMLElement, scale: number, overlay: HTMLElement) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;
        const newScale = currentScale * scale;

        // Get the center point of the overlay
        const overlayRect = overlay.getBoundingClientRect();
        const overlayCenterX = overlayRect.left + overlayRect.width / 2;
        const overlayCenterY = overlayRect.top + overlayRect.height / 2;

        // Get the current position of the popup
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;

        // Calculate the distance from the popup center to the overlay center
        const offsetX = overlayCenterX - popupCenterX;
        const offsetY = overlayCenterY - popupCenterY;

        // Adjust the translation to keep the popup centered relative to the overlay
        const newX = matrix.m41 + offsetX * (1 - scale);
        const newY = matrix.m42 + offsetY * (1 - scale);

        popup.setCssStyles({
            transformOrigin : 'center center', // Ensure scaling is centered
            transform : `translate(${newX}px, ${newY}px) scale(${newScale})`
        });
    }

    // Helper method to zoom the popup at the cursor position
    zoomPopupAtCursor(popup: HTMLElement, scale: number, overlay: HTMLElement, evt: WheelEvent) {
        const style = popup.win.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;
        const newScale = currentScale * scale;

        // Get the mouse position relative to the overlay
        const overlayRect = overlay.getBoundingClientRect();
        const mouseX = evt.clientX - overlayRect.left;
        const mouseY = evt.clientY - overlayRect.top;

        // Get the current position of the popup
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;

        // Calculate the distance from the popup center to the mouse position
        const offsetX = mouseX - popupCenterX;
        const offsetY = mouseY - popupCenterY;

        // Adjust the translation to zoom at the mouse position
        const newX = matrix.m41 - offsetX * (scale - 1);
        const newY = matrix.m42 - offsetY * (scale - 1);

        popup.setCssStyles({
            transformOrigin : 'center center', // Ensure scaling is centered
            transform : `translate(${newX}px, ${newY}px) scale(${newScale})`
        });
    }

    // Helper method to adjust SVG size to fit the popup
    adjustSvgSize(svgElement: SVGSVGElement, popup: HTMLElement) {
        const svgRect = svgElement.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        const popupWidth = popupRect.width;
        const popupHeight = popupRect.height;

        let scaleX = popupWidth / svgWidth;
        let scaleY = popupHeight / svgHeight;
        let scale = Math.min(scaleX, scaleY);

        if (scale < 1) {
            svgElement.setCssStyles({width : `${svgWidth * scale}px`, height : `${svgHeight * scale}px`});
        } else {
            svgElement.setCssStyles({width : '100%', height : '100%'});
        }

        svgElement.setCssStyles({
            transformOrigin : 'center center', // Center transform origin
            position : 'absolute',
            top : '50%',
            left : '50%',
            transform : 'translate(-50%, -50%)'
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
