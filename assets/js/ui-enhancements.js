/**
 * FC UI Redesign - UI Enhancements
 * Uses MutationObservers to handle dynamic Vue SPA content rendering.
 */

// Global Click Interceptor for Logo and Mobile Home (Bypasses Vue Router)
window.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const isLogo = link.closest('.fhr_logo, .site-logo');
    let isMobileHome = false;

    // Dynamically determine the portal base URL by finding the logo
    const logoElement = document.querySelector('.fhr_logo a, .site-logo a');
    const portalBaseUrl = logoElement ? logoElement.href : window.location.origin;

    if (window.innerWidth <= 1024) {
        try {
            const portalUrlObj = new URL(portalBaseUrl, window.location.origin);
            const linkUrlObj = new URL(link.href, window.location.origin);
            
            // Check if the clicked link points to the portal base URL
            if (linkUrlObj.pathname === portalUrlObj.pathname || linkUrlObj.pathname === portalUrlObj.pathname + '/') {
                isMobileHome = true;
            }
        } catch (err) {
            // Ignore URL parsing errors
        }
    }

    let targetHref = null;
    if (isLogo) {
        targetHref = link.href || portalBaseUrl;
    } else if (isMobileHome) {
        targetHref = link.href;
    }

    if (targetHref) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const currentUrl = window.location.origin + window.location.pathname;
        try {
            const targetUrlObj = new URL(targetHref, window.location.origin);
            const targetUrl = targetUrlObj.origin + targetUrlObj.pathname;
            
            if (currentUrl === targetUrl) {
                window.location.reload(true);
            } else {
                window.location.href = targetHref;
            }
        } catch (err) {
            window.location.href = targetHref;
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup MutationObserver for the Vue app root
    const targetNode = document.getElementById('fluent-community-app') || document.querySelector('.fluent-community-app') || document.body;
    
    if (!targetNode) return;

    const config = { childList: true, subtree: true };

    const callback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                handleNewElements(mutation.addedNodes);
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Initial check in case elements are already rendered
    handleNewElements([targetNode]);

    /**
     * Process newly added nodes to apply structural classes or DOM tweaks
     */
    function handleNewElements(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Feed Items
                const feedItems = node.querySelectorAll ? node.querySelectorAll('.fcm-post-card, .fc-post-item') : [];
                if (node.classList && (node.classList.contains('fcm-post-card') || node.classList.contains('fc-post-item'))) {
                    enhanceFeedItem(node);
                }
                feedItems.forEach(enhanceFeedItem);

                // Video Containers
                const videoWrappers = node.querySelectorAll ? node.querySelectorAll('.fcm-orbits-video-container, .fc-video-wrapper') : [];
                if (node.classList && (node.classList.contains('fcm-orbits-video-container') || node.classList.contains('fc-video-wrapper'))) {
                    enhanceVideoContainer(node);
                }
                videoWrappers.forEach(enhanceVideoContainer);
                
                // Chat Window
                const chatWindows = node.querySelectorAll ? node.querySelectorAll('.fc-chat-widget') : [];
                if (node.classList && node.classList.contains('fc-chat-widget')) {
                    enhanceChatWidget(node);
                }
                chatWindows.forEach(enhanceChatWidget);
            }
        });
    }

    function enhanceFeedItem(element) {
        if (element.dataset.fcEnhanced) return;
        // Mark as enhanced.
        element.classList.add('fc-ui-enhanced-card');

        element.dataset.fcEnhanced = "true";
    }

    function enhanceVideoContainer(element) {
        if (element.dataset.fcEnhancedVideo) return;
        
        const parentCard = element.closest('.fcm-post-card, .fc-post-item');
        if (parentCard) {
            parentCard.classList.add('has-edge-to-edge-video');
        }
        element.dataset.fcEnhancedVideo = "true";
    }

    function enhanceChatWidget(element) {
        if (element.dataset.fcEnhancedChat) return;
        element.dataset.fcEnhancedChat = "true";
    }
});

