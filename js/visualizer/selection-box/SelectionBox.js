/**
 * Selection Box Implementation
 * Allows selecting multiple objects by drawing a rectangle using native selection
 */

/**
 * SelectionBox class
 * Handles drawing a selection box and selecting objects within it
 */
export class SelectionBox {
  /**
   * Create a new SelectionBox
   * @param {HTMLElement} container - The container to attach the selection box to
   * @param {Function} onSelection - Callback when objects are selected, receives array of selected elements
   */
  constructor(container, onSelection) {
    this.container = container;
    this.onSelection = onSelection;
    this.active = false;
    this.startX = 0;
    this.startY = 0;
    this.selectionBox = null;
    this.shouldClearPreviousSelection = true;
    
    // Set the container to be selectable
    this.container.style.userSelect = 'auto';
    
    // Create and append the selection box element
    this.createSelectionBox();
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  /**
   * Create the selection box element
   */
  createSelectionBox() {
    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'selection-box';
    this.selectionBox.style.display = 'none';
    this.selectionBox.style.position = 'fixed'; // Use fixed position for better visibility
    this.selectionBox.style.border = '2px dashed #4a89dc';
    this.selectionBox.style.backgroundColor = 'rgba(74, 137, 220, 0.2)';
    this.selectionBox.style.pointerEvents = 'none'; // Prevent the box from capturing events
    this.selectionBox.style.zIndex = '9999';
    this.selectionBox.style.boxShadow = '0 0 10px rgba(74, 137, 220, 0.5)';
    
    // Add additional styles to increase visibility
    this.selectionBox.style.backdropFilter = 'blur(1px)';
    this.selectionBox.style.borderRadius = '2px';
    
    // Add after all styles for possible debugging
    document.body.appendChild(this.selectionBox);
    
    // Log that the box was created
    console.log('Selection box created');
  }
  
  /**
   * Initialize event listeners for mouse interactions
   */
  initEventListeners() {
    // Mousedown to start selection
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    
    // We attach these to document to capture events even if mouse moves outside container
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Prevent default browser selection behavior on the container
    this.container.addEventListener('selectstart', (e) => {
      // Only prevent if we're starting a drag selection
      if (this.active) {
        e.preventDefault();
      }
    });
  }
  
  /**
   * Handle mouse down event to start drawing selection box
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseDown(event) {
    // Only start selection if not clicking on an object
    if (event.target.classList.contains('migration-container') ||
        event.target.classList.contains('environment') ||
        event.target.classList.contains('bucket-container') ||
        event.target.classList.contains('bucket') ||
        event.target.classList.contains('bucket-content')) {
      
      // If not pressing Ctrl/Cmd key, we should clear previous selection
      this.shouldClearPreviousSelection = !(event.ctrlKey || event.metaKey);
      
      // Use clientX/Y for fixed positioning
      this.startX = event.clientX;
      this.startY = event.clientY;
      
      // Activate selection box
      this.active = true;
      
      // Show selection box
      this.selectionBox.style.display = 'block';
      this.selectionBox.style.left = `${this.startX}px`;
      this.selectionBox.style.top = `${this.startY}px`;
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';
      
      // Prevent default to avoid text selection
      event.preventDefault();
      
      // Add a test style to show activation
      console.log('Selection box activated at', this.startX, this.startY);
    }
  }
  
  /**
   * Handle mouse move event to resize selection box
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseMove(event) {
    if (!this.active) return;
    
    // Calculate dimensions (using clientX/Y for fixed positioning)
    const width = Math.abs(event.clientX - this.startX);
    const height = Math.abs(event.clientY - this.startY);
    
    // Calculate top-left position (handles dragging in any direction)
    const left = Math.min(event.clientX, this.startX);
    const top = Math.min(event.clientY, this.startY);
    
    // Update selection box style
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    
    // Find objects that would be selected
    this.updateObjectsInSelectionBox(left, top, width, height);
  }
  
  /**
   * Handle mouse up event to finalize selection
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseUp(event) {
    if (!this.active) return;
    
    // Get the final selection box coordinates (using clientX/Y for fixed positioning)
    const width = Math.abs(event.clientX - this.startX);
    const height = Math.abs(event.clientY - this.startY);
    const left = Math.min(event.clientX, this.startX);
    const top = Math.min(event.clientY, this.startY);
    
    // Only process selection if the box is big enough (prevents accidental tiny selections)
    if (width > 5 && height > 5) {
      // Get objects inside selection box
      const selectedObjects = this.getObjectsInSelectionBox(left, top, width, height);
      
      // Trigger callback with selected objects
      if (selectedObjects.length > 0) {
        this.onSelection(selectedObjects, this.shouldClearPreviousSelection);
      }
    }
    
    // Clear visual feedback
    this.clearObjectsInSelectionBoxFeedback();
    
    // Hide selection box
    this.active = false;
    this.selectionBox.style.display = 'none';
    
    console.log('Selection box deactivated, width:', width, 'height:', height);
  }
  
  /**
   * Update visual feedback for objects inside the selection box
   * @param {number} left - Left coordinate of selection box
   * @param {number} top - Top coordinate of selection box
   * @param {number} width - Width of selection box
   * @param {number} height - Height of selection box
   */
  updateObjectsInSelectionBox(left, top, width, height) {
    // Get all object elements
    const objectElements = this.container.querySelectorAll('.object-circle');
    
    // Calculate selection box bounds
    const selectionRight = left + width;
    const selectionBottom = top + height;
    
    // Clear previous visual feedback
    this.clearObjectsInSelectionBoxFeedback();
    
    // Check each object
    objectElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      // Calculate object position relative to viewport (for fixed positioning)
      const objectLeft = rect.left;
      const objectTop = rect.top;
      const objectRight = objectLeft + rect.width;
      const objectBottom = objectTop + rect.height;
      
      // Check if object center is inside selection box
      const objectCenterX = objectLeft + (rect.width / 2);
      const objectCenterY = objectTop + (rect.height / 2);
      
      if (objectCenterX >= left && objectCenterX <= selectionRight &&
          objectCenterY >= top && objectCenterY <= selectionBottom) {
        // Add visual feedback
        element.classList.add('in-selection-box');
      }
    });
  }
  
  /**
   * Get all objects that are inside the selection box
   * @param {number} left - Left coordinate of selection box
   * @param {number} top - Top coordinate of selection box
   * @param {number} width - Width of selection box
   * @param {number} height - Height of selection box
   * @returns {Array} Array of object elements that are inside the selection box
   */
  getObjectsInSelectionBox(left, top, width, height) {
    // Get all object elements
    const objectElements = this.container.querySelectorAll('.object-circle');
    const selectedObjects = [];
    
    // Calculate selection box bounds
    const selectionRight = left + width;
    const selectionBottom = top + height;
    
    // Check each object
    objectElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      // Calculate object position relative to viewport (for fixed positioning)
      const objectLeft = rect.left;
      const objectTop = rect.top;
      const objectRight = objectLeft + rect.width;
      const objectBottom = objectTop + rect.height;
      
      // Check if object center is inside selection box
      const objectCenterX = objectLeft + (rect.width / 2);
      const objectCenterY = objectTop + (rect.height / 2);
      
      if (objectCenterX >= left && objectCenterX <= selectionRight &&
          objectCenterY >= top && objectCenterY <= selectionBottom) {
        selectedObjects.push(element);
      }
    });
    
    return selectedObjects;
  }
  
  /**
   * Clear visual feedback for objects inside the selection box
   */
  clearObjectsInSelectionBoxFeedback() {
    const objectElements = this.container.querySelectorAll('.object-circle.in-selection-box');
    objectElements.forEach(element => {
      element.classList.remove('in-selection-box');
    });
  }
  
  /**
   * Destroy the selection box and remove event listeners
   */
  destroy() {
    // Clear any visual feedback
    this.clearObjectsInSelectionBoxFeedback();
    
    // Remove the selection box element
    if (this.selectionBox && this.selectionBox.parentNode) {
      this.selectionBox.parentNode.removeChild(this.selectionBox);
    }
    
    // Remove event listeners
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // Reset container style
    this.container.style.userSelect = '';
  }
}