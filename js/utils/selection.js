/**
 * Object selection and details functionality
 * 
 * Selection can be done in two ways:
 * 1. Click or Ctrl/Cmd+Click individual objects
 * 2. Draw a selection box by dragging (implemented in SelectionBox.js)
 */

/**
 * Toggle selection of an object
 * @param {HTMLElement} element - Object element
 * @param {Set} selectedObjects - Set of selected object IDs
 * @param {Function} updateConnections - Function to update connections
 * @param {Function} updateObjectDetails - Function to update object details
 * @param {Function} updateMigrateButtonState - Function to update migrate button state (optional)
 */
export function toggleObjectSelection(element, selectedObjects, updateConnections, updateObjectDetails, updateMigrateButtonState = null) {
  const objectId = element.getAttribute('data-id');
  const objectEnv = element.getAttribute('data-environment');
  const fullId = `${objectEnv}-${objectId}`;
  
  // Get the tooltip element
  const tooltip = element.querySelector('.object-tooltip');
  
  if (selectedObjects.has(fullId)) {
    // Deselect
    selectedObjects.delete(fullId);
    element.classList.remove('selected');
    
    // Update tooltip text to remove "Selected" text
    if (tooltip) {
      const originalText = element.getAttribute('data-name');
      const department = element.getAttribute('data-department');
      tooltip.textContent = department ? `${originalText} (${department})` : originalText;
    }
  } else {
    // Select
    selectedObjects.add(fullId);
    element.classList.add('selected');
    
    // Update tooltip text to add "Selected" text
    if (tooltip) {
      const originalText = tooltip.textContent;
      tooltip.textContent = `${originalText} - Selected`;
    }
  }
  
  // Update connections to show selected object relationships
  updateConnections();
  
  // Update object details panel
  updateObjectDetails(fullId);
  
  // Update migrate button state (only if function is provided)
  if (updateMigrateButtonState) {
    updateMigrateButtonState();
  }
  
  // Dispatch custom event for migration zone to listen to
  document.dispatchEvent(new CustomEvent('selectionChanged', {
    detail: { selectedObjects: selectedObjects }
  }));
}

/**
 * Update the migrate button enabled/disabled state
 * @param {HTMLElement} migrateSelectedBtn - The migrate button element
 * @param {Set} selectedObjects - Set of selected object IDs
 */
export function updateMigrateButtonState(migrateSelectedBtn, selectedObjects) {
  if (!migrateSelectedBtn) return;
  
  // Enable if there are selected source objects
  const hasSelectedSourceObjects = Array.from(selectedObjects).some(id => id.startsWith('source-'));
  migrateSelectedBtn.disabled = !hasSelectedSourceObjects;
  
  if (hasSelectedSourceObjects) {
    migrateSelectedBtn.classList.remove('disabled');
  } else {
    migrateSelectedBtn.classList.add('disabled');
  }
}

/**
 * Update object details panel with selected object info
 * @param {string} objectId - Full object ID (env-id)
 * @param {Object} objects - Objects state
 * @param {Array} connections - Connections data
 * @param {HTMLElement} objectDetailsContent - Details panel element
 * @param {Object} categoryMap - Optional category mapping from data file
 */
