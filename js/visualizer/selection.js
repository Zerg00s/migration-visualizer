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
  } else if (obj.type === 'power-automate') {
    detailsHtml += addPowerAutomateDetails(obj);
  } else if (obj.type === 'power-apps') {
    detailsHtml += addPowerAppsDetails(obj);
  } else if (obj.type === 'power-bi') {
    detailsHtml += addPowerBIDetails(obj);
  } else if (obj.type === 'file-share') {
    detailsHtml += addFileShareDetails(obj);
  } else if (obj.type === 'sharepoint-site') {
    detailsHtml += addSharePointSiteDetails(obj);
  } else if (obj.type === 'sharepoint-onprem') {
    detailsHtml += addSharePointOnPremDetails(obj);
  } else if (obj.type === 'sharepoint-online') {
    detailsHtml += addSharePointOnlineDetails(obj);
  } else if (obj.type === 'infopath-form') {
    detailsHtml += addInfoPathFormDetails(obj);
  } else if (obj.type === 'workflow') {
    detailsHtml += addWorkflowDetails(obj);
  } else if (obj.type === 'google-user') {
    detailsHtml += addGoogleUserDetails(obj);
  } else if (obj.type === 'google-group') {
    detailsHtml += addGoogleGroupDetails(obj);
  } else if (obj.type === 'google-mailbox') {
    detailsHtml += addGoogleMailboxDetails(obj);
  } else if (obj.type === 'google-shared-drive') {
    detailsHtml += addGoogleSharedDriveDetails(obj);
  } else if (obj.type === 'google-drive') {
    detailsHtml += addGoogleDriveDetails(obj);
  } else if (obj.type === 'entra-user') {
    detailsHtml += addEntraUserDetails(obj);
  } else if (obj.type === 'entra-group') {
    detailsHtml += addEntraGroupDetails(obj);
  } else if (obj.type === 'exchange-online') {
    detailsHtml += addExchangeOnlineDetails(obj);
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
      <h5>Entra ID User Details</h5>
      <table class="details-table">
        ${obj.title ? `<tr><td class="details-label">Title:</td><td class="details-value">${obj.title}</td></tr>` : ''}
        ${obj.department ? `<tr><td class="details-label">Department:</td><td class="details-value">${obj.department}</td></tr>` : ''}
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.disabled !== undefined ? `<tr><td class="details-label">Account Status:</td><td class="details-value">${obj.disabled ? 'Disabled' : 'Active'}</td></tr>` : ''}
      </table>
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
      <h5>Entra ID Security Group Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.classification ? `<tr><td class="details-label">Classification:</td><td class="details-value">${obj.classification}</td></tr>` : ''}
      </table>
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
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.readOnly !== undefined ? `<tr><td class="details-label">Read Only:</td><td class="details-value">${obj.readOnly ? 'Yes' : 'No'}</td></tr>` : ''}
      </table>
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
      <h5>SharePoint Online Site Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.url ? `<tr><td class="details-label">URL:</td><td class="details-value">${obj.url}</td></tr>` : ''}
        ${obj.readOnly !== undefined ? `<tr><td class="details-label">Read Only:</td><td class="details-value">${obj.readOnly ? 'Yes' : 'No'}</td></tr>` : ''}
      </table>
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
      <table class="details-table">
        ${obj.url ? `<tr><td class="details-label">URL:</td><td class="details-value">${obj.url}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
      </table>
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
      <table class="details-table">
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
      </table>
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
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Power Automate objects
 * @param {Object} obj - Power Automate object data
 * @returns {string} HTML string with Power Automate details
 */
function addPowerAutomateDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Power Automate Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.state ? `<tr><td class="details-label">State:</td><td class="details-value">${obj.state}</td></tr>` : ''}
        ${obj.runs !== undefined ? `<tr><td class="details-label">Total Runs:</td><td class="details-value">${obj.runs}</td></tr>` : ''}
        ${obj.triggerType ? `<tr><td class="details-label">Trigger Type:</td><td class="details-value">${obj.triggerType}</td></tr>` : ''}
        ${obj.category ? `<tr><td class="details-label">Category:</td><td class="details-value">${obj.category}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Power Apps objects
 * @param {Object} obj - Power Apps object data
 * @returns {string} HTML string with Power Apps details
 */
function addPowerAppsDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Power Apps Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.appType ? `<tr><td class="details-label">App Type:</td><td class="details-value">${obj.appType}</td></tr>` : ''}
        ${obj.users !== undefined ? `<tr><td class="details-label">Active Users:</td><td class="details-value">${obj.users}</td></tr>` : ''}
        ${obj.category ? `<tr><td class="details-label">Category:</td><td class="details-value">${obj.category}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Power BI objects
 * @param {Object} obj - Power BI object data
 * @returns {string} HTML string with Power BI details
 */
function addPowerBIDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Power BI Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.workspaceName ? `<tr><td class="details-label">Workspace:</td><td class="details-value">${obj.workspaceName}</td></tr>` : ''}
        ${obj.viewers !== undefined ? `<tr><td class="details-label">Viewers:</td><td class="details-value">${obj.viewers}</td></tr>` : ''}
        ${obj.category ? `<tr><td class="details-label">Category:</td><td class="details-value">${obj.category}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for File Share objects
 * @param {Object} obj - File Share object data
 * @returns {string} HTML string with File Share details
 */
function addFileShareDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>File Share Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.uncPath ? `<tr><td class="details-label">UNC Path:</td><td class="details-value">${obj.uncPath}</td></tr>` : ''}
        ${obj.server ? `<tr><td class="details-label">Server:</td><td class="details-value">${obj.server}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Storage Used:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.fileCount !== undefined ? `<tr><td class="details-label">File Count:</td><td class="details-value">${obj.fileCount.toLocaleString()}</td></tr>` : ''}
        ${obj.shareType ? `<tr><td class="details-label">Share Type:</td><td class="details-value">${obj.shareType}</td></tr>` : ''}
        ${obj.backupStatus ? `<tr><td class="details-label">Backup Status:</td><td class="details-value">${obj.backupStatus}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for SharePoint Site objects (migrated from file shares)
 * @param {Object} obj - SharePoint Site object data
 * @returns {string} HTML string with SharePoint Site details
 */
function addSharePointSiteDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>SharePoint Online Site Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Original Size:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.fileCount !== undefined ? `<tr><td class="details-label">File Count:</td><td class="details-value">${obj.fileCount.toLocaleString()}</td></tr>` : ''}
        <tr><td class="details-label">Site Type:</td><td class="details-value">Team Site</td></tr>
        <tr><td class="details-label">Template:</td><td class="details-value">Document Library</td></tr>
      </table>
    </div>
  `;
}

/**
 * Add detailed information for SharePoint On-Premises objects
 * @param {Object} obj - SharePoint On-Premises object data
 * @returns {string} HTML string with SharePoint On-Premises details
 */
function addSharePointOnPremDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>SharePoint On-Premises Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.url ? `<tr><td class="details-label">URL:</td><td class="details-value">${obj.url}</td></tr>` : ''}
        ${obj.server ? `<tr><td class="details-label">Server:</td><td class="details-value">${obj.server}</td></tr>` : ''}
        ${obj.templateType ? `<tr><td class="details-label">Template:</td><td class="details-value">${obj.templateType}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Storage Used:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.listCount !== undefined ? `<tr><td class="details-label">List Count:</td><td class="details-value">${obj.listCount}</td></tr>` : ''}
        ${obj.pageViews !== undefined ? `<tr><td class="details-label">Page Views:</td><td class="details-value">${obj.pageViews.toLocaleString()}</td></tr>` : ''}
        ${obj.sharepointVersion ? `<tr><td class="details-label">Version:</td><td class="details-value">SharePoint ${obj.sharepointVersion}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for SharePoint Online objects (migrated from on-premises)
 * @param {Object} obj - SharePoint Online object data
 * @returns {string} HTML string with SharePoint Online details
 */
function addSharePointOnlineDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>SharePoint Online Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
        ${obj.templateType ? `<tr><td class="details-label">Template:</td><td class="details-value">${obj.templateType}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Original Size:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.listCount !== undefined ? `<tr><td class="details-label">List Count:</td><td class="details-value">${obj.listCount}</td></tr>` : ''}
        <tr><td class="details-label">Platform:</td><td class="details-value">SharePoint Online</td></tr>
        <tr><td class="details-label">Features:</td><td class="details-value">Modern Experience</td></tr>
      </table>
    </div>
  `;
}

/**
 * Add detailed information for InfoPath Form objects
 * @param {Object} obj - InfoPath Form object data
 * @returns {string} HTML string with InfoPath Form details
 */
function addInfoPathFormDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>InfoPath Form Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.formTemplate ? `<tr><td class="details-label">Template:</td><td class="details-value">${obj.formTemplate}</td></tr>` : ''}
        ${obj.formLibrary ? `<tr><td class="details-label">Library:</td><td class="details-value">${obj.formLibrary}</td></tr>` : ''}
        ${obj.formVersion ? `<tr><td class="details-label">Version:</td><td class="details-value">${obj.formVersion}</td></tr>` : ''}
        ${obj.submissionCount !== undefined ? `<tr><td class="details-label">Submissions:</td><td class="details-value">${obj.submissionCount.toLocaleString()}</td></tr>` : ''}
        ${obj.status ? `<tr><td class="details-label">Status:</td><td class="details-value">${obj.status}</td></tr>` : ''}
        ${obj.browserEnabled !== undefined ? `<tr><td class="details-label">Browser Enabled:</td><td class="details-value">${obj.browserEnabled ? 'Yes' : 'No'}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Workflow objects
 * @param {Object} obj - Workflow object data
 * @returns {string} HTML string with Workflow details
 */
function addWorkflowDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Workflow Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.workflowType ? `<tr><td class="details-label">Type:</td><td class="details-value">${obj.workflowType}</td></tr>` : ''}
        ${obj.associatedList ? `<tr><td class="details-label">Associated List:</td><td class="details-value">${obj.associatedList}</td></tr>` : ''}
        ${obj.workflowVersion ? `<tr><td class="details-label">Version:</td><td class="details-value">${obj.workflowVersion}</td></tr>` : ''}
        ${obj.instancesRunning !== undefined ? `<tr><td class="details-label">Running:</td><td class="details-value">${obj.instancesRunning}</td></tr>` : ''}
        ${obj.instancesCompleted !== undefined ? `<tr><td class="details-label">Completed:</td><td class="details-value">${obj.instancesCompleted.toLocaleString()}</td></tr>` : ''}
        ${obj.instancesError !== undefined ? `<tr><td class="details-label">Errors:</td><td class="details-value">${obj.instancesError}</td></tr>` : ''}
        ${obj.approvalSteps !== undefined ? `<tr><td class="details-label">Approval Steps:</td><td class="details-value">${obj.approvalSteps}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Google User objects
 * @param {Object} obj - Google User object data
 * @returns {string} HTML string with Google User details
 */
function addGoogleUserDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Google Workspace User Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.googleUsername ? `<tr><td class="details-label">Username:</td><td class="details-value">${obj.googleUsername}</td></tr>` : ''}
        ${obj.accountStatus ? `<tr><td class="details-label">Status:</td><td class="details-value">${obj.accountStatus}</td></tr>` : ''}
        ${obj.twoFactorEnabled !== undefined ? `<tr><td class="details-label">2FA Enabled:</td><td class="details-value">${obj.twoFactorEnabled ? 'Yes' : 'No'}</td></tr>` : ''}
        ${obj.googleWorkspaceRole ? `<tr><td class="details-label">Role:</td><td class="details-value">${obj.googleWorkspaceRole}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Google Group objects
 * @param {Object} obj - Google Group object data
 * @returns {string} HTML string with Google Group details
 */
function addGoogleGroupDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Google Groups Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.email ? `<tr><td class="details-label">Group Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.groupType ? `<tr><td class="details-label">Type:</td><td class="details-value">${obj.groupType}</td></tr>` : ''}
        ${obj.whoCanJoin ? `<tr><td class="details-label">Who Can Join:</td><td class="details-value">${obj.whoCanJoin.replace(/_/g, ' ')}</td></tr>` : ''}
        ${obj.whoCanViewMembership ? `<tr><td class="details-label">Who Can View:</td><td class="details-value">${obj.whoCanViewMembership.replace(/_/g, ' ')}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Gmail objects
 * @param {Object} obj - Gmail object data
 * @returns {string} HTML string with Gmail details
 */
function addGoogleMailboxDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Gmail Details</h5>
      <table class="details-table">
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Storage Used:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.messageCount !== undefined ? `<tr><td class="details-label">Messages:</td><td class="details-value">${obj.messageCount.toLocaleString()}</td></tr>` : ''}
        ${obj.imapEnabled !== undefined ? `<tr><td class="details-label">IMAP:</td><td class="details-value">${obj.imapEnabled ? 'Enabled' : 'Disabled'}</td></tr>` : ''}
        ${obj.popEnabled !== undefined ? `<tr><td class="details-label">POP:</td><td class="details-value">${obj.popEnabled ? 'Enabled' : 'Disabled'}</td></tr>` : ''}
        ${obj.forwardingEnabled !== undefined ? `<tr><td class="details-label">Forwarding:</td><td class="details-value">${obj.forwardingEnabled ? 'Enabled' : 'Disabled'}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Google Shared Drive objects
 * @param {Object} obj - Google Shared Drive object data
 * @returns {string} HTML string with Google Shared Drive details
 */
function addGoogleSharedDriveDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Google Shared Drive Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Storage Used:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.fileCount !== undefined ? `<tr><td class="details-label">File Count:</td><td class="details-value">${obj.fileCount.toLocaleString()}</td></tr>` : ''}
        ${obj.accessLevel ? `<tr><td class="details-label">Access Level:</td><td class="details-value">${obj.accessLevel}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Google Drive objects
 * @param {Object} obj - Google Drive object data
 * @returns {string} HTML string with Google Drive details
 */
function addGoogleDriveDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Google Drive Details</h5>
      <table class="details-table">
        ${obj.storageUsed !== undefined ? `<tr><td class="details-label">Storage Used:</td><td class="details-value">${(obj.storageUsed / 1024).toFixed(1)} GB</td></tr>` : ''}
        ${obj.storageQuota !== undefined ? `<tr><td class="details-label">Storage Quota:</td><td class="details-value">${(obj.storageQuota / 1048576).toFixed(0)} GB</td></tr>` : ''}
        ${obj.fileCount !== undefined ? `<tr><td class="details-label">File Count:</td><td class="details-value">${obj.fileCount.toLocaleString()}</td></tr>` : ''}
        ${obj.syncEnabled !== undefined ? `<tr><td class="details-label">Sync:</td><td class="details-value">${obj.syncEnabled ? 'Enabled' : 'Disabled'}</td></tr>` : ''}
        ${obj.backupStatus ? `<tr><td class="details-label">Backup:</td><td class="details-value">${obj.backupStatus}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Entra ID User objects (migrated from Google)
 * @param {Object} obj - Entra ID User object data
 * @returns {string} HTML string with Entra ID User details
 */
function addEntraUserDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Entra ID User Details</h5>
      <table class="details-table">
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
        ${obj.accountStatus ? `<tr><td class="details-label">Original Status:</td><td class="details-value">${obj.accountStatus}</td></tr>` : ''}
        <tr><td class="details-label">Platform:</td><td class="details-value">Microsoft 365</td></tr>
        <tr><td class="details-label">Features:</td><td class="details-value">Modern Authentication</td></tr>
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Entra ID Security Group objects (migrated from Google)
 * @param {Object} obj - Entra ID Security Group object data
 * @returns {string} HTML string with Entra ID Security Group details
 */
function addEntraGroupDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Entra ID Security Group Details</h5>
      <table class="details-table">
        ${obj.description ? `<tr><td class="details-label">Description:</td><td class="details-value">${obj.description}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
        ${obj.groupType ? `<tr><td class="details-label">Original Type:</td><td class="details-value">${obj.groupType}</td></tr>` : ''}
        <tr><td class="details-label">Platform:</td><td class="details-value">Microsoft 365</td></tr>
        <tr><td class="details-label">Type:</td><td class="details-value">Security Group</td></tr>
      </table>
    </div>
  `;
}

/**
 * Add detailed information for Exchange Online objects (migrated from Gmail)
 * @param {Object} obj - Exchange Online object data
 * @returns {string} HTML string with Exchange Online details
 */
function addExchangeOnlineDetails(obj) {
  return `
    <div class="object-details-section">
      <h5>Exchange Online Details</h5>
      <table class="details-table">
        ${obj.email ? `<tr><td class="details-label">Email:</td><td class="details-value">${obj.email}</td></tr>` : ''}
        ${obj.migrated !== undefined ? `<tr><td class="details-label">Migration Status:</td><td class="details-value">${obj.migrated ? 'Migrated' : 'Not Migrated'}</td></tr>` : ''}
        ${obj.messageCount !== undefined ? `<tr><td class="details-label">Original Messages:</td><td class="details-value">${obj.messageCount.toLocaleString()}</td></tr>` : ''}
        <tr><td class="details-label">Platform:</td><td class="details-value">Exchange Online</td></tr>
        <tr><td class="details-label">Features:</td><td class="details-value">Advanced Security</td></tr>
      </table>
    </div>
  `;
}