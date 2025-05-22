/**
 * Data loader for Migration Visualizer
 * Loads data from JSON file and formats it for visualization
 */

/**
 * Load migration data from JSON file
 * @param {string} dataFile - The data file to load (defaults to tenant-to-tenant-data.json)
 * @returns {Promise<Object>} The loaded migration data
 */
export async function loadMigrationData(dataFile = 'data/tenant-to-tenant-data.json') {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error(`Failed to load migration data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading migration data:', error);
    throw error;
  }
}

/**
 * Extract user objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of user objects formatted for visualization
 */
export function extractUsers(data) {
  return data.Users.map(user => ({
    id: user.id,
    name: user.DisplayName,
    type: 'user',
    color: '#64b5f6',
    icon: 'fa-user',
    department: user.Department,
    email: user.Email,
    title: user.Title,
    disabled: user.Disabled
  }));
}

/**
 * Extract security group objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of security group objects formatted for visualization
 */
export function extractSecurityGroups(data) {
  return data.SecurityGroups.map(group => ({
    id: group.id,
    name: group.DisplayName,
    type: 'group',
    color: '#7e57c2',
    icon: 'fa-users',
    description: group.Description,
    members: group.Members,
    classification: group.Classification
  }));
}

/**
 * Extract team objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of team objects formatted for visualization
 */
export function extractTeams(data) {
  return data.Teams.map(team => ({
    id: team.id,
    name: team.DisplayName,
    type: 'teams',
    color: '#673ab7',
    icon: 'fa-people-group',
    description: team.Description,
    owners: team.Owners,
    members: team.Members,
    readOnly: team.ReadOnly
  }));
}

/**
 * Extract SharePoint site objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of SharePoint site objects formatted for visualization
 */
export function extractSharePointSites(data) {
  return data.SharePointSites.map(site => ({
    id: site.id,
    name: site.DisplayName,
    type: 'sharepoint',
    color: '#4caf50',
    icon: 'fa-folder',
    description: site.Description,
    url: site.URL,
    owners: site.Owners,
    members: site.Members,
    visitors: site.Visitors,
    readOnly: site.ReadOnly
  }));
}

/**
 * Extract OneDrive objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of OneDrive objects formatted for visualization
 */
export function extractOneDrives(data) {
  return data.OneDrives.map(onedrive => ({
    id: onedrive.id,
    name: onedrive.DisplayName,
    type: 'onedrive',
    color: '#2196f3',
    icon: 'fa-folder-open',
    ownedBy: onedrive.OwnedBy,
    sharedWith: onedrive.SharedWith,
    migrated: onedrive.Migrated
  }));
}

/**
 * Extract mailbox objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of mailbox objects formatted for visualization
 */
export function extractMailboxes(data) {
  return data.Mailboxes.map(mailbox => ({
    id: mailbox.id,
    name: mailbox.DisplayName,
    type: 'mailbox',
    color: '#e91e63',
    icon: 'fa-envelope',
    email: mailbox.Email,
    ownedBy: mailbox.OwnedBy,
    delegateAccess: mailbox.DelegateAccess,
    migrated: mailbox.Migrated
  }));
}

/**
 * Extract Power Automate objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Power Automate objects formatted for visualization
 */
export function extractPowerAutomate(data) {
  return data.PowerAutomate.map(flow => ({
    id: flow.id,
    name: flow.DisplayName,
    type: 'power-automate',
    color: '#0066ff',
    icon: 'fa-bolt',
    description: flow.Description,
    ownedBy: flow.OwnedBy,
    state: flow.State,
    runs: flow.Runs,
    triggerType: flow.TriggerType,
    category: flow.Category
  }));
}

/**
 * Extract Power Apps objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Power Apps objects formatted for visualization
 */
export function extractPowerApps(data) {
  return data.PowerApps.map(app => ({
    id: app.id,
    name: app.DisplayName,
    type: 'power-apps',
    color: '#742774',
    icon: 'fa-mobile-alt',
    description: app.Description,
    ownedBy: app.OwnedBy,
    appType: app.AppType,
    users: app.Users,
    category: app.Category
  }));
}

/**
 * Extract Power BI objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Power BI objects formatted for visualization
 */
export function extractPowerBI(data) {
  return data.PowerBI.map(report => ({
    id: report.id,
    name: report.DisplayName,
    type: 'power-bi',
    color: '#f2c811',
    icon: 'fa-chart-bar',
    description: report.Description,
    ownedBy: report.OwnedBy,
    workspaceName: report.WorkspaceName,
    viewers: report.Viewers,
    category: report.Category
  }));
}

/**
 * Extract M365 Group objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of M365 Group objects formatted for visualization
 */
export function extractM365Groups(data) {
  return data.M365Groups.map(group => ({
    id: group.id,
    name: group.DisplayName,
    type: 'm365-group',
    color: '#ff9800',
    icon: 'fa-people-group',
    email: group.Email,
    description: group.Description,
    owners: group.Owners,
    members: group.Members,
    connectedTeam: group.ConnectedTeam,
    connectedSite: group.ConnectedSite,
    migrated: group.Migrated
  }));
}

/**
 * Generate connections based on the relationships in the data
 * @param {Object} data - The migration data
 * @returns {Array} Array of connection objects
 */
export function generateConnections(data) {
  let connections = [];
  
  // Add security group membership connections
  data.SecurityGroups.forEach(group => {
    group.Members.forEach(userId => {
      connections.push({
        source: userId,
        target: group.id
      });
    });
  });
  
  // Add team membership connections
  data.Teams.forEach(team => {
    // Connect owners
    team.Owners.forEach(userId => {
      connections.push({
        source: userId,
        target: team.id
      });
    });
    
    // Connect regular members that are users
    team.Members.forEach(memberId => {
      // Skip if it's a security group (to avoid duplication)
      if (!memberId.startsWith('sg_')) {
        connections.push({
          source: memberId,
          target: team.id
        });
      }
    });
  });
  
  // Add SharePoint site connections
  data.SharePointSites.forEach(site => {
    // Connect owners
    site.Owners.forEach(userId => {
      connections.push({
        source: userId,
        target: site.id
      });
    });
    
    // Connect members
    if (site.Members) {
      site.Members.forEach(memberId => {
        if (!memberId.startsWith('sg_')) {
          connections.push({
            source: memberId,
            target: site.id
          });
        }
      });
    }
  });
  
  // Add OneDrive sharing connections
  data.OneDrives.forEach(onedrive => {
    // Connect owner
    connections.push({
      source: onedrive.OwnedBy,
      target: onedrive.id
    });
    
    // Connect shared users
    onedrive.SharedWith.forEach(userId => {
      connections.push({
        source: userId,
        target: onedrive.id
      });
    });
  });
  
  // Add mailbox delegate access connections
  data.Mailboxes.forEach(mailbox => {
    // Connect owner
    connections.push({
      source: mailbox.OwnedBy,
      target: mailbox.id
    });
    
    // Connect delegates
    if (mailbox.DelegateAccess) {
      mailbox.DelegateAccess.forEach(userId => {
        connections.push({
          source: userId,
          target: mailbox.id
        });
      });
    }
  });
  
  // Add M365 Group connections
  data.M365Groups.forEach(group => {
    // Connect owners
    group.Owners.forEach(userId => {
      connections.push({
        source: userId,
        target: group.id
      });
    });
    
    // Connect regular members that are users
    group.Members.forEach(memberId => {
      if (!memberId.startsWith('sg_')) {
        connections.push({
          source: memberId,
          target: group.id
        });
      }
    });
    
    // Connect to associated team if exists
    if (group.ConnectedTeam) {
      connections.push({
        source: group.id,
        target: group.ConnectedTeam
      });
    }
    
    // Connect to associated site if exists
    if (group.ConnectedSite) {
      connections.push({
        source: group.id,
        target: group.ConnectedSite
      });
    }
  });
  
  // Add Power Automate connections
  data.PowerAutomate.forEach(flow => {
    connections.push({
      source: flow.OwnedBy,
      target: flow.id
    });
    
    // Connect to SharePoint sites if specified
    if (flow.ConnectedSharePointSites) {
      flow.ConnectedSharePointSites.forEach(siteId => {
        connections.push({
          source: flow.id,
          target: siteId
        });
      });
    }
  });
  
  // Add Power Apps connections
  data.PowerApps.forEach(app => {
    connections.push({
      source: app.OwnedBy,
      target: app.id
    });
    
    // Connect to SharePoint sites if specified
    if (app.ConnectedSharePointSites) {
      app.ConnectedSharePointSites.forEach(siteId => {
        connections.push({
          source: app.id,
          target: siteId
        });
      });
    }
  });
  
  // Add Power BI connections
  data.PowerBI.forEach(report => {
    connections.push({
      source: report.OwnedBy,
      target: report.id
    });
    
    // Connect to SharePoint sites if specified
    if (report.ConnectedSharePointSites) {
      report.ConnectedSharePointSites.forEach(siteId => {
        connections.push({
          source: report.id,
          target: siteId
        });
      });
    }
  });
  
  return connections;
}

/**
 * Get all objects from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all objects for visualization
 */
export function getAllObjects(data) {
  return [
    ...extractUsers(data),
    ...extractSecurityGroups(data),
    ...extractTeams(data),
    ...extractSharePointSites(data),
    ...extractOneDrives(data),
    ...extractMailboxes(data),
    ...extractM365Groups(data),
    ...extractPowerAutomate(data),
    ...extractPowerApps(data),
    ...extractPowerBI(data)
  ];
}

/**
 * Get all connections from migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all connections for visualization
 */
export function getAllConnections(data) {
  return generateConnections(data);
}