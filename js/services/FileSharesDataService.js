/**
 * FileSharesDataService - Service for file shares migration data
 * Handles extraction and transformation of file shares migration objects
 */
import { DataService } from './DataService.js';

export class FileSharesDataService extends DataService {
  constructor() {
    super();
    
    // Define colors and icons for each object type
    this.objectConfig = {
      'user': { color: '#64b5f6', icon: 'fa-user' },
      'group': { color: '#7e57c2', icon: 'fa-users' },
      'file-share': { color: '#795548', icon: 'fa-folder' },
      'sharepoint-site': { color: '#4caf50', icon: 'fa-folder' },
      'entra-user': { color: '#64b5f6', icon: 'fa-user' },
      'entra-group': { color: '#7e57c2', icon: 'fa-users' }
    };
  }
  
  /**
   * Load file shares migration data
   * @param {string} url - The URL to load data from
   * @returns {Promise<Object>} The loaded file shares data
   */
  async loadFileSharesData(url) {
    return await this.loadData(url);
  }
  
  /**
   * Extract all objects from file shares data
   * @param {Object} data - The file shares migration data
   * @returns {Array} Array of all objects
   */
  extractAllObjects(data) {
    const objects = [
      ...this.extractUsers(data),
      ...this.extractSecurityGroups(data),
      ...this.extractFileShares(data)
    ];
    
    // Only add destination objects if they exist
    if (data.SharePointSites) {
      objects.push(...this.extractSharePointSites(data));
    }
    if (data.EntraUsers) {
      objects.push(...this.extractEntraUsers(data));
    }
    if (data.EntraGroups) {
      objects.push(...this.extractEntraGroups(data));
    }
    
    return objects;
  }
  
  /**
   * Extract user objects (AD Users)
   */
  extractUsers(data) {
    return data.Users.map(user => 
      this.transformObject(user, 'user', {
        ...this.objectConfig['user'],
        additionalProps: {
          email: user.Email,
          department: user.Department,
          title: user.Title,
          samAccountName: user.SamAccountName,
          domain: user.Domain,
          accountStatus: user.AccountStatus
        }
      })
    );
  }
  
  /**
   * Extract security group objects
   */
  extractSecurityGroups(data) {
    return data.SecurityGroups.map(group =>
      this.transformObject(group, 'group', {
        ...this.objectConfig['group'],
        additionalProps: {
          description: group.Description,
          members: group.Members,
          samAccountName: group.SamAccountName,
          domain: group.Domain,
          groupType: group.GroupType,
          groupScope: group.GroupScope
        }
      })
    );
  }
  
  /**
   * Extract file share objects
   */
  extractFileShares(data) {
    return data.FileShares.map(share => 
      this.transformObject(share, 'file-share', {
        ...this.objectConfig['file-share'],
        additionalProps: {
          description: share.Description,
          uncPath: share.UNCPath,
          shareName: share.ShareName,
          server: share.Server,
          storageUsed: share.StorageUsed,
          fileCount: share.FileCount,
          permissions: share.Permissions,
          shareType: share.ShareType,
          backupStatus: share.BackupStatus
        }
      })
    );
  }
  
  /**
   * Extract SharePoint site objects
   */
  extractSharePointSites(data) {
    return data.SharePointSites.map(site =>
      this.transformObject(site, 'sharepoint-site', {
        ...this.objectConfig['sharepoint-site'],
        additionalProps: {
          url: site.URL,
          description: site.Description,
          department: site.Department,
          permissions: site.Permissions
        }
      })
    );
  }
  
  /**
   * Extract Entra ID user objects
   */
  extractEntraUsers(data) {
    return data.EntraUsers.map(user =>
      this.transformObject(user, 'entra-user', {
        ...this.objectConfig['entra-user'],
        additionalProps: {
          email: user.Email,
          department: user.Department,
          title: user.Title,
          syncedFromAD: user.SyncedFromAD,
          sourceADUser: user.SourceADUser
        }
      })
    );
  }
  
  /**
   * Extract Entra ID group objects
   */
  extractEntraGroups(data) {
    return data.EntraGroups.map(group =>
      this.transformObject(group, 'entra-group', {
        ...this.objectConfig['entra-group'],
        additionalProps: {
          description: group.Description,
          members: group.Members,
          groupType: group.GroupType,
          syncedFromAD: group.SyncedFromAD,
          sourceADGroup: group.SourceADGroup
        }
      })
    );
  }
  
  /**
   * Generate connections from file shares data
   * @param {Object} data - The file shares migration data
   * @returns {Array} Array of connections
   */
  generateConnections(data) {
    let connections = [];
    
    // Security group memberships
    data.SecurityGroups.forEach(group => {
      group.Members.forEach(userId => {
        connections.push(this.createConnection(userId, group.id));
      });
    });
    
    // File share permissions connections
    data.FileShares.forEach(share => {
      share.Permissions.forEach(permission => {
        connections.push(this.createConnection(permission.Principal, share.id));
      });
    });
    
    // Only add destination connections if objects exist
    if (data.SharePointSites) {
      data.SharePointSites.forEach(site => {
        site.Permissions.forEach(permission => {
          connections.push(this.createConnection(permission.Id, site.id));
        });
      });
    }
    
    if (data.EntraUsers) {
      data.EntraUsers.forEach(user => {
        if (user.SyncedFromAD && user.SourceADUser) {
          connections.push(this.createConnection(user.SourceADUser, user.id, {
            connectionType: 'sync',
            crossEnvironment: true
          }));
        }
      });
    }
    
    if (data.EntraGroups) {
      data.EntraGroups.forEach(group => {
        if (group.SyncedFromAD && group.SourceADGroup) {
          connections.push(this.createConnection(group.SourceADGroup, group.id, {
            connectionType: 'sync',
            crossEnvironment: true
          }));
        }
        
        // Group memberships
        group.Members.forEach(userId => {
          connections.push(this.createConnection(userId, group.id));
        });
      });
    }
    
    return connections;
  }
}
