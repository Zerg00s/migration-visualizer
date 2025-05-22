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
 * @param {Function} updateMigrateButtonState - Function to update migrate button state
 */
export function toggleObjectSelection(element, selectedObjects, updateConnections, updateObjectDetails, updateMigrateButtonState) {
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
  
  // Update migrate button state
  updateMigrateButtonState();
  
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
 */
export function updateObjectDetails(objectId, objects, connections, objectDetailsContent) {
  const obj = objects[objectId];
  
  if (!obj) {
    objectDetailsContent.innerHTML = `<p>Select an object to view its details and connections</p>`;
    return;
  }
  
  // Get the proper icon for each object type
  const iconMap = {
    'user': 'fa-user',
    'group': 'fa-users',
    'sharepoint': 'fa-share-alt',
    'teams': 'fa-comments',
    'onedrive': 'fa-cloud',
    'm365-group': 'fa-sitemap',
    'mailbox': 'fa-envelope'
  };
  
  // Find connections for this object
  const relatedConnections = connections.filter(conn => 
    `${obj.environment}-${conn.source}` === objectId || 
    `${obj.environment}-${conn.target}` === objectId
  );
  
  const connectedObjectIds = relatedConnections.map(conn => {
    const isSource = `${obj.environment}-${conn.source}` === objectId;
    return isSource ? `${obj.environment}-${conn.target}` : `${obj.environment}-${conn.source}`;
  });
  
  const connectedObjects = connectedObjectIds
    .map(id => objects[id])
    .filter(obj => !!obj);
  
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
  
  // Add additional details based on object type
  if (obj.type === 'user') {
    detailsHtml += addUserDetails(obj);
  } else if (obj.type === 'group') {
    detailsHtml += addGroupDetails(obj);
  } else if (obj.type === 'teams') {
    detailsHtml += addTeamsDetails(obj);
  } else if (obj.type === 'sharepoint') {
    detailsHtml += addSharePointDetails(obj);
  } else if (obj.type === 'onedrive') {
    detailsHtml += addOneDriveDetails(obj);
  } else if (obj.type === 'mailbox') {
    detailsHtml += addMailboxDetails(obj);
  } else if (obj.type === 'm365-group') {
    detailsHtml += addM365GroupDetails(obj);
  }
  
  // Update the details panel
  objectDetailsContent.innerHTML = detailsHtml;
}

/**
 * Add detailed information for User objects
 * @param {Object} obj - User object data
 * @returns {string} HTML string with user details
 */
function addUserDetails(obj) {
  if (!obj.email && !obj.title && !obj.department) return '';

  return `
    <div class="object-details-section">
      <h5>User Details</h5>
      <div class="details-table">
        ${obj.title ? `<div class="details-row"><div class="details-label">Title:</div><div class="details-value">${obj.title}</div></div>` : ''}
        ${obj.department ? `<div class="details-row"><div class="details-label">Department:</div><div class="details-value">${obj.department}</div></div>` : ''}
        ${obj.email ? `<div class="details-row"><div class="details-label">Email:</div><div class="details-value">${obj.email}</div></div>` : ''}
        ${obj.disabled !== undefined ? `<div class="details-row"><div class="details-label">Account Status:</div><div class="details-value">${obj.disabled ? 'Disabled' : 'Active'}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for Security Group objects
 * @param {Object} obj - Security Group object data
 * @returns {string} HTML string with group details
 */
function addGroupDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Security Group Details</h5>
      <div class="details-table">
        ${obj.description ? `<div class="details-row"><div class="details-label">Description:</div><div class="details-value">${obj.description}</div></div>` : ''}
        ${obj.classification ? `<div class="details-row"><div class="details-label">Classification:</div><div class="details-value">${obj.classification}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for Teams objects
 * @param {Object} obj - Teams object data
 * @returns {string} HTML string with teams details
 */
function addTeamsDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Teams Details</h5>
      <div class="details-table">
        ${obj.description ? `<div class="details-row"><div class="details-label">Description:</div><div class="details-value">${obj.description}</div></div>` : ''}
        ${obj.readOnly !== undefined ? `<div class="details-row"><div class="details-label">Read Only:</div><div class="details-value">${obj.readOnly ? 'Yes' : 'No'}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for SharePoint objects
 * @param {Object} obj - SharePoint object data
 * @returns {string} HTML string with SharePoint details
 */
function addSharePointDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>SharePoint Site Details</h5>
      <div class="details-table">
        ${obj.description ? `<div class="details-row"><div class="details-label">Description:</div><div class="details-value">${obj.description}</div></div>` : ''}
        ${obj.url ? `<div class="details-row"><div class="details-label">URL:</div><div class="details-value">${obj.url}</div></div>` : ''}
        ${obj.readOnly !== undefined ? `<div class="details-row"><div class="details-label">Read Only:</div><div class="details-value">${obj.readOnly ? 'Yes' : 'No'}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for OneDrive objects
 * @param {Object} obj - OneDrive object data
 * @returns {string} HTML string with OneDrive details
 */
function addOneDriveDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>OneDrive Details</h5>
      <div class="details-table">
        ${obj.url ? `<div class="details-row"><div class="details-label">URL:</div><div class="details-value">${obj.url}</div></div>` : ''}
        ${obj.migrated !== undefined ? `<div class="details-row"><div class="details-label">Migration Status:</div><div class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for Mailbox objects
 * @param {Object} obj - Mailbox object data
 * @returns {string} HTML string with mailbox details
 */
function addMailboxDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Mailbox Details</h5>
      <div class="details-table">
        ${obj.email ? `<div class="details-row"><div class="details-label">Email:</div><div class="details-value">${obj.email}</div></div>` : ''}
        ${obj.migrated !== undefined ? `<div class="details-row"><div class="details-label">Migration Status:</div><div class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</div></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Add detailed information for M365 Group objects
 * @param {Object} obj - M365 Group object data
 * @returns {string} HTML string with M365 Group details
 */
function addM365GroupDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>M365 Group Details</h5>
      <div class="details-table">
        ${obj.description ? `<div class="details-row"><div class="details-label">Description:</div><div class="details-value">${obj.description}</div></div>` : ''}
        ${obj.email ? `<div class="details-row"><div class="details-label">Email:</div><div class="details-value">${obj.email}</div></div>` : ''}
        ${obj.migrated !== undefined ? `<div class="details-row"><div class="details-label">Migration Status:</div><div class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</div></div>` : ''}
      </div>
    </div>
  `;
}