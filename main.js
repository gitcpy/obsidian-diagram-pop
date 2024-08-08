"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class MermaidPopupPlugin extends obsidian_1.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Loading Mermaid Popup Plugin');
            this.registerMermaidPopup();
            this.registerMermaidHeightAdjustment();
        });
    }
    onunload() {
        console.log('Unloading Mermaid Popup Plugin');
    }
    registerMermaidPopup() {
        this.registerDomEvent(document, 'click', (evt) => {
            const target = evt.target;
            const mermaidDiv = target.closest('.mermaid');
            if (mermaidDiv) {
                const svg = mermaidDiv.querySelector('svg');
                if (svg) {
                    this.openPopup(svg);
                }
            }
        });
    }
    openPopup(svgElement) {
        const svgContent = svgElement.outerHTML;
        const svgWidth = svgElement.viewBox.baseVal.width;
        const svgHeight = svgElement.viewBox.baseVal.height;
        const overlay = document.createElement('div');
        overlay.classList.add('popup-overlay');
        const popup = document.createElement('div');
        popup.classList.add('popup-content', 'draggable', 'resizable');
        popup.innerHTML = svgContent;
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        const zoomInButton = document.createElement('button');
        zoomInButton.classList.add('control-button', 'zoom-in');
        zoomInButton.textContent = '+';
        const zoomOutButton = document.createElement('button');
        zoomOutButton.classList.add('control-button', 'zoom-out');
        zoomOutButton.textContent = '-';
        const upButton = document.createElement('button');
        upButton.classList.add('control-button', 'arrow-up');
        upButton.textContent = '↑';
        const downButton = document.createElement('button');
        downButton.classList.add('control-button', 'arrow-down');
        downButton.textContent = '↓';
        const leftButton = document.createElement('button');
        leftButton.classList.add('control-button', 'arrow-left');
        leftButton.textContent = '←';
        const rightButton = document.createElement('button');
        rightButton.classList.add('control-button', 'arrow-right');
        rightButton.textContent = '→';
        const closeButton = document.createElement('button');
        closeButton.classList.add('control-button', 'close-popup');
        closeButton.textContent = 'X';
        buttonContainer.appendChild(zoomInButton);
        buttonContainer.appendChild(zoomOutButton);
        buttonContainer.appendChild(upButton);
        buttonContainer.appendChild(downButton);
        buttonContainer.appendChild(leftButton);
        buttonContainer.appendChild(rightButton);
        buttonContainer.appendChild(closeButton);
        overlay.appendChild(popup);
        overlay.appendChild(buttonContainer);
        document.body.appendChild(overlay);
        this.adjustSvgSize(popup.querySelector('svg'), popup);
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        popup.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });
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
            document.body.removeChild(overlay);
        });
        this.makeDraggable(popup);
        popup.classList.add('resizable');
        if (!popup.style.transform) {
            popup.style.transform = 'translate(0px, 0px)';
        }
        popup.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            const scale = evt.deltaY < 0 ? 1.1 : 0.9;
            this.zoomPopupAtCursor(popup, scale, overlay, evt);
        });
        /*连续按键 start****************************************************/
        zoomInButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.zoomPopup(popup, 1.1, overlay);
            }, 100); // Adjust the interval time as needed
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                zoomInButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            zoomInButton.addEventListener('mouseleave', clear);
        });
        zoomOutButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.zoomPopup(popup, 0.9, overlay);
            }, 100);
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                zoomOutButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            zoomOutButton.addEventListener('mouseleave', clear);
        });
        upButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.movePopup(popup, 0, -20);
            }, 100);
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                upButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            upButton.addEventListener('mouseleave', clear);
        });
        downButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.movePopup(popup, 0, 20);
            }, 100);
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                downButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            downButton.addEventListener('mouseleave', clear);
        });
        leftButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.movePopup(popup, -20, 0);
            }, 100);
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                leftButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            leftButton.addEventListener('mouseleave', clear);
        });
        rightButton.addEventListener('mousedown', (evt) => {
            evt.stopPropagation();
            const interval = setInterval(() => {
                this.movePopup(popup, 20, 0);
            }, 100);
            const clear = () => {
                clearInterval(interval);
                document.removeEventListener('mouseup', clear);
                rightButton.removeEventListener('mouseleave', clear);
            };
            document.addEventListener('mouseup', clear);
            rightButton.addEventListener('mouseleave', clear);
        });
        /*连续按键 end*************************************************/
    }
    movePopup(popup, dx, dy) {
        const style = window.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const newX = matrix.m41 + dx;
        const newY = matrix.m42 + dy;
        popup.style.transform = `translate(${newX}px, ${newY}px) scale(${matrix.a})`;
    }
    zoomPopup(popup, scale, overlay) {
        const style = window.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;
        const newScale = currentScale * scale;
        const overlayRect = overlay.getBoundingClientRect();
        const overlayCenterX = overlayRect.left + overlayRect.width / 2;
        const overlayCenterY = overlayRect.top + overlayRect.height / 2;
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;
        const offsetX = overlayCenterX - popupCenterX;
        const offsetY = overlayCenterY - popupCenterY;
        const newX = matrix.m41 + offsetX * (1 - scale);
        const newY = matrix.m42 + offsetY * (1 - scale);
        popup.style.transformOrigin = 'center center'; // Ensure scaling is centered
        popup.style.transform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
    }
    zoomPopupAtCursor(popup, scale, overlay, evt) {
        const style = window.getComputedStyle(popup);
        const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
        const currentScale = matrix.a;
        const newScale = currentScale * scale;
        const overlayRect = overlay.getBoundingClientRect();
        const mouseX = evt.clientX - overlayRect.left;
        const mouseY = evt.clientY - overlayRect.top;
        const popupRect = popup.getBoundingClientRect();
        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;
        const offsetX = mouseX - popupCenterX;
        const offsetY = mouseY - popupCenterY;
        const newX = matrix.m41 - offsetX * (scale - 1);
        const newY = matrix.m42 - offsetY * (scale - 1);
        popup.style.transformOrigin = 'center center'; // Ensure scaling is centered
        popup.style.transform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
    }
    adjustSvgSize(svgElement, popup) {
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
            svgElement.style.width = `${svgWidth * scale}px`;
            svgElement.style.height = `${svgHeight * scale}px`;
        }
        else {
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
        }
        svgElement.style.transformOrigin = 'center center'; // Center transform origin
        svgElement.style.position = 'absolute';
        svgElement.style.top = '50%';
        svgElement.style.left = '50%';
        svgElement.style.transform = 'translate(-50%, -50%)';
    }
    makeDraggable(element) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        const mouseDownHandler = (e) => {
            isDragging = true;
            const style = window.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
            startX = e.clientX - matrix.m41;
            startY = e.clientY - matrix.m42;
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };
        const mouseMoveHandler = (e) => {
            if (!isDragging)
                return;
            const style = window.getComputedStyle(element);
            const matrix = style.transform === 'none' ? new DOMMatrix() : new DOMMatrixReadOnly(style.transform);
            initialX = e.clientX - startX;
            initialY = e.clientY - startY;
            element.style.transform = `translate(${initialX}px, ${initialY}px) scale(${matrix.a})`;
        };
        const mouseUpHandler = () => {
            isDragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        element.addEventListener('mousedown', mouseDownHandler);
    }
    registerMermaidHeightAdjustment() {
        const observer = new MutationObserver(() => {
            this.adjustMermaidHeights();
        });
        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);
        this.register(() => observer.disconnect());
        this.adjustMermaidHeights();
    }
    adjustMermaidHeights() {
        const sourceView = document.querySelector('.markdown-source-view');
        const previewView = document.querySelector('.markdown-preview-view');
        if (sourceView) {
            const mermaidDivs = sourceView.querySelectorAll('.mermaid');
            mermaidDivs.forEach((div) => {
                div.style.maxHeight = `${sourceView.clientHeight * 0.9}px`;
            });
        }
        if (previewView) {
            const mermaidDivs = previewView.querySelectorAll('.mermaid');
            mermaidDivs.forEach((div) => {
                div.style.maxHeight = `${previewView.clientHeight * 0.9}px`;
            });
        }
    }
}
exports.default = MermaidPopupPlugin;
