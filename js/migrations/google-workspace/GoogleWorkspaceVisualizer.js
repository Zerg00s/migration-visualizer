/**
 * GoogleWorkspaceVisualizer - Visualizer for Google Workspace to M365 migrations
 * Extends BaseVisualizer with Google Workspace-specific functionality
 */
import { BaseVisualizer } from '../../core/BaseVisualizer.js';
import { GoogleWorkspaceDataService } from '../../services/GoogleWorkspaceDataService.js';
import { createInitialGoogleWorkspaceObjects } from '../../google-workspace/google-workspace-objects.js';

export class GoogleWorkspaceVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/google-workspace-data.json',
      migrationType: 'google-workspace',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new GoogleWorkspaceDataService();
  }
  
  /**
   * Load Google Workspace migration data
   */
  async loadData() {
    return await this.dataService.loadGoogleWorkspaceData(this.config.dataFile);
  }
  
  /**
   * Extract objects from Google Workspace data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from Google Workspace data
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
    
    // Use the existing createInitialGoogleWorkspaceObjects function
    createInitialGoogleWorkspaceObjects(
      objects,
      this.connections,
      connections,
      this.objects
    );
  }
}
