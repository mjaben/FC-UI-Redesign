/**
 * FC UI Redesign - UI Enhancements
 * Uses MutationObservers to handle dynamic Vue SPA content rendering.
 */

// Global Click Interceptor for Logo and Mobile Home (Bypasses Vue Router)
(function() {
    console.log("FC UI Redesign: JS Navigation Interceptor Loaded");
    function __fc_interceptNav(e) {
        var target = e.target;
        if (target && target.nodeType === 3) target = target.parentNode;
        if (!target || typeof target.closest !== 'function') return;

        var isLogo = target.closest('.fhr_logo, .site-logo');
        var link = target.closest('a');
        
        var logoEl = document.querySelector('.fhr_logo a, .site-logo a');
        var portalUrl = logoEl ? logoEl.href : window.location.origin + '/';
        var isMobileHome = false;

        // Check if it's a click in the bottom navigation pointing to home on mobile
        if (window.innerWidth <= 1024) {
            var isBottomBar = false;
            try {
                var rect = target.getBoundingClientRect();
                if (window.innerHeight - rect.bottom <= 100) {
                    isBottomBar = true;
                }
            } catch(err) {}

            var isHomePath = false;
            if (link && link.href) {
                try {
                    var portalUrlObj = new URL(portalUrl, window.location.origin);
                    var linkUrlObj = new URL(link.href, window.location.origin);
                    if (linkUrlObj.pathname === portalUrlObj.pathname || linkUrlObj.pathname === portalUrlObj.pathname + '/' || linkUrlObj.pathname.includes('/discover/spaces') || linkUrlObj.pathname.includes('/feed')) {
                        isHomePath = true;
                    }
                } catch (err) {}
            }

            // Strict class check or flexible coordinate check
            var isMobileHomeItem = target.closest('.fcom_sm_only.fcom_home_link, .fcom_menu_item_home, .fcom_menu_item_feed, .fcom_menu_item_all_feeds, .focm_menu_item, .mobile-nav-home');

            if (isMobileHomeItem || (isBottomBar && isHomePath)) {
                isMobileHome = true;
            }
        }

        var targetHref = null;
        if (isLogo) {
            targetHref = (link && link.href) ? link.href : portalUrl;
        } else if (isMobileHome) { 
            targetHref = (link && link.href) ? link.href : portalUrl;
        }

        if (targetHref) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var currentUrl = window.location.origin + window.location.pathname;
            try {
                var targetUrlObj = new URL(targetHref, window.location.origin);
                var targetUrl = targetUrlObj.origin + targetUrlObj.pathname;
                
                if (currentUrl === targetUrl) {
                    window.location.reload(true);
                } else {
                    window.location.href = targetHref;
                }
            } catch (err) {
                window.location.href = targetHref;
            }
        }
    }

    window.addEventListener('click', __fc_interceptNav, true);
    window.addEventListener('touchend', __fc_interceptNav, true);
})();

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
        
        // Inject Impression Count
        injectImpressionCount(element);

        element.dataset.fcEnhanced = "true";
    }

    function injectImpressionCount(element) {
        // Create the impression count element
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="fc-impression-count" style="display: flex; align-items: center; gap: 6px; color: var(--fc-text-secondary, #64748b); font-size: 14px; margin-left: 16px; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 500;">${Math.floor(Math.random() * 900 + 100)}K</span>
            </div>
        `;
        const impEl = wrapper.firstElementChild;

        // Add hover effect
        impEl.addEventListener('mouseenter', () => impEl.style.opacity = '1');
        impEl.addEventListener('mouseleave', () => impEl.style.opacity = '0.8');

        // Locate the action bar
        const svgs = element.querySelectorAll('svg');
        let actionBar = null;
        
        if (svgs.length > 0) {
            const actionSvg = Array.from(svgs).find(svg => true);
            if (actionSvg) {
                actionBar = actionSvg.closest('div[class*="flex"], div[class*="action"], div[class*="footer"]');
                if (actionBar) {
                    const leftActionGroup = actionBar.querySelector('div[class*="flex"]') || actionBar;
                    leftActionGroup.appendChild(impEl);
                    return;
                }
            }
        }
        
        // Fallback: append to the bottom of the card
        element.appendChild(impEl);
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

