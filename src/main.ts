import { Plugin, MarkdownView  } from 'obsidian';

export default class MermaidPopupPlugin extends Plugin {
    async onload() {
        console.log('Loading Mermaid Popup Plugin');

        this.registerMarkdownPostProcessor((element, context) => {
            this.registerMermaidPopup(element);
          });
      
        // 监听模式切换事件
        this.registerEvent(this.app.workspace.on('layout-change', () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.getViewType() === 'markdown') {
            // 类型断言为 MarkdownView，以便访问 contentEl
            const markdownView = view as MarkdownView;
            this.registerMermaidPopup(markdownView.contentEl);                
        }}));
    }

    onunload() {
        console.log('Unloading Mermaid Popup Plugin');
    }

    registerMermaidPopup(ele: HTMLElement) {
        this.registerDomEvent(ele, 'click', (evt: MouseEvent) => {
            const target = evt.target as HTMLElement;
            const mermaidDiv = target.closest('.mermaid') as HTMLElement;
            if (mermaidDiv) {
                const svg = mermaidDiv.querySelector('svg');
                if (svg) {
                    this.openPopup(svg as SVGSVGElement);
                }
            }
        });
    }

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
        };

        element.addEventListener('mousedown', mouseDownHandler);
    }
}
