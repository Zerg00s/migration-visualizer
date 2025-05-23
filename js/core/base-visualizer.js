/**
 * BaseVisualizer - Abstract base class for all migration visualizers
 * Provides common functionality and enforces consistent interface
 */
import { throttle } from '../utils/helpers.js';
import { animateInitialRender } from '../visualizer/animations.js';
import { SimpleAreaSelection } from '../visualizer/selection-box/SimpleAreaSelection.js';
import { updateConnections, drawConnection, addDestinationConnections } from '../visualizer/connections.js';
import { toggleObjectSelection, updateObjectDetails } from '../visualizer/selection.js';
import { migrateSelectedObjects, resetVisualization } from '../visualizer/migration.js';

export class BaseVisualizer {
  constructor(config = {}) {
    // Configuration
    this.config = {
      dataFile: '',
      migrationType: '',
      enableSelectionBox: true,
      enableAnimations: true,
      ...config
    };
    
    // State
    this.objects = {};
    this.selectedObjects = new Set();
    this.connections = [];
    this.migrationData = null;
    this.showAllConnections = false;
    this.isLoading = true;
    
    // Simple undo/redo state
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoSteps = 20;
    
    // DOM Elements
    this.svg = null;
    this.toggleConnectionsBtn = null;
    this.resetBtn = null;
    this.objectDetailsContent = null;
    this.loadingIndicator = null;
    
    // Selection box
    this.selectionBox = null;
  }
  
  /**
   * Abstract methods to be implemented by subclasses
   */
  async loadData() {
    throw new Error('loadData() must be implemented by subclass');
  }
  
  extractObjects(data) {
    throw new Error('extractObjects() must be implemented by subclass');
  }
  
  extractConnections(data) {
    throw new Error('extractConnections() must be implemented by subclass');
  }
  
  createObjects(objects, connections) {
    throw new Error('createObjects() must be implemented by subclass');
  }
  
  /**
   * Initialize the visualizer
   */
  async init() {
    try {
      // Show loading indicator
      this.showLoading(true);
      
      // Set up SVG for connections
      const svgContainer = document.getElementById('svg-container');
      this.svg = d3.select('#connections-svg');
      
      // Initialize DOM elements
      this.initializeDOMElements();
      
      // Load migration data
      this.migrationData = await this.loadData();
      
      // Extract objects and connections
      const allObjects = this.extractObjects(this.migrationData);
      const allConnections = this.extractConnections(this.migrationData);
      
      console.log('BaseVisualizer - Extracted data:', {
        objects: allObjects.length,
        connections: allConnections.length
      });
      
      // Create objects in source environment
      this.createObjects(allObjects, allConnections);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Adjust SVG dimensions based on content
      this.adjustSvgSize();
      
      // Draw initial connections
      this.updateConnections();
      
      // Add click handler to visualizer main to clear selection on background click
      this.setupBackgroundClickHandler();
      
      // Initialize selection box
      if (this.config.enableSelectionBox) {
        this.initSelectionBox();
      }
      
      // Animate the initial render
      if (this.config.enableAnimations) {
        animateInitialRender();
      }
      
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
    } catch (error) {
      console.error(`Failed to initialize ${this.config.migrationType} visualizer:`, error);
      this.showError('Failed to load migration data. Please try refreshing the page.');
    } finally {
      // Hide loading indicator
      this.showLoading(false);
    }
  }
  
  /**
   * Initialize DOM element references
   */
  initializeDOMElements() {
    this.toggleConnectionsBtn = document.getElementById('toggle-connections');
    this.resetBtn = document.getElementById('reset');
    this.objectDetailsContent = document.getElementById('object-details-content');
    this.loadingIndicator = document.getElementById('loading-indicator');
  }
  
  /**
   * Set up background click handler
   */
  setupBackgroundClickHandler() {
    document.querySelector('.visualizer-main').addEventListener('click', (e) => {
      // Only clear if clicking directly on the background, not on objects or controls
      if (e.target.classList.contains('visualizer-main') || 
          e.target.classList.contains('visualizer-header') ||
          e.target.classList.contains('migration-container')) {
        this.clearSelection();
      }
    });
  }
  
  /**
   * Adjust SVG size based on visualizer content
   */
  adjustSvgSize() {
    const migrationContainer = document.querySelector('.migration-container');
    if (migrationContainer) {
      const rect = migrationContainer.getBoundingClientRect();
      this.svg
        .attr('width', rect.width)
        .attr('height', rect.height);
      
      // Force a redraw of connections after a short delay to ensure sizes are correct
      setTimeout(() => {
        this.updateConnections();
      }, 50);
    }
  }
  
