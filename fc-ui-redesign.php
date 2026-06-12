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
            filemtime( $js_path ),
            true // Load in footer
        );
    }
}
// Use standard WP hook and Fluent Community specific hook
add_action( 'wp_enqueue_scripts', 'fc_ui_redesign_enqueue_assets', 999 );
add_action( 'fluent_community/enqueue_global_assets', 'fc_ui_redesign_enqueue_assets', 999 );

/**
 * Inject the inline script to force hard reloads on Logo and Mobile Home clicks.
 * This script bypasses Vue Router to ensure a clean page refresh.
 * Added here so it reliably deploys with the custom plugin.
 */
function fc_ui_redesign_inject_hard_reload_script() {
    // We cannot use Helper directly if not loaded, so we get the site url or portal base
    $portal_url = esc_js( home_url('/') );
    if ( class_exists( '\FluentCommunity\App\Services\Helper' ) ) {
        $portal_url = esc_js( \FluentCommunity\App\Services\Helper::baseUrl('/') );
    }
    ?>
    <script>
    // Force hard reload on Logo and Mobile Home clicks (Bypassing Vue Router)
    window.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;

        var isLogo = link.closest('.fhr_logo, .site-logo');
        var isMobileHome = false;
        var targetHref = null;

        try {
            var portalUrl = '<?php echo $portal_url; ?>';
            var portalUrlObj = new URL(portalUrl, window.location.origin);
            var linkUrlObj = new URL(link.href, window.location.origin);
            
            // If we are on mobile, and the clicked link points to the portal home base URL
            if (window.innerWidth <= 1024 && (linkUrlObj.pathname === portalUrlObj.pathname || linkUrlObj.pathname === portalUrlObj.pathname + '/')) {
                isMobileHome = true;
            }
        } catch (err) {
            // Ignore URL parsing errors
        }

        if (isLogo) {
            targetHref = link.href || '<?php echo $portal_url; ?>';
        } else if (isMobileHome) { 
            targetHref = link.href;
        }

        if (targetHref) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var currentUrl = window.location.origin + window.location.pathname;
            try {
                var targetUrlObj2 = new URL(targetHref, window.location.origin);
                var targetUrl = targetUrlObj2.origin + targetUrlObj2.pathname;
                
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
    </script>
    <?php
}
add_action('wp_footer', 'fc_ui_redesign_inject_hard_reload_script', 999);
add_action('fluent_community/headless/footer', 'fc_ui_redesign_inject_hard_reload_script', 999);
