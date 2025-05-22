/**
 * SharePointOnPremVisualizer - Visualizer for SharePoint on-premises to M365 migrations
 * Extends BaseVisualizer with SharePoint on-prem-specific functionality
 */
import { BaseVisualizer } from '../../core/BaseVisualizer.js';
import { SharePointOnPremDataService } from '../../services/SharePointOnPremDataService.js';
import { createInitialSharePointOnPremObjects } from '../../sharepoint-onprem/sharepoint-onprem-objects.js';

export class SharePointOnPremVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/sharepoint-onprem-data.json',
      migrationType: 'sharepoint-onprem',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new SharePointOnPremDataService();
  }
  
  /**
   * Load SharePoint on-prem migration data
   */
  async loadData() {
    return await this.dataService.loadSharePointOnPremData(this.config.dataFile);
  }
  
  /**
   * Extract objects from SharePoint on-prem data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from SharePoint on-prem data
   */
  extractConnections(data) {
    return this.dataService.generateConnections(data);
  }
  
  /**
   * Create visual objects in the DOM
   */
  createObjects(objects, connections) {
    // Store connections
    this.connections = connections;
    
    // Use the existing createInitialSharePointOnPremObjects function
    createInitialSharePointOnPremObjects(
      objects,
      this.connections,
      connections,
      this.objects
    );
  }
}
