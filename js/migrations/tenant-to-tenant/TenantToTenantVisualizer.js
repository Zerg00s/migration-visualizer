/**
 * TenantToTenantVisualizer - Visualizer for tenant-to-tenant migrations
 * Extends BaseVisualizer with tenant-specific functionality
 */
import { BaseVisualizer } from '../../core/BaseVisualizer.js';
import { TenantDataService } from '../../services/TenantDataService.js';
import { createInitialObjects } from '../../visualizer/objects.js';

export class TenantToTenantVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/tenant-to-tenant-data.json',
      migrationType: 'tenant-to-tenant',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new TenantDataService();
  }
  
  /**
   * Load tenant migration data
   */
  async loadData() {
    return await this.dataService.loadTenantData(this.config.dataFile);
  }
  
  /**
   * Extract objects from tenant data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from tenant data
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
    
    // Use the existing createInitialObjects function
    createInitialObjects(
      objects,
      this.connections,
      connections,
      this.objects
    );
  }
}
