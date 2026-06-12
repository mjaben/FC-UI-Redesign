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
