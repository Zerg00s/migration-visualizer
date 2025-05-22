/**
 * DataService - Base service for all data operations
 * Provides common data loading functionality
 */
export class DataService {
  /**
   * Load data from a URL
   * @param {string} url - The URL to load data from
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
  
  /**
   * Transform raw data object to standardized format
   * @param {Object} rawObject - The raw data object
   * @param {string} type - The object type
   * @param {Object} config - Additional configuration
   * @returns {Object} Transformed object
   */
  transformObject(rawObject, type, config = {}) {
    return {
      id: rawObject.id,
      name: rawObject.DisplayName || rawObject.Name,
      type: type,
      color: config.color || '#999999',
      icon: config.icon || 'fa-circle',
      metadata: this.extractMetadata(rawObject, type),
      ...config.additionalProps
    };
  }
  
  /**
   * Extract metadata from raw object
   * @param {Object} rawObject - The raw data object
   * @param {string} type - The object type
   * @returns {Object} Metadata object
   */
  extractMetadata(rawObject, type) {
    // Base implementation - can be overridden by subclasses
    const metadata = {};
    
    // Copy all properties except id and DisplayName/Name
    Object.keys(rawObject).forEach(key => {
      if (key !== 'id' && key !== 'DisplayName' && key !== 'Name') {
        metadata[key] = rawObject[key];
      }
    });
    
    return metadata;
  }
  
  /**
   * Create a connection object
   * @param {string} sourceId - Source object ID
   * @param {string} targetId - Target object ID
   * @param {Object} metadata - Additional connection metadata
   * @returns {Object} Connection object
   */
  createConnection(sourceId, targetId, metadata = {}) {
    return {
      source: sourceId,
      target: targetId,
      ...metadata
    };
  }
}
