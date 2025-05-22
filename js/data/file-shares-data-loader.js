/**
 * File Shares Data loader for Migration Visualizer
 * Loads data from JSON file and formats it for file shares migration visualization
 */

/**
 * Load file shares migration data from JSON file
 * @returns {Promise<Object>} The loaded migration data
 */
export async function loadFileSharesData() {
  try {
    const response = await fetch('data/file-shares-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load file shares data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading file shares data:', error);
    throw error;
  }
}

/**
 * Extract user objects from file shares data (AD Users)
 * @param {Object} data - The migration data
 * @returns {Array} Array of user objects formatted for visualization
 */
export function extractADUsers(data) {
  return data.Users.map(user => ({
    id: user.id,
    name: user.DisplayName,
    type: 'user',
    color: '#64b5f6',
    icon: 'fa-user',
    department: user.Department,
    email: user.Email,
    title: user.Title,
    samAccountName: user.SamAccountName,
    domain: user.Domain,
    accountStatus: user.AccountStatus
  }));
}

/**
 * Extract security group objects from file shares data (AD Security Groups)
 * @param {Object} data - The migration data
 * @returns {Array} Array of security group objects formatted for visualization
 */
export function extractADSecurityGroups(data) {
  return data.SecurityGroups.map(group => ({
    id: group.id,
    name: group.DisplayName,
    type: 'group',
    color: '#7e57c2',
    icon: 'fa-users',
    description: group.Description,
    members: group.Members,
    samAccountName: group.SamAccountName,
    domain: group.Domain,
    groupType: group.GroupType,
    groupScope: group.GroupScope
  }));
}

/**
 * Extract file share objects from file shares data
 * @param {Object} data - The migration data
 * @returns {Array} Array of file share objects formatted for visualization
 */
export function extractFileShares(data) {
  return data.FileShares.map(share => ({
    id: share.id,
    name: share.DisplayName,
    type: 'file-share',
    color: '#795548',
    icon: 'fa-folder',
    description: share.Description,
    uncPath: share.UNCPath,
    shareName: share.ShareName,
    server: share.Server,
    storageUsed: share.StorageUsed,
    fileCount: share.FileCount,
    permissions: share.Permissions,
    shareType: share.ShareType,
    backupStatus: share.BackupStatus
  }));
}

/**
 * Generate connections based on the relationships in the file shares data
 * @param {Object} data - The migration data
 * @returns {Array} Array of connection objects
 */
export function generateFileSharesConnections(data) {
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
  
  // Add file share permissions connections
  data.FileShares.forEach(share => {
    share.Permissions.forEach(permission => {
      connections.push({
        source: permission.Principal,
        target: share.id
      });
    });
  });
  
  return connections;
}

/**
 * Get all objects from file shares migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all objects for visualization
 */
export function getAllFileSharesObjects(data) {
  return [
    ...extractADUsers(data),
    ...extractADSecurityGroups(data),
    ...extractFileShares(data)
  ];
}

/**
 * Get all connections from file shares migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all connections for visualization
 */
export function getAllFileSharesConnections(data) {
  return generateFileSharesConnections(data);
}