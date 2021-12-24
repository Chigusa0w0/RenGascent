declare global {
    interface Window { 
        messageBuffer: (IMessageBufferItem[] | null);
        messageOrigin: string;
    }
}

export interface IMessageBufferItem {
    method: string;
    callback: string | null;
    value: string | null;
}

export module Utils {

    export function initResizable() {
        document.addEventListener('DOMContentLoaded', function () {
            const resizable = function (resizer: HTMLElement) {
                const direction = resizer.getAttribute('data-direction') || 'vertical';
                const prevSibling = resizer.previousElementSibling as HTMLElement;
                const nextSibling = resizer.nextElementSibling as HTMLElement;
    
                // The current position of mouse
                let x = 0;
                let y = 0;
                let prevSiblingHeight = 0;
                let prevSiblingWidth = 0;
    
                // Handle the mousedown event
                // that's triggered when user drags the resizer
                const mouseDownHandler = function (e: MouseEvent) {
                    // Get the current mouse position
                    x = e.clientX;
                    y = e.clientY;
                    const rect = prevSibling.getBoundingClientRect();
                    prevSiblingHeight = rect.height;
                    prevSiblingWidth = rect.width;
    
                    // Attach the listeners to `document`
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                };
    
                const mouseMoveHandler = function (e: MouseEvent) {
                    // How far the mouse has been moved
                    const dx = e.clientX - x;
                    const dy = e.clientY - y;
    
                    switch (direction) {
                        case 'vertical':
                            const h =
                                ((prevSiblingHeight + dy) * 100) /
                                (resizer.parentNode! as HTMLElement).getBoundingClientRect().height;
                            prevSibling.style.height = `${h}%`;
                            break;
                        case 'horizontal':
                        default:
                            const w =
                                ((prevSiblingWidth + dx) * 100) / (resizer.parentNode! as HTMLElement).getBoundingClientRect().width;
                            prevSibling.style.width = `${w}%`;
                            break;
                    }
    
                    const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
                    resizer.style.cursor = cursor;
                    document.body.style.cursor = cursor;
    
                    prevSibling.style.userSelect = 'none';
                    prevSibling.style.pointerEvents = 'none';
    
                    nextSibling.style.userSelect = 'none';
                    nextSibling.style.pointerEvents = 'none';
                };
    
                const mouseUpHandler = function () {
                    resizer.style.removeProperty('cursor');
                    document.body.style.removeProperty('cursor');
    
                    prevSibling.style.removeProperty('user-select');
                    prevSibling.style.removeProperty('pointer-events');
    
                    nextSibling.style.removeProperty('user-select');
                    nextSibling.style.removeProperty('pointer-events');
    
                    // Remove the handlers of `mousemove` and `mouseup`
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                };
    
                // Attach the handler
                resizer.addEventListener('mousedown', mouseDownHandler);
            };
    
            // Query all resizers
            document.querySelectorAll('.resizer').forEach(function (ele) {
                resizable(ele as HTMLElement);
            });
        });
    }

    export function createChannel() {
        window.messageBuffer = [];

        window.addEventListener("message", (e) => {
            if (window.messageBuffer === null) {
                return;
            }

            if(!e.origin.match(/(?:nga\.cn|ngacn\.cc|nga\.178\.com|nga\.donews\.com|ngabbs.com|bigccq\.cn|127\.0\.0\.1)(?::\d+)?$/)) {
                return;
            }

            const matches = String(e.data).match(/(\w+)\s+(\w+)\s+([^]+)/);
            if (!matches) return;

            let method = matches[1];
            let callback: string | null = matches[2];
            let value: string | null = matches[3];

            if (!method || method === "null") return;
            if (callback === "null") callback = null;
            if (value === "null") value = null;

            if (method) {
                window.messageOrigin = e.origin;
                handleMessage(method, callback, value);
            }
        });
    }

    function handleMessage(method: string, callback: string | null, value: string | null) {
        if (window.messageBuffer !== null) {
            window.messageBuffer.push({method: method, callback: callback, value: value});
        }
    }
}
