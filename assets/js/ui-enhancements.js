/**
 * FC UI Redesign - UI Enhancements
 * Uses MutationObservers to handle dynamic Vue SPA content rendering.
 */

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

