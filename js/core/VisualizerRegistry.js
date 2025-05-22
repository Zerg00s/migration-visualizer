/**
 * VisualizerRegistry - Registry for all migration visualizers
 * Allows dynamic registration and creation of visualizers
 */
export class VisualizerRegistry {
  constructor() {
    this.visualizers = new Map();
  }
  
  /**
   * Register a visualizer class
   * @param {string} type - The visualizer type identifier
   * @param {Class} visualizerClass - The visualizer class
   */
  register(type, visualizerClass) {
    if (!type || !visualizerClass) {
      throw new Error('Type and visualizer class are required');
    }
    
    this.visualizers.set(type, visualizerClass);
  }
  
  /**
   * Create a visualizer instance
   * @param {string} type - The visualizer type to create
   * @returns {Object} The visualizer instance
   */
  create(type) {
    const VisualizerClass = this.visualizers.get(type);
    
    if (!VisualizerClass) {
      throw new Error(`Unknown visualizer type: ${type}`);
    }
    
    return new VisualizerClass();
  }
  
  /**
   * Check if a visualizer type is registered
   * @param {string} type - The visualizer type
   * @returns {boolean} True if registered
   */
  has(type) {
    return this.visualizers.has(type);
  }
  
  /**
   * Get all registered visualizer types
   * @returns {Array<string>} Array of registered types
   */
  getTypes() {
    return Array.from(this.visualizers.keys());
  }
}

// Create and export singleton instance
export const visualizerRegistry = new VisualizerRegistry();
