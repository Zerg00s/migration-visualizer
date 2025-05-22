/**
 * FileSharesVisualizer - Visualizer for file shares to M365 migrations
 * Extends BaseVisualizer with file shares-specific functionality
 */
import { BaseVisualizer } from '../../core/BaseVisualizer.js';
import { FileSharesDataService } from '../../services/FileSharesDataService.js';
import { createInitialFileSharesObjects } from '../../file-shares/file-shares-objects.js';

export class FileSharesVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/file-shares-data.json',
      migrationType: 'file-shares',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new FileSharesDataService();
  }
  
  /**
   * Load file shares migration data
   */
  async loadData() {
    return await this.dataService.loadFileSharesData(this.config.dataFile);
  }
  
  /**
   * Extract objects from file shares data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from file shares data
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
    
    // Use the existing createInitialFileSharesObjects function
    createInitialFileSharesObjects(
      objects,
      this.connections,
      connections,
      this.objects
    );
  }
}
