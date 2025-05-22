/**
 * Simple Area Selection
 * Uses a simpler approach to selection by drawing a rectangle
 */

export class SimpleAreaSelection {
  /**
   * Creates a new area selection handler
   * @param {HTMLElement} container - The container element
   * @param {Function} onSelection - Callback when selection is made
   */
  constructor(container, onSelection) {
    this.container = container;
    this.onSelection = onSelection;
    this.isSelecting = false;
    this.selectionElement = null;
    this.startX = 0;
    this.startY = 0;
    
    this.createSelectionElement();
    this.attachEventListeners();
  }
  
  /**
   * Create the selection element
   */
  createSelectionElement() {
    this.selectionElement = document.createElement('div');
    this.selectionElement.className = 'simple-selection-box';
    this.selectionElement.style.position = 'absolute';
    this.selectionElement.style.border = '2px dashed #4a89dc';
    this.selectionElement.style.backgroundColor = 'rgba(74, 137, 220, 0.2)';
    this.selectionElement.style.zIndex = '1000';
    this.selectionElement.style.pointerEvents = 'none';
    this.selectionElement.style.display = 'none';
    
    this.container.appendChild(this.selectionElement);
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  /**
   * Handle mouse down event
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseDown(event) {
    // Allow selection to start from various container elements
    // Skip if clicking on interactive elements like buttons or objects
    if (event.target.closest('.object-circle') ||
        event.target.closest('button') ||
        event.target.closest('.controls') ||
        event.target.closest('.migration-zone') ||
        event.target.tagName === 'H3' ||
        event.target.tagName === 'H4') {
      return;
    }
    
    // Only start selection if clicking on valid selection areas
    if (event.target === this.container || 
        event.target.classList.contains('environment') ||
        event.target.classList.contains('bucket-container') ||
        event.target.classList.contains('bucket-content') ||
        event.target.classList.contains('bucket') ||
        event.target.classList.contains('bucket-title')) {
      
      // Get container bounds
      const containerRect = this.container.getBoundingClientRect();
      
      // Calculate start position relative to container
      this.startX = event.clientX - containerRect.left;
      this.startY = event.clientY - containerRect.top;
      
      // Start selecting
      this.isSelecting = true;
      
      // Position and show selection element
      this.selectionElement.style.left = `${this.startX}px`;
      this.selectionElement.style.top = `${this.startY}px`;
      this.selectionElement.style.width = '0';
      this.selectionElement.style.height = '0';
      this.selectionElement.style.display = 'block';
      
      // Track if ctrl/cmd key is pressed
      this.shouldClearPrevious = !(event.ctrlKey || event.metaKey);
      
      // Prevent text selection
      event.preventDefault();
    }
  }
  
  /**
   * Handle mouse move event
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseMove(event) {
    if (!this.isSelecting) return;
    
    // Get container bounds
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate current position relative to container
    const currentX = event.clientX - containerRect.left;
    const currentY = event.clientY - containerRect.top;
    
    // Calculate dimensions
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    
    // Calculate top-left position
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);
    
    // Update selection element
    this.selectionElement.style.left = `${left}px`;
    this.selectionElement.style.top = `${top}px`;
    this.selectionElement.style.width = `${width}px`;
    this.selectionElement.style.height = `${height}px`;
    
    // Highlight objects in selection
    this.highlightObjectsInSelection(left, top, width, height);
  }
  
  /**
   * Handle mouse up event
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseUp(event) {
    if (!this.isSelecting) return;
    
    // Get container bounds
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate final position and dimensions
    const currentX = event.clientX - containerRect.left;
    const currentY = event.clientY - containerRect.top;
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);
    
    // Only process selection if it has reasonable size
    if (width > 5 && height > 5) {
      const selectedObjects = this.getObjectsInSelection(left, top, width, height);
      
      if (selectedObjects.length > 0) {
        this.onSelection(selectedObjects, this.shouldClearPrevious);
      }
    }
    
    // Hide selection element
    this.selectionElement.style.display = 'none';
    this.isSelecting = false;
    
    // Clear highlights
    this.clearHighlights();
  }
  
  /**
   * Get objects in the current selection area
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {Array} - Array of selected elements
   */
  getObjectsInSelection(left, top, width, height) {
    // Get container bounds
    const containerRect = this.container.getBoundingClientRect();
    
    // Get all object elements
    const objects = this.container.querySelectorAll('.object-circle');
    const selectedObjects = [];
    
    // Calculate selection bounds
    const right = left + width;
    const bottom = top + height;
    
    // Check each object
    objects.forEach(object => {
      const objectRect = object.getBoundingClientRect();
      
      // Calculate object position relative to container
      const objectLeft = objectRect.left - containerRect.left;
      const objectTop = objectRect.top - containerRect.top;
      const objectRight = objectLeft + objectRect.width;
      const objectBottom = objectTop + objectRect.height;
      
      // Calculate object center
      const objectCenterX = objectLeft + (objectRect.width / 2);
      const objectCenterY = objectTop + (objectRect.height / 2);
      
      // Check if object center is inside selection
      if (objectCenterX >= left && objectCenterX <= right &&
          objectCenterY >= top && objectCenterY <= bottom) {
        selectedObjects.push(object);
      }
    });
    
    return selectedObjects;
  }
  
  /**
   * Highlight objects in selection
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width
   * @param {number} height - Height
   */
  highlightObjectsInSelection(left, top, width, height) {
    // Clear previous highlights
    this.clearHighlights();
    
    // Get objects in selection
    const objects = this.getObjectsInSelection(left, top, width, height);
    
    // Add highlight class
    objects.forEach(object => {
      object.classList.add('in-selection-box');
    });
  }
  
  /**
   * Clear highlights from all objects
   */
  clearHighlights() {
    const highlightedObjects = this.container.querySelectorAll('.in-selection-box');
    highlightedObjects.forEach(object => {
      object.classList.remove('in-selection-box');
    });
  }
  
  /**
   * Destroy this selection handler
   */
  destroy() {
    // Remove event listeners
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // Remove selection element
    if (this.selectionElement && this.selectionElement.parentNode) {
      this.selectionElement.parentNode.removeChild(this.selectionElement);
    }
    
    // Clear highlights
    this.clearHighlights();
  }
}