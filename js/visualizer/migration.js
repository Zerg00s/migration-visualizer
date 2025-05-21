/**
 * Migration functionality for objects
 */
import { showNotification } from '../utils/helpers.js';
import { copyObjectToDestination } from './objects.js';

/**
 * Migrate selected objects to destination
 * @param {Set} selectedObjects - Set of selected object IDs
 * @param {Object} objects - Objects state
 * @param {Array} connections - Connections data
 * @param {Function} addDestinationConnections - Function to add connections
 * @param {Function} updateConnections - Function to update connections
 * @param {Function} clearSelection - Function to clear selection
 */
export function migrateSelectedObjects(
  selectedObjects, 
  objects, 
  connections, 
  addDestinationConnections, 
  updateConnections, 
  clearSelection
) {
  // Get all selected source objects
  const selectedSourceIds = Array.from(selectedObjects)
    .filter(id => id.startsWith('source-'))
    .map(id => id.split('-')[1]);
  
  if (selectedSourceIds.length === 0) return;
  
  // Group by type
  const objectsByType = {};
  
  selectedSourceIds.forEach(id => {
    const obj = objects[`source-${id}`];
    if (obj) {
      if (!objectsByType[obj.type]) {
        objectsByType[obj.type] = [];
      }
      objectsByType[obj.type].push(id);
    }
  });
  
  // Migrate each type
  let migratedCount = 0;
  
  Object.keys(objectsByType).forEach(type => {
    const ids = objectsByType[type];
    ids.forEach(id => {
      // Check if already in destination
      const existsInDestination = document.querySelector(`#destination-${id}`);
      
      if (!existsInDestination) {
        // Get the source element
        const sourceElement = document.querySelector(`#source-${id}`);
        
        // Create the destination object
        const destObj = copyObjectToDestination(
          id, 
          type, 
          objects, 
          connections, 
          addDestinationConnections,
          updateConnections
        );
        
        if (destObj) {
          migratedCount++;
          
          // Mark the source object as migrated
          if (sourceElement) {
            sourceElement.classList.add('migrated-source');
            
            // Add the migrated indicator to the source element
            const migratedIndicator = document.createElement('div');
            migratedIndicator.className = 'migrated-indicator';
            
            // Add check icon to migrated indicator
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check';
            checkIcon.style.fontSize = '8px';
            checkIcon.style.color = 'white';
            migratedIndicator.appendChild(checkIcon);
            
            // Only add if not already present
            if (!sourceElement.querySelector('.migrated-indicator')) {
              sourceElement.appendChild(migratedIndicator);
            }
            
            // Update the object state
            const sourceId = `source-${id}`;
            if (objects[sourceId]) {
              objects[sourceId].migrated = true;
            }
          }
        }
      }
    });
  });
  
  // Show notification
  if (migratedCount > 0) {
    showNotification(`Migrated ${migratedCount} object${migratedCount > 1 ? 's' : ''}`, 'success');
    
    // Update selection counter
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
  } else {
    showNotification('All selected objects already exist in destination', 'warning');
  }
  
  // Clear selection
  clearSelection();
}

/**
 * Reset the visualization to initial state
 * @param {Object} objects - Objects state reference
 * @param {Array} connections - Connections data reference
 * @param {Array} initialConnections - Initial connections data
 * @param {Function} clearSelection - Function to clear selection
 * @param {Function} updateConnections - Function to update connections
 */
export function resetVisualization(
  objects, 
  connections, 
  initialConnections, 
  clearSelection, 
  updateConnections
) {
  // Clear destination environment
  document.querySelectorAll('[id^="destination-"]').forEach(el => {
    if (el.classList.contains('bucket-content')) {
      el.innerHTML = '';
    }
  });
  
  // Reset source objects' migrated status
  document.querySelectorAll('.object-circle.migrated-source').forEach(el => {
    el.classList.remove('migrated-source');
    
    // Remove migrated indicator if present
    const indicator = el.querySelector('.migrated-indicator');
    if (indicator) {
      indicator.remove();
    }
    
    // Update the object state
    const objectId = el.id;
    if (objects[objectId]) {
      objects[objectId].migrated = false;
    }
  });
  
  // Update objects state
  const sourceObjects = {};
  Object.entries(objects).forEach(([key, value]) => {
    if (key.startsWith('source-')) {
      // Reset migrated status
      sourceObjects[key] = {
        ...value,
        migrated: false
      };
    }
  });
  
  // Reset objects
  Object.keys(objects).forEach(key => delete objects[key]);
  Object.entries(sourceObjects).forEach(([key, value]) => {
    objects[key] = value;
  });
  
  // Reset connections
  connections.length = 0;
  connections.push(...initialConnections);
  
  // Clear selection
  clearSelection();
  
  // Update connections visualization
  updateConnections();
  
  // Show notification
  showNotification('Visualization reset to initial state', 'success');
}