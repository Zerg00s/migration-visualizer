/**
 * Google Workspace Data loader for Migration Visualizer
 * Loads data from JSON file and formats it for Google Workspace migration visualization
 */

/**
 * Load Google Workspace migration data from JSON file
 * @returns {Promise<Object>} The loaded migration data
 */
export async function loadGoogleWorkspaceData() {
  try {
    const response = await fetch('data/google-workspace-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load Google Workspace data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading Google Workspace data:', error);
    throw error;
  }
}

/**
 * Extract Google user objects from Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Google user objects formatted for visualization
 */
export function extractGoogleUsers(data) {
  return data.GoogleUsers.map(user => ({
    id: user.id,
    name: user.DisplayName,
    type: 'google-user',
    color: '#4285f4',
    icon: 'fab fa-google',
    department: user.Department,
    email: user.Email,
    title: user.Title,
    googleUsername: user.GoogleUsername,
    accountStatus: user.AccountStatus,
    twoFactorEnabled: user.TwoFactorEnabled,
    googleWorkspaceRole: user.GoogleWorkspaceRole
  }));
}

/**
 * Extract Google group objects from Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Google group objects formatted for visualization
 */
export function extractGoogleGroups(data) {
  return data.GoogleGroups.map(group => ({
    id: group.id,
    name: group.DisplayName,
    type: 'google-group',
    color: '#34a853',
    icon: 'fab fa-google',
    description: group.Description,
    email: group.Email,
    members: group.Members,
    groupType: group.GroupType,
    whoCanJoin: group.WhoCanJoin,
    whoCanViewMembership: group.WhoCanViewMembership
  }));
}

/**
 * Extract Google mailbox objects from Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Google mailbox objects formatted for visualization
 */
export function extractGoogleMailboxes(data) {
  return data.GoogleMailboxes.map(mailbox => ({
    id: mailbox.id,
    name: mailbox.DisplayName,
    type: 'google-mailbox',
    color: '#ea4335',
    icon: 'fas fa-envelope',
    email: mailbox.Email,
    owner: mailbox.Owner,
    storageUsed: mailbox.StorageUsed,
    storageQuota: mailbox.StorageQuota,
    messageCount: mailbox.MessageCount,
    imapEnabled: mailbox.IMAPEnabled,
    popEnabled: mailbox.POPEnabled,
    forwardingEnabled: mailbox.ForwardingEnabled,
    delegateAccess: mailbox.DelegateAccess
  }));
}

/**
 * Extract Google Shared Drive objects from Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Google Shared Drive objects formatted for visualization
 */
export function extractGoogleSharedDrives(data) {
  return data.GoogleSharedDrives.map(drive => ({
    id: drive.id,
    name: drive.DisplayName,
    type: 'google-shared-drive',
    color: '#fbbc05',
    icon: 'fas fa-hdd',
    description: drive.Description,
    storageUsed: drive.StorageUsed,
    fileCount: drive.FileCount,
    organizers: drive.Organizers,
    contentManagers: drive.ContentManagers,
    contributors: drive.Contributors,
    commenters: drive.Commenters,
    viewers: drive.Viewers,
    accessLevel: drive.AccessLevel
  }));
}

/**
 * Extract Google Drive objects from Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of Google Drive objects formatted for visualization
 */
export function extractGoogleDrives(data) {
  return data.GoogleDrives.map(drive => ({
    id: drive.id,
    name: drive.DisplayName,
    type: 'google-drive',
    color: '#ff6d01',
    icon: 'fab fa-google-drive',
    owner: drive.Owner,
    storageUsed: drive.StorageUsed,
    storageQuota: drive.StorageQuota,
    fileCount: drive.FileCount,
    sharedWith: drive.SharedWith,
    syncEnabled: drive.SyncEnabled,
    backupStatus: drive.BackupStatus
  }));
}

/**
 * Generate connections based on the relationships in the Google Workspace data
 * @param {Object} data - The migration data
 * @returns {Array} Array of connection objects
 */
export function generateGoogleWorkspaceConnections(data) {
  let connections = [];
  
  // Add Google group membership connections
  data.GoogleGroups.forEach(group => {
    group.Members.forEach(userId => {
      connections.push({
        source: userId,
        target: group.id
      });
    });
  });
  
  // Add Google mailbox ownership connections
  data.GoogleMailboxes.forEach(mailbox => {
    connections.push({
      source: mailbox.Owner,
      target: mailbox.id
    });
    
    // Add delegate access connections
    if (mailbox.DelegateAccess) {
      mailbox.DelegateAccess.forEach(userId => {
        connections.push({
          source: userId,
          target: mailbox.id
        });
      });
    }
  });
  
  // Add Google Shared Drive permissions connections
  data.GoogleSharedDrives.forEach(drive => {
    // Connect organizers
    drive.Organizers.forEach(userId => {
      connections.push({
        source: userId,
        target: drive.id
      });
    });
    
    // Connect content managers
    drive.ContentManagers.forEach(userId => {
      connections.push({
        source: userId,
        target: drive.id
      });
    });
    
    // Connect contributors
    drive.Contributors.forEach(userId => {
      connections.push({
        source: userId,
        target: drive.id
      });
    });
    
    // Connect commenters
    drive.Commenters.forEach(userId => {
      connections.push({
        source: userId,
        target: drive.id
      });
    });
    
    // Connect viewers (can be groups)
    drive.Viewers.forEach(viewerId => {
      connections.push({
        source: viewerId,
        target: drive.id
      });
    });
  });
  
  // Add Google Drive sharing connections
  data.GoogleDrives.forEach(drive => {
    // Connect owner
    connections.push({
      source: drive.Owner,
      target: drive.id
    });
    
    // Connect shared users/groups
    drive.SharedWith.forEach(sharedId => {
      connections.push({
        source: sharedId,
        target: drive.id
      });
    });
  });
  
  return connections;
}

/**
 * Get all objects from Google Workspace migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all objects for visualization
 */
export function getAllGoogleWorkspaceObjects(data) {
  return [
    ...extractGoogleUsers(data),
    ...extractGoogleGroups(data),
    ...extractGoogleMailboxes(data),
    ...extractGoogleSharedDrives(data),
    ...extractGoogleDrives(data)
  ];
}

/**
 * Get all connections from Google Workspace migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all connections for visualization
 */
export function getAllGoogleWorkspaceConnections(data) {
  return generateGoogleWorkspaceConnections(data);
}