window.addEventListener('DOMContentLoaded', () => {
    const titleNode = document.querySelector('title');

    if (titleNode) {
        const observer = new MutationObserver(() => {
            const titleText = document.title;
            const match = titleText.match(/^\((\d+)\)/);
            const unreadCount = match ? parseInt(match[1], 10) : 0;

            console.log(`Unread count updated: ${unreadCount}`);

            const payload = {
                cmd: 'plugin:event|emit',
                event: 'badge-update',
                payload: JSON.stringify(unreadCount),
                callback: 0,
                error: 0
            };

            if (window.chrome && window.chrome.webview) {
                // Windows (WebView2)
                window.chrome.webview.postMessage(payload);
            } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ipc) {
                // macOS / Linux (WebKit)
                window.webkit.messageHandlers.ipc.postMessage(payload);
            }
        });

        observer.observe(titleNode, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
});