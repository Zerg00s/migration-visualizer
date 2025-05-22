/**
 * StateManager - Centralized state management for visualizers
 * Manages application state and notifies subscribers of changes
 */
export class StateManager {
  constructor() {
    // Core state
    this.state = {
      selectedObjects: new Set(),
      migratedObjects: new Set(),
      connections: [],
      filters: {
        showAllConnections: false,
        objectTypes: new Set(),
        searchTerm: ''
      },
      ui: {
        isLoading: false,
        error: null,
        detailsPanelOpen: true,
        migrationZoneActive: false
      },
      metadata: {
        totalObjects: 0,
        totalConnections: 0,
        objectsByType: new Map()
      }
    };
    
    // Event listeners
    this.listeners = new Map();
    
    // History for undo/redo functionality
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
  }
  
  /**
   * Subscribe to state changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Emit an event to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  /**
   * Save current state to history
   */
  saveToHistory() {
    // Remove any states after current index
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add current state
    this.history.push(this.cloneState());
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }
  
  /**
   * Clone the current state
   * @returns {Object} Cloned state
   */
  cloneState() {
    return {
      selectedObjects: new Set(this.state.selectedObjects),
      migratedObjects: new Set(this.state.migratedObjects),
      connections: [...this.state.connections],
      filters: {
        ...this.state.filters,
        objectTypes: new Set(this.state.filters.objectTypes)
      }
    };
  }
  
  /**
   * Select an object
   * @param {string} objectId - Object ID to select
   */
  selectObject(objectId) {
    if (!this.state.selectedObjects.has(objectId)) {
      this.saveToHistory();
      this.state.selectedObjects.add(objectId);
      this.emit('selectionChanged', {
        selected: Array.from(this.state.selectedObjects),
        added: objectId
      });
    }
  }
  
  /**
   * Deselect an object
   * @param {string} objectId - Object ID to deselect
   */
  deselectObject(objectId) {
    if (this.state.selectedObjects.has(objectId)) {
      this.saveToHistory();
      this.state.selectedObjects.delete(objectId);
      this.emit('selectionChanged', {
        selected: Array.from(this.state.selectedObjects),
        removed: objectId
      });
    }
  }
  
  /**
   * Toggle object selection
   * @param {string} objectId - Object ID to toggle
   */
  toggleObjectSelection(objectId) {
    if (this.state.selectedObjects.has(objectId)) {
      this.deselectObject(objectId);
    } else {
      this.selectObject(objectId);
    }
  }
  
  /**
   * Clear all selections
   */
  clearSelection() {
    if (this.state.selectedObjects.size > 0) {
      this.saveToHistory();
      this.state.selectedObjects.clear();
      this.emit('selectionChanged', {
        selected: [],
        cleared: true
      });
    }
  }
  
  /**
   * Migrate objects
   * @param {Array<string>} objectIds - Object IDs to migrate
   */
  migrateObjects(objectIds) {
    this.saveToHistory();
    objectIds.forEach(id => {
      this.state.migratedObjects.add(id);
    });
    this.emit('objectsMigrated', {
      migrated: objectIds,
      total: this.state.migratedObjects.size
    });
  }
  
  /**
   * Set connections
   * @param {Array} connections - Array of connection objects
   */
  setConnections(connections) {
    this.state.connections = connections;
    this.state.metadata.totalConnections = connections.length;
    this.emit('connectionsUpdated', {
      connections: connections,
      total: connections.length
    });
  }
  
  /**
   * Update filter
   * @param {string} filterType - Filter type
   * @param {*} value - Filter value
   */
  updateFilter(filterType, value) {
    this.state.filters[filterType] = value;
    this.emit('filterChanged', {
      filterType: filterType,
      value: value,
      filters: this.state.filters
    });
  }
  
  /**
   * Toggle connection visibility
   */
  toggleConnectionVisibility() {
    this.state.filters.showAllConnections = !this.state.filters.showAllConnections;
    this.emit('filterChanged', {
      filterType: 'showAllConnections',
      value: this.state.filters.showAllConnections,
      filters: this.state.filters
    });
  }
  
  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.state.ui.isLoading = isLoading;
    this.emit('loadingStateChanged', {
      isLoading: isLoading
    });
  }
  
  /**
   * Set error state
   * @param {Error|null} error - Error object or null
   */
  setError(error) {
    this.state.ui.error = error;
    this.emit('errorStateChanged', {
      error: error
    });
  }
  
  /**
   * Undo last action
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
      this.emit('stateRestored', {
        action: 'undo',
        historyIndex: this.historyIndex
      });
    }
  }
  
  /**
   * Redo last undone action
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
      this.emit('stateRestored', {
        action: 'redo',
        historyIndex: this.historyIndex
      });
    }
  }
  
  /**
   * Restore state from history
   * @param {Object} historicalState - State to restore
   */
  restoreState(historicalState) {
    this.state.selectedObjects = new Set(historicalState.selectedObjects);
    this.state.migratedObjects = new Set(historicalState.migratedObjects);
    this.state.connections = [...historicalState.connections];
    this.state.filters = {
      ...historicalState.filters,
      objectTypes: new Set(historicalState.filters.objectTypes)
    };
    
    // Emit events for state changes
    this.emit('selectionChanged', {
      selected: Array.from(this.state.selectedObjects),
      restored: true
    });
  }
  
  /**
   * Reset all state
   */
  reset() {
    this.state.selectedObjects.clear();
    this.state.migratedObjects.clear();
    this.state.connections = [];
    this.state.filters.objectTypes.clear();
    this.state.filters.searchTerm = '';
    this.state.ui.error = null;
    this.history = [];
    this.historyIndex = -1;
    
    this.emit('stateReset', {});
  }
  
  /**
   * Get current state snapshot
   * @returns {Object} Current state
   */
  getState() {
    return {
      selectedCount: this.state.selectedObjects.size,
      migratedCount: this.state.migratedObjects.size,
      connectionsCount: this.state.connections.length,
      isLoading: this.state.ui.isLoading,
      hasError: this.state.ui.error !== null,
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1
    };
  }
}
