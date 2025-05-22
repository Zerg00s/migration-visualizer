/**
 * Tenant-to-Tenant Migration Visualizer
 * Main controller class
 */
import { throttle } from '../utils/helpers.js';
import { loadMigrationData, getAllObjects, getAllConnections } from '../data/data-loader.js';
import { createInitialObjects } from './objects.js';
import { updateConnections, drawConnection, addDestinationConnections } from './connections.js';
import { toggleObjectSelection, updateMigrateButtonState, updateObjectDetails } from './selection.js';
import { migrateSelectedObjects, resetVisualization } from './migration.js';
import { animateInitialRender } from './animations.js';
import { SimpleAreaSelection } from './selection-box/SimpleAreaSelection.js';

/**
 * MigrationVisualizer class
 * Handles the interactive visualization of migration elements
 */
export class MigrationVisualizer {
  constructor() {
    // State
    this.objects = {};
    this.selectedObjects = new Set();
    this.connections = [];
    this.migrationData = null;
    this.showAllConnections = false;
    this.isLoading = true;
    
    // DOM Elements
    this.svg = null;
    this.toggleConnectionsBtn = document.getElementById('toggle-connections');
    this.migrateSelectedBtn = document.getElementById('migrate-selected');
    this.resetBtn = document.getElementById('reset');
    this.objectDetailsContent = document.getElementById('object-details-content');
    this.loadingIndicator = document.getElementById('loading-indicator');
    
    // Selection box
    this.selectionBox = null;
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
      
      // Load migration data
      this.migrationData = await loadMigrationData();
      
      // Extract objects and connections
      const allObjects = getAllObjects(this.migrationData);
      const allConnections = getAllConnections(this.migrationData);
      
      // Create objects in source environment
      createInitialObjects(
        allObjects,
        this.connections, 
        allConnections, 
        this.objects
      );
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Adjust SVG dimensions based on content
      this.adjustSvgSize();
      
      // Draw initial connections
      this.updateConnections();
      
      // Add click handler to visualizer main to clear selection on background click
      document.querySelector('.visualizer-main').addEventListener('click', (e) => {
        // Only clear if clicking directly on the background, not on objects or controls
        if (e.target.classList.contains('visualizer-main') || 
            e.target.classList.contains('visualizer-header') ||
            e.target.classList.contains('migration-container')) {
          this.clearSelection();
        }
      });
      
      // Initialize selection box
      this.initSelectionBox();
      
      // Animate the initial render
      animateInitialRender();
    } catch (error) {
      console.error('Failed to initialize visualizer:', error);
      this.showError('Failed to load migration data. Please try refreshing the page.');
    } finally {
      // Hide loading indicator
      this.showLoading(false);
    }
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
    
    // Migrate selected button
    this.migrateSelectedBtn.addEventListener('click', () => {
      this.migrateSelectedObjects();
    });
    
    // Reset button
    this.resetBtn.addEventListener('click', () => {
      this.resetVisualization();
    });
    
    // Click handler for object selection
    document.querySelectorAll('.bucket-content').forEach(bucket => {
      bucket.addEventListener('click', (e) => {
        const objectElement = e.target.closest('.object-circle');
        if (objectElement) {
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
    
    // Window resize handler
    window.addEventListener('resize', throttle(() => {
      // Resize SVG based on container
      this.adjustSvgSize();
      // Update connections
      this.updateConnections();
    }, 200));
    
    // Debug button
    const debugSvgBtn = document.getElementById('debug-show-svg');
    if (debugSvgBtn) {
      debugSvgBtn.parentNode.removeChild(debugSvgBtn); // Remove debug button
    }
    
    // Remove debug test selection box button as well
    const testSelectionBoxBtn = document.getElementById('test-selection-box');
    if (testSelectionBoxBtn) {
      testSelectionBoxBtn.parentNode.removeChild(testSelectionBoxBtn);
    }
  }
  
  // Method implementations that delegate to the imported functionality
  
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
      (objectId) => this.updateObjectDetails(objectId),
      () => this.updateMigrateButtonState()
    );
    
    // Update the selection counter
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
      selectedCount.textContent = this.selectedObjects.size;
    }
    
    // Update the selection counter visibility
    const selectionCounter = document.getElementById('selection-counter');
    if (selectionCounter) {
      if (this.selectedObjects.size > 0) {
        selectionCounter.style.opacity = '1';
        selectionCounter.style.transform = 'scale(1)';
      } else {
        selectionCounter.style.opacity = '0.5';
        selectionCounter.style.transform = 'scale(0.95)';
      }
    }
  }
  
  /**
   * Update migrate button state
   */
  updateMigrateButtonState() {
    updateMigrateButtonState(this.migrateSelectedBtn, this.selectedObjects);
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
      () => this.clearSelection()
    );
  }
  
  /**
   * Reset visualization
   */
  resetVisualization() {
    if (this.migrationData) {
      const allConnections = getAllConnections(this.migrationData);
      
      resetVisualization(
        this.objects,
        this.connections,
        allConnections,
        () => this.clearSelection(),
        () => this.updateConnections()
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
    
    // Reset selection counter
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
      selectedCount.textContent = '0';
    }
    
    // Update selection counter visibility
    const selectionCounter = document.getElementById('selection-counter');
    if (selectionCounter) {
      selectionCounter.style.opacity = '0.5';
      selectionCounter.style.transform = 'scale(0.95)';
    }
    
    this.updateConnections();
    this.updateObjectDetails(null);
    this.updateMigrateButtonState();
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
    
    // Add tooltip to inform users about the selection box functionality
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
      const selectionHelpDiv = document.createElement('div');
      selectionHelpDiv.className = 'selection-help';
      selectionHelpDiv.innerHTML = `
        <i class="fas fa-mouse-pointer"></i>
        <span>Click and drag to select multiple objects</span>
      `;
      
      // Insert before the first button
      const firstButton = controlsDiv.querySelector('button');
      if (firstButton) {
        controlsDiv.insertBefore(selectionHelpDiv, firstButton);
      } else {
        controlsDiv.appendChild(selectionHelpDiv);
      }
    }
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
}