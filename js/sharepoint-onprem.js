/**
 * SharePoint On-Premises Migration Visualizer
 * Main entry point for the SharePoint on-premises migration page
 */
import { SharePointOnPremMigrationVisualizer } from './sharepoint-onprem/SharePointOnPremMigrationVisualizer.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the SharePoint on-premises visualizer
  const sharePointOnPremVisualizer = new SharePointOnPremMigrationVisualizer();
  
  // Make it globally available for migration zone
  window.migrationVisualizer = sharePointOnPremVisualizer;
  
  sharePointOnPremVisualizer.init();
  
  // Initialize migration zone
  initializeMigrationZone();
  adjustArrowsForScreenSize();
});