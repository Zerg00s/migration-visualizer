/**
 * Object creation and management functionality
 */

/**
 * Create a draggable object element
 * @param {Object} data - Object data
 * @param {Object} objects - Objects state reference
 * @returns {HTMLElement} Created element
 */
export function createObjectElement(data, objects) {
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
 * Create initial objects in source environment
 * @param {Array} allObjects - All objects data
 * @param {Array} connections - Connection data reference
 * @param {Array} initialConnections - Initial connection data
 * @param {Object} objects - Objects state reference
 */
export function createInitialObjects(allObjects, connections, initialConnections, objects) {
  // Group objects by type
  const objectsByType = allObjects.reduce((acc, obj) => {
    if (!acc[obj.type]) acc[obj.type] = [];
    acc[obj.type].push(obj);
    return acc;
  }, {});
  
  // Map of object types to container IDs
  const typeToContainerMap = {
    'user': 'source-users',
    'group': 'source-security-groups',
    'teams': 'source-teams',
    'sharepoint': 'source-sharepoint',
    'onedrive': 'source-onedrive',
    'm365-group': 'source-m365-groups',
    'mailbox': 'source-mailboxes'
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
    
    console.log(`Creating ${objectsByType[type].length} objects of type ${type} in container ${containerSelector}`);
    
    objectsByType[type].forEach(obj => {
      const sourceObj = createObjectElement({
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
 * Copy an object from source to destination environment
 * @param {string} objectId - Object ID to copy
 * @param {string} objectType - Object type
 * @param {Object} objects - Objects state reference
 * @param {Array} connections - Connection data reference
 * @param {Function} addDestinationConnections - Function to add connections
 * @param {Function} updateConnections - Function to update connection lines
 * @returns {HTMLElement} The created destination object element
 */
export function copyObjectToDestination(objectId, objectType, objects, connections, addDestinationConnections, updateConnections) {
  // Get the source object data
  const sourceObj = objects[`source-${objectId}`];
  
  if (!sourceObj) return null;
  
  // Map of object types to container IDs
  const typeToContainerMap = {
    'user': 'destination-users',
    'group': 'destination-security-groups',
    'teams': 'destination-teams',
    'sharepoint': 'destination-sharepoint',
    'onedrive': 'destination-onedrive',
    'm365-group': 'destination-m365-groups',
    'mailbox': 'destination-mailboxes'
  };
  
  // Create destination object with same properties but set migrated to true
  const destObj = createObjectElement({
    ...sourceObj,
    environment: 'destination',
    migrated: true  // Set migrated to true for destination objects
  }, objects);
  
  // Add to appropriate destination bucket
  const containerSelector = typeToContainerMap[objectType];
  const container = document.getElementById(containerSelector);
  if (container) {
    container.appendChild(destObj);
  } else {
    console.warn(`Destination container not found: ${containerSelector} for type: ${objectType}`);
    return null;
  }
  
  // Get source element position for animation
  const sourceEl = document.getElementById(`source-${objectId}`);
  if (sourceEl) {
    const sourceRect = sourceEl.getBoundingClientRect();
    const destRect = destObj.getBoundingClientRect();
    
    // Set initial position for animation
    const deltaX = sourceRect.left - destRect.left;
    const deltaY = sourceRect.top - destRect.top;
    
    // Apply the initial offset
    destObj.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.9)`;
    destObj.style.opacity = '0.3';
    
    // Trigger the animation
    setTimeout(() => {
      destObj.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
      destObj.style.transform = 'translate(0, 0) scale(1)';
      destObj.style.opacity = '1';
      
      // Add the migrating class for additional effects
      destObj.classList.add('migrating');
      
      // Remove transition and classes after animation
      setTimeout(() => {
        destObj.style.transition = '';
        destObj.classList.remove('migrating');
      }, 800);
    }, 50);
  }
  
  // Add the connections to this object
  addDestinationConnections(objectId);
  
  // Update connections visualization
  updateConnections();
  
  return destObj;
}