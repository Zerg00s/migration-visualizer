/**
 * Tenant-to-Tenant Migration Visualizer
 * Entry point for the tenant-to-tenant migration visualization page
 */
import { TenantToTenantVisualizer } from './migrations/tenant-to-tenant/TenantToTenantVisualizer.js';
import { visualizerRegistry } from './core/VisualizerRegistry.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Register the visualizer
visualizerRegistry.register('tenant-to-tenant', TenantToTenantVisualizer);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Create and initialize the visualizer
    const visualizer = visualizerRegistry.create('tenant-to-tenant');
    
    // Make it globally available for migration zone (temporary for compatibility)
    window.migrationVisualizer = visualizer;
    
    // Initialize the visualizer
    await visualizer.init();
    
    // Initialize migration zone
    initializeMigrationZone();
    adjustArrowsForScreenSize();
    
    // Make visualizer available globally for debugging
    if (window.DEBUG || localStorage.getItem('debug') === 'true') {
      window.visualizer = visualizer;
    }
  } catch (error) {
    console.error('Failed to initialize tenant-to-tenant visualizer:', error);
  }
});
