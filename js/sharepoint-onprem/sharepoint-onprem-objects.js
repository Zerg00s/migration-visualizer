/**
 * SharePoint On-Premises Object creation and management functionality
 */
import { createFlyingAnimation } from '../visualizer/animations.js';

/**
 * Create a draggable object element for SharePoint on-premises migration
 * @param {Object} data - Object data
 * @param {Object} objects - Objects state reference
 * @returns {HTMLElement} Created element
 */
export function createSharePointOnPremObjectElement(data, objects) {
  const element = document.createElement('div');
  element.className = `object-circle ${data.type}`;
  element.id = `${data.environment}-${data.id}`;
  element.setAttribute('data-id', data.id);
  element.setAttribute('data-type', data.type);
  element.setAttribute('data-environment', data.environment);
  element.setAttribute('data-name', data.name);
  
  // Set styles
  element.style.backgroundColor = data.color;
  
  // Add icon
  const icon = document.createElement('i');
  icon.className = `fas ${data.icon}`;
  element.appendChild(icon);
  
  // Add tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'object-tooltip';
  tooltip.textContent = data.name;
  
  if (data.department) {
    element.setAttribute('data-department', data.department);
    tooltip.textContent += ` (${data.department})`;
  }
  
  // Add migrated status if available
  if (data.migrated !== undefined) {
    element.setAttribute('data-migrated', data.migrated.toString());
    
    // Add visual indicator for migrated status
    if (data.migrated) {
      const migratedIndicator = document.createElement('div');
      migratedIndicator.className = 'migrated-indicator';
      
      // Add check icon to migrated indicator
      const checkIcon = document.createElement('i');
      checkIcon.className = 'fas fa-check';
      checkIcon.style.fontSize = '8px';
      checkIcon.style.color = 'white';
      migratedIndicator.appendChild(checkIcon);
      
      element.appendChild(migratedIndicator);
    }
  }
  
  element.appendChild(tooltip);
  
  // Store the object in our state
  objects[`${data.environment}-${data.id}`] = {
    ...data,
    element
  };
  
  return element;
}

/**
 * Create initial objects in source environment for SharePoint on-premises
 * @param {Array} allObjects - All objects data
 * @param {Array} connections - Connection data reference
 * @param {Array} initialConnections - Initial connection data
 * @param {Object} objects - Objects state reference
 */
export function createInitialSharePointOnPremObjects(allObjects, connections, initialConnections, objects) {
  // Group objects by type
  const objectsByType = allObjects.reduce((acc, obj) => {
    if (!acc[obj.type]) acc[obj.type] = [];
    acc[obj.type].push(obj);
    return acc;
  }, {});
  
  // Map of object types to container IDs for SharePoint on-premises
  const typeToContainerMap = {
    'user': 'source-users',
    'group': 'source-security-groups',
    'sharepoint-onprem': 'source-sharepoint-sites',
    'infopath-form': 'source-infopath-forms',
    'workflow': 'source-workflows'
  };
  
  // Create objects by type
  Object.keys(objectsByType).forEach(type => {
    const containerSelector = typeToContainerMap[type];
    
    if (!containerSelector) {
      console.warn(`No container mapping found for type: ${type}`);
      return;
    }
    
    const container = document.getElementById(containerSelector);
    
    if (!container) {
      console.warn(`Container not found: ${containerSelector} for type: ${type}`);
      return;
    }
    
    objectsByType[type].forEach(obj => {
      const sourceObj = createSharePointOnPremObjectElement({
        ...obj,
        environment: 'source'
      }, objects);
      
      container.appendChild(sourceObj);
    });
  });
  
  // Record the initial connections
  connections.length = 0;
  connections.push(...initialConnections);
}

/**
 * Copy an object from source to destination environment for SharePoint on-premises
 * @param {string} objectId - Object ID to copy
 * @param {string} objectType - Object type
 * @param {Object} objects - Objects state reference
 * @param {Array} connections - Connection data reference
 * @param {Function} addDestinationConnections - Function to add connections
 * @param {Function} updateConnections - Function to update connection lines
 * @returns {HTMLElement} The created destination object element
 */
export function copySharePointOnPremObjectToDestination(objectId, objectType, objects, connections, addDestinationConnections, updateConnections) {
  // Get the source object data
  const sourceObj = objects[`source-${objectId}`];
  
  if (!sourceObj) return null;
  
  // Map of source object types to destination container IDs and types
  const typeToDestinationMap = {
    'user': { container: 'destination-users', type: 'user' },
    'group': { container: 'destination-security-groups', type: 'group' },
    'sharepoint-onprem': { container: 'destination-sharepoint-online', type: 'sharepoint-online' },
    'infopath-form': { container: 'destination-power-apps', type: 'power-apps' },
    'workflow': { container: 'destination-power-automate', type: 'power-automate' }
  };
  
  const destinationInfo = typeToDestinationMap[objectType];
  
  if (!destinationInfo) {
    console.warn(`No destination mapping found for type: ${objectType}`);
    return null;
  }
  
  // Create destination object with transformed properties
  const destObj = createSharePointOnPremObjectElement({
    ...sourceObj,
    environment: 'destination',
    type: destinationInfo.type,
    migrated: true,
    // Transform object properties based on type
    ...(objectType === 'sharepoint-onprem' && {
      icon: 'fa-share-alt',
      color: '#4caf50'
    }),
    ...(objectType === 'infopath-form' && {
      icon: 'fa-mobile-alt',
      color: '#742774'
    }),
    ...(objectType === 'workflow' && {
      icon: 'fa-bolt',
      color: '#0066ff'
    })
  }, objects);
  
  // Add to appropriate destination bucket
  const container = document.getElementById(destinationInfo.container);
  if (container) {
    // First, hide the destination object (we'll show it after animation)
    destObj.style.opacity = '0';
    container.appendChild(destObj);
    
    // Get source element for animation
    const sourceEl = document.getElementById(`source-${objectId}`);
    if (sourceEl) {
      // Create the flying animation
      createFlyingAnimation(sourceEl, destObj, sourceObj);
      
      // Show the destination object after animation completes
      setTimeout(() => {
        destObj.style.opacity = '1';
        
        // Add the migrating class for additional effects
        destObj.classList.add('migrating');
        
        // Remove class after animation
        setTimeout(() => {
          destObj.classList.remove('migrating');
        }, 800);
      }, 1200); // Match this with animation duration
    }
  } else {
    console.warn(`Destination container not found: ${destinationInfo.container} for type: ${objectType}`);
    return null;
  }
  
  // Add the connections to this object
  addDestinationConnections(objectId);
  
  // Update connections visualization
  updateConnections();
  
  return destObj;
}