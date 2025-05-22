/**
 * Drag and drop functionality for the Migration Visualizer
 */
import { copyObjectToDestination } from './objects.js';

/**
 * Initialize D3 drag behavior for objects
 * @param {Object} visualizer - The MigrationVisualizer instance
 */
export function initDragBehavior(visualizer) {
  // Track mousedown state and timer
  let mouseDownTimer = null;
  let isDragging = false;
  
  // Add mousedown event listener for all objects
  document.querySelectorAll('.object-circle').forEach(element => {
    element.addEventListener('mousedown', (e) => {
      // Start a timer to determine if this is a click or a drag
      mouseDownTimer = setTimeout(() => {
        // If timer completes, this is a drag operation
        isDragging = true;
        // Let the d3 drag behavior handle it from here
      }, 200); // 200ms hold to start dragging
    });
    
    element.addEventListener('mouseup', (e) => {
      // Clear the timer if mouse is released before drag starts
      clearTimeout(mouseDownTimer);
      isDragging = false;
    });
  });
  
  // D3 drag behavior
  const drag = d3.drag()
    .on('start', function(event) {
      // Only start drag if we determined this is a drag operation
      if (!isDragging) {
        // If it's just a click, abort the drag operation
        return;
      }
      
      const element = this;
      element.classList.add('dragging');
      d3.select(element).raise();
      
      // Get the original element's position and dimensions
      const rect = element.getBoundingClientRect();
      
      // Create ghost element for visual feedback
      const ghost = element.cloneNode(true);
      ghost.style.position = 'absolute';
      ghost.style.zIndex = '1000';
      ghost.style.pointerEvents = 'none';
      ghost.classList.add('ghost-circle');
      document.body.appendChild(ghost);
      
      // Calculate offset from mouse to element center
      const offsetX = rect.width / 2;
      const offsetY = rect.height / 2;
      
      // Store references and data
      element._ghost = ghost;
      element._offsetX = offsetX;
      element._offsetY = offsetY;
      
      // Position ghost element relative to cursor
      ghost.style.left = `${event.sourceEvent.clientX - offsetX}px`;
      ghost.style.top = `${event.sourceEvent.clientY - offsetY}px`;
    })
    .on('drag', function(event) {
      if (!isDragging) return;
      
      const element = this;
      const ghost = element._ghost;
      
      if (ghost) {
        // Position ghost element relative to cursor
        ghost.style.left = `${event.sourceEvent.clientX - element._offsetX}px`;
        ghost.style.top = `${event.sourceEvent.clientY - element._offsetY}px`;
      }
      
      // Check for potential drop targets
      highlightDropTargets(element, event.sourceEvent);
    })
    .on('end', function(event) {
      const element = this;
      const ghost = element._ghost;
      
      if (isDragging) {
        // Try to drop the element
        handleDrop(element, event.sourceEvent, visualizer);
      }
      
      // Remove ghost element
      if (ghost) {
        ghost.remove();
        element._ghost = null;
      }
      
      // Remove highlighting from drop targets
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });
      
      element.classList.remove('dragging');
      isDragging = false;
    });
  
  // Apply drag behavior to object circles
  d3.selectAll('.object-circle').call(drag);
  
  return drag;
}

/**
 * Initialize drag behavior for objects in the destination
 * @param {HTMLElement} element - The element to make draggable
 */
export function initDestinationDrag(element) {
  d3.select(element).call(d3.drag()
    .on('start', function(event) {
      const element = this;
      element.classList.add('dragging');
      d3.select(element).raise();
    })
    .on('drag', function(event) {
      const element = this;
      const dx = event.x - event.subject.x;
      const dy = event.y - event.subject.y;
      
      // Move within the bucket only
      const parentBucket = element.closest('.bucket-content');
      const bucketRect = parentBucket.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      const maxX = bucketRect.width - elementRect.width;
      const maxY = bucketRect.height - elementRect.height;
      
      const newX = Math.max(0, Math.min(maxX, (element._dragX || 0) + dx));
      const newY = Math.max(0, Math.min(maxY, (element._dragY || 0) + dy));
      
      element.style.transform = `translate(${newX}px, ${newY}px)`;
    })
    .on('end', function() {
      const element = this;
      element.classList.remove('dragging');
      
      // Store the final position
      const transformValue = element.style.transform;
      const match = transformValue.match(/translate\((\d+)px, (\d+)px\)/);
      if (match) {
        element._dragX = parseInt(match[1]);
        element._dragY = parseInt(match[2]);
      }
    }));
}

/**
 * Highlight potential drop targets during drag
 * @param {HTMLElement} dragElement - Element being dragged
 * @param {Object} event - Drag event
 */
export function highlightDropTargets(dragElement, event) {
  // Remove previous highlights
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });
  
  // Find potential drop targets
  const elementId = dragElement.getAttribute('data-id');
  const elementType = dragElement.getAttribute('data-type');
  const elementEnv = dragElement.getAttribute('data-environment');
  
  // Can only drop if coming from source environment
  if (elementEnv !== 'source') return;
  
  // Find bucket element under cursor
  const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
  const bucketContent = elementsUnderCursor.find(el => 
    el.classList.contains('bucket-content') && 
    el.id.startsWith('destination-') &&
    el.id.includes(elementType)
  );
  
  // Check if the drop is valid
  if (bucketContent) {
    // Check if this object already exists in destination
    const existingDestination = document.querySelector(`#destination-${elementId}`);
    
    if (!existingDestination) {
      bucketContent.classList.add('drag-over');
    }
  }
}

/**
 * Handle dropping an object
 * @param {HTMLElement} dragElement - Element being dragged
 * @param {Object} event - Drag event
 * @param {Object} visualizer - The MigrationVisualizer instance
 */
export function handleDrop(dragElement, event, visualizer) {
  const elementId = dragElement.getAttribute('data-id');
  const elementType = dragElement.getAttribute('data-type');
  const elementEnv = dragElement.getAttribute('data-environment');
  
  // Can only drop if coming from source environment
  if (elementEnv !== 'source') return;
  
  // Find bucket element under cursor
  const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
  const bucketContent = elementsUnderCursor.find(el => 
    el.classList.contains('bucket-content') && 
    el.id.startsWith('destination-') &&
    el.id.includes(elementType)
  );
  
  // Check if the drop is valid
  if (bucketContent) {
    // Check if this object already exists in destination
    const existingDestination = document.querySelector(`#destination-${elementId}`);
    
    if (!existingDestination) {
      // Use the visualizer's copy method if available
      let destObj;
      if (visualizer && visualizer.copyObjectToDestination) {
        destObj = visualizer.copyObjectToDestination(elementId, elementType);
      } else {
        // Fallback to generic copy function
        destObj = copyObjectToDestination(
          elementId, 
          elementType, 
          visualizer.objects, 
          visualizer.connections, 
          visualizer.addDestinationConnections.bind(visualizer), 
          visualizer.updateConnections.bind(visualizer)
        );
      }
      
      // Apply drag behavior to the new object if created
      if (destObj) {
        initDestinationDrag(destObj);
      }
    } else {
      // Object already exists in destination - do nothing
    }
  }
}