  /**
   * Show or hide loading indicator
   * @param {boolean} show - Whether to show or hide the loading indicator
   */
  showLoading(show) {
    this.isLoading = show;
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }
  
  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Create error message element if it doesn't exist
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'error-message';
      errorElement.className = 'error-message';
      document.querySelector('.visualizer-main').prepend(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  /**
   * Set up event listeners for buttons and controls
   */
  setupEventListeners() {
    // Toggle connections button
    this.toggleConnectionsBtn.addEventListener('click', () => {
      this.showAllConnections = !this.showAllConnections;
      this.toggleConnectionsBtn.innerHTML = this.showAllConnections ? 
        '<i class="fas fa-network-wired"></i> Hide Connections' : 
        '<i class="fas fa-network-wired"></i> Show All Connections';
      this.updateConnections();
    });
    
    // Reset button
    this.resetBtn.addEventListener('click', () => {
      this.resetVisualization();
    });
    
    // Click handler for object selection
    this.setupObjectClickHandlers();
    
    // Window resize handler
    window.addEventListener('resize', throttle(() => {
      // Resize SVG based on container
      this.adjustSvgSize();
      // Update connections
      this.updateConnections();
    }, 200));
  }
  
  /**
   * Set up click handlers for objects
   */
  setupObjectClickHandlers() {
    document.querySelectorAll('.bucket-content').forEach(bucket => {
      bucket.addEventListener('click', (e) => {
        const objectElement = e.target.closest('.object-circle');
        if (objectElement) {
          // Add click animation for both source and destination objects
          this.addObjectClickAnimation(objectElement);
          
          // Handle ctrl/cmd key for multiple selection
          if (!e.ctrlKey && !e.metaKey) {
            // Single selection - clear previous selection unless it's the same object
            const objectId = objectElement.getAttribute('data-id');
            const objectEnv = objectElement.getAttribute('data-environment');
            const fullId = `${objectEnv}-${objectId}`;
            
            if (!this.selectedObjects.has(fullId)) {
              // Clear current selection first if this is a new selection
              this.clearSelection();
            }
          }
          
          // Toggle the clicked object
          this.toggleObjectSelection(objectElement);
          
          // Prevent any further click events from bubbling up
          e.stopPropagation();
        }
      });
    });
  }
  
  /**
   * Add click animation to objects when clicked
   * @param {HTMLElement} element - The clicked object element
   */
  addObjectClickAnimation(element) {
    // Remove any existing click highlight
    element.classList.remove('clicked');
    
    // Force a reflow to ensure the class is removed
    void element.offsetWidth;
    
    // Add the click highlight class
    element.classList.add('clicked');
    
    // Remove the class after a short highlight (200ms)
    setTimeout(() => {
      element.classList.remove('clicked');
    }, 200);
  }
  
  /**
   * Update connections visualization
   */
  updateConnections() {
    if (this.isLoading) return;
    
    updateConnections(
      this.svg, 
      this.connections, 
      this.selectedObjects, 
      this.showAllConnections, 
      (sourceEl, targetEl, conn) => this.drawConnection(sourceEl, targetEl, conn)
    );
  }
  
  /**
   * Draw a connection between two elements
   */
  drawConnection(sourceEl, targetEl, connection) {
    drawConnection(sourceEl, targetEl, connection, this.svg, this.selectedObjects);
  }
  
  /**
   * Add connections for a destination object
   */
  addDestinationConnections(objectId) {
    addDestinationConnections(objectId, this.connections);
  }
  
  /**
   * Toggle object selection
   */
  toggleObjectSelection(element) {
    toggleObjectSelection(
      element, 
      this.selectedObjects, 
      () => this.updateConnections(),
      (objectId) => this.updateObjectDetails(objectId)
    );
  }
  
  /**
   * Update object details panel
   */
  updateObjectDetails(objectId) {
    updateObjectDetails(objectId, this.objects, this.connections, this.objectDetailsContent);
  }
  
  /**
   * Migrate selected objects
   */
  migrateSelectedObjects() {
    migrateSelectedObjects(
      this.selectedObjects,
      this.objects,
      this.connections,
      (objectId) => this.addDestinationConnections(objectId),
      () => this.updateConnections(),
      () => this.clearSelection(),
      this.config.migrationType,
      this // Pass the visualizer instance
    );
  }
  
  /**
   * Reset visualization
   */
  resetVisualization() {
    if (this.migrationData) {
      const allConnections = this.extractConnections(this.migrationData);
      
      resetVisualization(
        this.objects,
        this.connections,
        allConnections,
        () => this.clearSelection(),
        () => this.updateConnections(),
        this // Pass the visualizer instance
      );
      
      // Clear any selection box visual feedback
      if (this.selectionBox) {
        this.selectionBox.clearHighlights();
      }
    }
  }
  
  /**
   * Clear all selected objects
   */
  clearSelection() {
    this.selectedObjects.clear();
    document.querySelectorAll('.object-circle.selected').forEach(el => {
      el.classList.remove('selected');
      
      // Reset tooltip text
      const tooltip = el.querySelector('.object-tooltip');
      if (tooltip) {
        const originalText = el.getAttribute('data-name');
        const department = el.getAttribute('data-department');
        tooltip.textContent = department ? `${originalText} (${department})` : originalText;
      }
    });
    
    this.updateConnections();
    this.updateObjectDetails(null);
    
    // Dispatch custom event for migration zone
    document.dispatchEvent(new CustomEvent('selectionChanged', {
      detail: { selectedObjects: this.selectedObjects }
    }));
  }
  
  /**
   * Initialize selection box for multi-select by drag
   */
  initSelectionBox() {
    // Find the migration container which will contain the selection box
    const migrationContainer = document.querySelector('.migration-container');
    if (!migrationContainer) return;
    
    // Initialize the selection box with the simple implementation
    this.selectionBox = new SimpleAreaSelection(migrationContainer, this.handleSelectionBoxSelection.bind(this));
  }
  
  /**
   * Handle selection box selection
   * @param {Array} selectedElements - Elements that were selected by the box
   * @param {boolean} shouldClearPrevious - Whether to clear previous selection
   */
  handleSelectionBoxSelection(selectedElements, shouldClearPrevious) {
    if (selectedElements.length === 0) return;
    
    // Clear previous selection if needed
    if (shouldClearPrevious) {
      this.clearSelection();
    }
    
    // Toggle selection for each element
    selectedElements.forEach(element => {
      // If element is not already selected, select it
      const objectId = element.getAttribute('data-id');
      const objectEnv = element.getAttribute('data-environment');
      const fullId = `${objectEnv}-${objectId}`;
      
      if (!this.selectedObjects.has(fullId)) {
        this.toggleObjectSelection(element);
      }
    });
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts if not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }
      
      // Ctrl/Cmd + Shift + Z - Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.redo();
      }
      
