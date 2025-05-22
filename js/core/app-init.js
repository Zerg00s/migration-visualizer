/**
 * App Initialization
 * Central initialization and registration of all visualizers
 */
import { visualizerRegistry } from './VisualizerRegistry.js';
import { TenantToTenantVisualizer } from '../migrations/tenant-to-tenant/TenantToTenantVisualizer.js';
import { FileSharesVisualizer } from '../migrations/file-shares/FileSharesVisualizer.js';
import { SharePointOnPremVisualizer } from '../migrations/sharepoint-onprem/SharePointOnPremVisualizer.js';
import { GoogleWorkspaceVisualizer } from '../migrations/google-workspace/GoogleWorkspaceVisualizer.js';

/**
 * Register all available visualizers
 */
export function registerVisualizers() {
  visualizerRegistry.register('tenant-to-tenant', TenantToTenantVisualizer);
  visualizerRegistry.register('file-shares', FileSharesVisualizer);
  visualizerRegistry.register('sharepoint-onprem', SharePointOnPremVisualizer);
  visualizerRegistry.register('google-workspace', GoogleWorkspaceVisualizer);
}

/**
 * Initialize visualizer based on page type
 * @param {string} pageType - The type of visualization page
 * @returns {Promise<Object>} The initialized visualizer instance
 */
export async function initializeVisualizer(pageType) {
  // Register all visualizers
  registerVisualizers();
  
  // Check if visualizer type exists
  if (!visualizerRegistry.has(pageType)) {
    throw new Error(`Unknown visualizer type: ${pageType}`);
  }
  
  // Create and initialize visualizer
  const visualizer = visualizerRegistry.create(pageType);
  await visualizer.init();
  
  return visualizer;
}

/**
 * Get page type from URL or data attribute
 * @returns {string} The page type
 */
export function getPageType() {
  // Try to get from data attribute
  const pageElement = document.querySelector('[data-page-type]');
  if (pageElement) {
    return pageElement.getAttribute('data-page-type');
  }
  
  // Try to determine from URL
  const path = window.location.pathname;
  if (path.includes('tenant-to-tenant')) return 'tenant-to-tenant';
  if (path.includes('file-shares')) return 'file-shares';
  if (path.includes('sharepoint-onprem')) return 'sharepoint-onprem';
  if (path.includes('google-workspace')) return 'google-workspace';
  
  // Default
  return 'tenant-to-tenant';
}

/**
 * Setup global error handling
 */
export function setupErrorHandling() {
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    // Could show user-friendly error message here
  });
  
  window.addEventListener('error', event => {
    console.error('Global error:', event.error);
    // Could show user-friendly error message here
  });
}

/**
 * Setup keyboard shortcuts
 * @param {Object} visualizer - The visualizer instance
 */
export function setupKeyboardShortcuts(visualizer) {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + A - Select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      // Implementation would need to be added to select all visible objects
    }
    
    // Escape - Clear selection
    if (e.key === 'Escape') {
      visualizer.clearSelection();
    }
    
    // Delete - Reset visualization
    if (e.key === 'Delete' && e.shiftKey) {
      e.preventDefault();
      if (confirm('Reset all migrations?')) {
        visualizer.resetVisualization();
      }
    }
    
    // Ctrl/Cmd + Z - Undo (if state manager is integrated)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      // visualizer.stateManager.undo();
    }
    
    // Ctrl/Cmd + Shift + Z - Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      // visualizer.stateManager.redo();
    }
  });
}
