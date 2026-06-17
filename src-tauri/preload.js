// preload.js
(function() {
    console.log("WhatsWrap Core Engine Interceptor Active!");

    const originalWindowOpen = window.open;

    window.open = function(url, target, features) {
        if (url && url.startsWith('http') && !url.includes('web.whatsapp.com')) {
            console.log("Intercepting window.open via redirection:", url);
            window.location.href = url;
            return { close: () => {}, focus: () => {}, blur: () => {} };
        }
        return originalWindowOpen.call(window, url, target, features);
    };

    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target) {
            const href = target.getAttribute('href');
            if (href && href.startsWith('http') && !href.includes('web.whatsapp.com')) {
                console.log("Intercepting anchor click via redirection:", href);
                e.preventDefault();
                window.location.href = href;
            }
        }
    }, true);
})();