      // Escape - Clear selection
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });
  }
  
  /**
   * Save current state to undo stack
   */
  saveStateToUndo() {
    const currentState = {
      migratedObjects: this.getMigratedObjectIds(),
      timestamp: Date.now()
    };
    
    this.undoStack.push(currentState);
    
    // Limit undo stack size
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
  }
  
  /**
   * Get list of migrated object IDs
   */
  getMigratedObjectIds() {
    const migrated = [];
    Object.keys(this.objects).forEach(fullId => {
      if (fullId.startsWith('destination-')) {
        const basicId = fullId.replace('destination-', '');
        migrated.push(basicId);
      }
    });
    return migrated;
  }
  
  /**
   * Undo the last migration action
   */
  undo() {
    if (this.undoStack.length === 0) {
      console.log('Nothing to undo');
      return;
    }
    
    // Save current state to redo stack
    const currentState = {
      migratedObjects: this.getMigratedObjectIds(),
      timestamp: Date.now()
    };
    this.redoStack.push(currentState);
    
    // Get previous state
    const previousState = this.undoStack.pop();
    
    // Apply previous state
    this.restoreState(previousState);
    
    console.log('Undo performed');
  }
  
  /**
   * Redo the last undone action
   */
  redo() {
    if (this.redoStack.length === 0) {
      console.log('Nothing to redo');
      return;
    }
    
    // Save current state to undo stack
    const currentState = {
      migratedObjects: this.getMigratedObjectIds(),
      timestamp: Date.now()
    };
    this.undoStack.push(currentState);
    
    // Get next state
    const nextState = this.redoStack.pop();
    
    // Apply next state
    this.restoreState(nextState);
    
    console.log('Redo performed');
  }
  
  /**
   * Restore a previous state
   */
  restoreState(state) {
    // Clear all destination objects
    const destinationContainers = document.querySelectorAll('[id^="destination-"]');
    destinationContainers.forEach(container => {
      if (container.classList.contains('bucket-content')) {
        container.innerHTML = '';
      }
    });
    
    // Clear destination objects from state
    Object.keys(this.objects).forEach(fullId => {
      if (fullId.startsWith('destination-')) {
        delete this.objects[fullId];
      }
    });
    
    // Restore connections to original state
    if (this.migrationData) {
      const originalConnections = this.extractConnections(this.migrationData);
      this.connections.length = 0;
      this.connections.push(...originalConnections);
    }
    
    // Re-migrate objects that should be migrated (without animation)
    state.migratedObjects.forEach(objectId => {
      const sourceObj = this.objects[`source-${objectId}`];
      if (sourceObj && this.copyObjectToDestination) {
        // Call copyObjectToDestination without animation
        const destObj = this.copyObjectToDestination(objectId, sourceObj.type);
        if (destObj) {
          // Make sure it's immediately visible (no animation)
          destObj.style.opacity = '1';
          destObj.classList.remove('migrating');
        }
      }
    });
    
    // Clear selection and update UI
    this.clearSelection();
    this.updateConnections();
  }
}