export function updateObjectDetails(objectId, objects, connections, objectDetailsContent, categoryMap = null) {
  console.log('updateObjectDetails called with:', { objectId, objectsKeys: Object.keys(objects), connectionsLength: connections.length });
  
  // Handle null/undefined objectId (used to clear the details panel)
  if (!objectId) {
    console.log('Clearing object details (null objectId)');
    objectDetailsContent.innerHTML = `<p>Select an object to view its details and connections</p>`;
    return;
  }
  
  const obj = objects[objectId];
  
  if (!obj) {
    console.log('Object not found for ID:', objectId);
    objectDetailsContent.innerHTML = `<p>Select an object to view its details and connections</p>`;
    return;
  }
  
  console.log('Found object:', obj);
  
  // Get the proper icon for each object type
  const iconMap = {
    'user': 'fa-user',
    'group': 'fa-users',
    'sharepoint': 'fa-share-alt',
    'teams': 'fa-comments',
    'onedrive': 'fa-cloud',
    'm365-group': 'fa-sitemap',
    'mailbox': 'fa-envelope',
    'power-automate': 'fa-bolt',
    'power-apps': 'fa-mobile-alt',
    'power-bi': 'fa-chart-bar',
    'file-share': 'fa-folder',
    'sharepoint-site': 'fa-share-alt',
    'sharepoint-onprem': 'fa-server',
    'sharepoint-online': 'fa-share-alt',
    'infopath-form': 'fa-wpforms',
    'workflow': 'fa-project-diagram',
    'google-user': 'fab fa-google',
    'google-group': 'fab fa-google',
    'google-mailbox': 'fa-envelope',
    'google-shared-drive': 'fa-hdd',
    'google-drive': 'fab fa-google-drive',
    'entra-user': 'fa-user',
    'entra-group': 'fa-users',
    'exchange-online': 'fa-envelope'
  };
  
  // Find connections for this object
  // Extract the basic ID from the full objectId (remove environment prefix)
  const basicObjectId = objectId.split('-').slice(1).join('-'); // Handle IDs that might contain hyphens
  
  console.log('Looking for connections for:', { objectId, basicObjectId, connectionsTotal: connections.length });
  console.log('Sample connections:', connections.slice(0, 3));
  
  const relatedConnections = connections.filter(conn => 
    conn.source === basicObjectId || conn.target === basicObjectId
  );
  
  console.log('Found related connections:', relatedConnections.length, relatedConnections);
  
  const connectedObjectIds = relatedConnections.map(conn => {
    const isSource = conn.source === basicObjectId;
    const connectedBasicId = isSource ? conn.target : conn.source;
    // Look for the connected object in the same environment first, then any environment
    return `${obj.environment}-${connectedBasicId}`;
  });
  
  const connectedObjects = connectedObjectIds
    .map(id => objects[id])
    .filter(obj => !!obj);
  
  // If we didn't find objects in the same environment, try other environments
  if (connectedObjects.length < relatedConnections.length) {
    const additionalConnectedObjects = relatedConnections
      .map(conn => {
        const isSource = conn.source === basicObjectId;
        const connectedBasicId = isSource ? conn.target : conn.source;
        // Try both environments
        return objects[`source-${connectedBasicId}`] || objects[`destination-${connectedBasicId}`];
      })
      .filter(obj => !!obj && !connectedObjects.includes(obj));
    
    connectedObjects.push(...additionalConnectedObjects);
  }
  
  // Build clean, structured HTML
  let detailsHtml = `
    <div class="object-details-header">
      <div class="object-icon ${obj.type}">
        <i class="fas ${iconMap[obj.type] || 'fa-cube'}"></i>
      </div>
      <div class="object-info">
        <h4>${obj.name}</h4>
        <div class="object-details-grid">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${obj.type.charAt(0).toUpperCase() + obj.type.slice(1).replace('-', ' ')}</span>
          <span class="detail-label">Env:</span>
          <span class="detail-value">${obj.environment.charAt(0).toUpperCase() + obj.environment.slice(1)}</span>
          ${obj.department ? `<span class="detail-label">Dept:</span><span class="detail-value">${obj.department}</span>` : ''}
          ${obj.email ? `<span class="detail-label">Email:</span><span class="detail-value" style="font-size: 10px;">${obj.email}</span>` : ''}
          ${obj.title ? `<span class="detail-label">Title:</span><span class="detail-value">${obj.title}</span>` : ''}
          ${obj.description ? `<span class="detail-label">Desc:</span><span class="detail-value">${obj.description}</span>` : ''}
          ${obj.url ? `<span class="detail-label">URL:</span><span class="detail-value" style="font-size: 10px; word-break: break-all;">${obj.url}</span>` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Add status tags
  let statusTags = '';
  
  if (obj.migrated !== undefined) {
    statusTags += obj.migrated 
      ? `<div class="meta-tag migrated"><i class="fas fa-check-circle"></i>Migrated</div>` 
      : `<div class="meta-tag not-migrated"><i class="fas fa-clock"></i>Pending</div>`;
  }
  
  if (obj.disabled) {
    statusTags += `<div class="meta-tag disabled"><i class="fas fa-ban"></i>Disabled</div>`;
  }
  
  if (obj.readOnly) {
    statusTags += `<div class="meta-tag readonly"><i class="fas fa-lock"></i>Read Only</div>`;
  }
  
  if (statusTags) {
    detailsHtml += `<div class="object-meta">${statusTags}</div>`;
  }
  
  // Add connections section
  detailsHtml += `
    <div class="object-connections">
      <h5>Connected Objects (${connectedObjects.length})</h5>
  `;
  
  if (connectedObjects.length > 0) {
    detailsHtml += '<ul class="connections-list">';
    
    // List connected objects in ultra-dense format
    connectedObjects.forEach(connObj => {
      const connIcon = iconMap[connObj.type] || 'fa-cube';
      detailsHtml += `
        <li class="connection-item">
          <div class="connection-icon ${connObj.type}">
            <i class="fas ${connIcon}"></i>
          </div>
          <span class="connection-name">${connObj.name}</span>
          <span class="connection-type">${connObj.type.replace('-', '')}</span>
        </li>
      `;
    });
    
    detailsHtml += '</ul>';
  } else {
    detailsHtml += '<div class="no-connections">No connections</div>';
  }
  
  detailsHtml += '</div>';
  
  // Add a generic additional details section that shows all remaining properties
  detailsHtml += addGenericObjectDetails(obj, categoryMap);
  
  // Update the details panel
  objectDetailsContent.innerHTML = detailsHtml;
}

/**
 * Add detailed information for any object type - shows all available properties
 * @param {Object} obj - Object data
 * @param {Object} categoryMap - Optional category mapping from data file
 * @returns {string} HTML string with all object details
 */
function addGenericObjectDetails(obj, categoryMap = null) {
  // Properties that are already shown in the main header, so we skip them
  const skipProperties = new Set([
    'id', 'name', 'type', 'environment', 'element', 'color', 'icon',
    'DisplayName' // Skip DisplayName since it's shown as 'name' in header
  ]);
  
  // Get all properties that aren't already displayed
  const additionalProperties = Object.keys(obj).filter(key => !skipProperties.has(key));
  
  if (additionalProperties.length === 0) {
    return ''; // No additional properties to show
  }
  
  // Use the categoryMap from the data file if provided
  // If no categoryMap is provided, all properties will be shown under "Additional Details"
  const activeCategoryMap = categoryMap || {};
  
  // Group properties by category
  const categorizedProperties = {};
  const uncategorizedProperties = [];
  
  additionalProperties.forEach(key => {
    const category = activeCategoryMap[key] || null;
    if (category) {
      if (!categorizedProperties[category]) {
        categorizedProperties[category] = [];
      }
      categorizedProperties[category].push(key);
    } else {
      uncategorizedProperties.push(key);
    }
  });
  
  let detailsHtml = '';
  
  // Add categorized sections
  Object.keys(categorizedProperties).forEach(category => {
    const properties = categorizedProperties[category];
    
    detailsHtml += `
      <div class="object-details-section">
        <h5>${category}</h5>
        <table class="details-table">
    `;
    
    properties.forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        detailsHtml += `<tr><td class="details-label">${formatPropertyLabel(key)}:</td><td class="details-value">${formatPropertyValue(key, value)}</td></tr>`;
      }
    });
    
    detailsHtml += `
        </table>
      </div>
    `;
  });
  
  // Add uncategorized properties if any
  if (uncategorizedProperties.length > 0) {
    detailsHtml += `
      <div class="object-details-section">
        <h5>Additional Details</h5>
        <table class="details-table">
    `;
    
    uncategorizedProperties.forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        detailsHtml += `<tr><td class="details-label">${formatPropertyLabel(key)}:</td><td class="details-value">${formatPropertyValue(key, value)}</td></tr>`;
      }
    });
    
    detailsHtml += `
        </table>
      </div>
    `;
  }
  
  return detailsHtml;
}

/**
 * Format property label for display
 * @param {string} key - Property key
 * @returns {string} Formatted label
 */
function formatPropertyLabel(key) {
  // Convert camelCase/PascalCase to readable format
  return key
    .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
    .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
    .trim();
}

/**
 * Format property value for display
 * @param {string} key - Property key
 * @param {*} value - Property value
 * @returns {string} Formatted value
 */
function formatPropertyValue(key, value) {
  // Handle different types of values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.length <= 3 ? value.join(', ') : `${value.length} items`;
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  // Format dates
  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('login')) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    } catch (e) {
      // Not a valid date, continue with regular formatting
    }
  }
  
  // Format storage values (assuming they're in MB)
  if (key.toLowerCase().includes('storage') && typeof value === 'number') {
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} GB`;
    } else {
      return `${value} MB`;
    }
  }
  
  // Format counts
  if ((key.toLowerCase().includes('count') || key.toLowerCase().includes('runs') || key.toLowerCase().includes('users') || key.toLowerCase().includes('viewers')) && typeof value === 'number') {
    return value.toLocaleString();
  }
  
  // Regular string values
  return String(value);
}
