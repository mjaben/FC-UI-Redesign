<?php
/**
 * Plugin Name: FC UI Redesign
 * Description: Premium modern UI redesign for Fluent Community, blending clean X-like structures with an Apple-like aesthetic.
 * Version:     1.0.1
 * Author:      Intasela
 * Text Domain: fc-ui-redesign
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'FC_UI_REDESIGN_VERSION', '1.0.0' );
define( 'FC_UI_REDESIGN_PATH', plugin_dir_path( __FILE__ ) );
define( 'FC_UI_REDESIGN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Enqueue custom styles and scripts for the UI Redesign.
 */
function fc_ui_redesign_enqueue_assets() {
    // Only load on the frontend
    if ( is_admin() ) {
        return;
    }

    $css_path = FC_UI_REDESIGN_PATH . 'assets/css/main.css';
    $js_path  = FC_UI_REDESIGN_PATH . 'assets/js/ui-enhancements.js';

    if ( file_exists( $css_path ) ) {
        // Enqueue with a very high priority / later in the queue if possible,
        // though standard wp_enqueue_style usually handles this.
        // We add dependency on 'fluent-community-app' if we know the handle,
        // but since we might not know it, we just enqueue it late.
        wp_enqueue_style(
            'fc-ui-redesign-main',
            FC_UI_REDESIGN_URL . 'assets/css/main.css',
            array(),
            filemtime( $css_path )
        );
    }

    if ( file_exists( $js_path ) ) {
        wp_enqueue_script(
            'fc-ui-redesign-enhancements',
            FC_UI_REDESIGN_URL . 'assets/js/ui-enhancements.js',
            array(), // No jQuery dependency, using Vanilla JS
            time(), // FORCE CACHE BUST for production troubleshooting
            false // Load in head, since headless portal skips wp_footer()
        );

        // We removed wp_add_inline_script because headless portals don't trigger wp_print_scripts reliably
    }
}
// Use standard WP hook and Fluent Community specific hook
add_action( 'wp_enqueue_scripts', 'fc_ui_redesign_enqueue_assets', 999 );
add_action( 'fluent_community/enqueue_global_assets', 'fc_ui_redesign_enqueue_assets', 999 );

/**
 * Force hard reload on Logo and Mobile Home clicks (Bypassing Vue Router and caching)
 * Hooked to both standard wp_footer and Fluent Community specific portal actions.
 */
function fc_ui_redesign_inject_nav_interceptor() {
    // Only load on the frontend
    if ( is_admin() ) {
        return;
    }
    
    // Prevent duplicate printing if both hooks fire
    static $printed = false;
    if ( $printed ) {
        return;
    }
    $printed = true;
    
    ?>
    <script>
    (function() {
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
    </script>
    <?php
}
// Hook to multiple locations to guarantee it prints regardless of headless or standard WP rendering
add_action( 'wp_footer', 'fc_ui_redesign_inject_nav_interceptor', 9999 );
add_action( 'wp_head', 'fc_ui_redesign_inject_nav_interceptor', 9999 );
add_action( 'fluent_community/portal_footer', 'fc_ui_redesign_inject_nav_interceptor', 9999 );
add_action( 'fluent_community/portal_header', 'fc_ui_redesign_inject_nav_interceptor', 9999 );

