/**
 * GoogleWorkspaceDataService - Service for Google Workspace migration data
 * Handles extraction and transformation of Google Workspace migration objects
 */
import { DataService } from './DataService.js';

export class GoogleWorkspaceDataService extends DataService {
  constructor() {
    super();
    
    // Define colors and icons for each object type
    this.objectConfig = {
      'google-user': { color: '#4285f4', icon: 'fab fa-google' },
      'google-group': { color: '#34a853', icon: 'fab fa-google' },
      'google-mailbox': { color: '#ea4335', icon: 'fa-envelope' },
      'google-shared-drive': { color: '#fbbc05', icon: 'fa-hdd' },
      'google-drive': { color: '#ff6d01', icon: 'fab fa-google-drive' },
      'entra-user': { color: '#64b5f6', icon: 'fa-user' },
      'entra-group': { color: '#7e57c2', icon: 'fa-users' },
      'exchange-online': { color: '#0078d4', icon: 'fa-envelope' },
      'sharepoint': { color: '#4caf50', icon: 'fa-folder' },
      'onedrive': { color: '#2196f3', icon: 'fa-folder-open' }
    };
  }
  
  /**
   * Load Google Workspace migration data
   * @param {string} url - The URL to load data from
   * @returns {Promise<Object>} The loaded Google Workspace data
   */
  async loadGoogleWorkspaceData(url) {
    return await this.loadData(url);
  }
  
  /**
   * Extract all objects from Google Workspace data
   * @param {Object} data - The Google Workspace migration data
   * @returns {Array} Array of all objects
   */
  extractAllObjects(data) {
    const objects = [
      ...this.extractGoogleUsers(data),
      ...this.extractGoogleGroups(data),
      ...this.extractGoogleMailboxes(data),
      ...this.extractGoogleSharedDrives(data),
      ...this.extractGoogleDrives(data)
    ];
    
    // Only add destination objects if they exist
    if (data.EntraUsers) {
      objects.push(...this.extractEntraUsers(data));
    }
    if (data.EntraGroups) {
      objects.push(...this.extractEntraGroups(data));
    }
    if (data.ExchangeMailboxes) {
      objects.push(...this.extractExchangeMailboxes(data));
    }
    if (data.SharePointSites) {
      objects.push(...this.extractSharePointSites(data));
    }
    if (data.OneDrives) {
      objects.push(...this.extractOneDrives(data));
    }
    
    return objects;
  }
  
  /**
   * Extract Google user objects
   */
  extractGoogleUsers(data) {
    return data.GoogleUsers.map(user => 
      this.transformObject(user, 'google-user', {
        ...this.objectConfig['google-user'],
        additionalProps: {
          email: user.Email,
          department: user.Department,
          title: user.Title,
          googleUsername: user.GoogleUsername,
          accountStatus: user.AccountStatus,
          twoFactorEnabled: user.TwoFactorEnabled,
          googleWorkspaceRole: user.GoogleWorkspaceRole
        }
      })
    );
  }
  
  /**
   * Extract Google group objects
   */
  extractGoogleGroups(data) {
    return data.GoogleGroups.map(group =>
      this.transformObject(group, 'google-group', {
        ...this.objectConfig['google-group'],
        additionalProps: {
          email: group.Email,
          description: group.Description,
          members: group.Members,
          groupType: group.GroupType,
          whoCanJoin: group.WhoCanJoin,
          whoCanViewMembership: group.WhoCanViewMembership
        }
      })
    );
  }
  
  /**
   * Extract Google mailbox objects
   */
  extractGoogleMailboxes(data) {
    return data.GoogleMailboxes.map(mailbox =>
      this.transformObject(mailbox, 'google-mailbox', {
        ...this.objectConfig['google-mailbox'],
        additionalProps: {
          email: mailbox.Email,
          owner: mailbox.Owner,
          storageUsed: mailbox.StorageUsed,
          storageQuota: mailbox.StorageQuota,
          messageCount: mailbox.MessageCount,
          imapEnabled: mailbox.IMAPEnabled,
          popEnabled: mailbox.POPEnabled,
          forwardingEnabled: mailbox.ForwardingEnabled,
          delegateAccess: mailbox.DelegateAccess
        }
      })
    );
  }
  
  /**
   * Extract Google shared drive objects
   */
  extractGoogleSharedDrives(data) {
    return data.GoogleSharedDrives.map(drive =>
      this.transformObject(drive, 'google-shared-drive', {
        ...this.objectConfig['google-shared-drive'],
        additionalProps: {
          description: drive.Description,
          storageUsed: drive.StorageUsed,
          fileCount: drive.FileCount,
          organizers: drive.Organizers,
          contentManagers: drive.ContentManagers,
          contributors: drive.Contributors,
          commenters: drive.Commenters,
          viewers: drive.Viewers,
          accessLevel: drive.AccessLevel
        }
      })
    );
  }
  
  /**
   * Extract Google Drive objects
   */
  extractGoogleDrives(data) {
    return data.GoogleDrives.map(drive =>
      this.transformObject(drive, 'google-drive', {
        ...this.objectConfig['google-drive'],
        additionalProps: {
          owner: drive.Owner,
          storageUsed: drive.StorageUsed,
          storageQuota: drive.StorageQuota,
          fileCount: drive.FileCount,
          sharedWith: drive.SharedWith,
          syncEnabled: drive.SyncEnabled,
          backupStatus: drive.BackupStatus
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
          migratedFromGoogle: user.MigratedFromGoogle,
          sourceGoogleUser: user.SourceGoogleUser
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
          email: group.Email,
          description: group.Description,
          members: group.Members,
          groupType: group.GroupType,
          migratedFromGoogle: group.MigratedFromGoogle,
          sourceGoogleGroup: group.SourceGoogleGroup
        }
      })
    );
  }
  
  /**
   * Extract Exchange Online mailbox objects
   */
  extractExchangeMailboxes(data) {
    return data.ExchangeMailboxes.map(mailbox =>
      this.transformObject(mailbox, 'exchange-online', {
        ...this.objectConfig['exchange-online'],
        additionalProps: {
          email: mailbox.Email,
          ownedBy: mailbox.OwnedBy,
          migratedFromGoogle: mailbox.MigratedFromGoogle,
          sourceGoogleMailbox: mailbox.SourceGoogleMailbox
        }
      })
    );
  }
  
  /**
   * Extract SharePoint site objects
   */
  extractSharePointSites(data) {
    return data.SharePointSites.map(site =>
      this.transformObject(site, 'sharepoint', {
        ...this.objectConfig['sharepoint'],
        additionalProps: {
          url: site.URL,
          description: site.Description,
          migratedFromGoogleDrive: site.MigratedFromGoogleDrive,
          sourceGoogleDrive: site.SourceGoogleDrive
        }
      })
    );
  }
  
  /**
   * Extract OneDrive objects
   */
  extractOneDrives(data) {
    return data.OneDrives.map(drive =>
      this.transformObject(drive, 'onedrive', {
        ...this.objectConfig['onedrive'],
        additionalProps: {
          ownedBy: drive.OwnedBy,
          migratedFromGoogleDrive: drive.MigratedFromGoogleDrive,
          sourceGoogleDrive: drive.SourceGoogleDrive
        }
      })
    );
  }
  
  /**
   * Generate connections from Google Workspace data
   * @param {Object} data - The Google Workspace migration data
   * @returns {Array} Array of connections
   */
  generateConnections(data) {
    let connections = [];
    
    // Google group memberships
    data.GoogleGroups.forEach(group => {
      group.Members.forEach(userId => {
        connections.push(this.createConnection(userId, group.id));
      });
    });
    
    // Google mailbox ownership
    data.GoogleMailboxes.forEach(mailbox => {
      connections.push(this.createConnection(mailbox.Owner, mailbox.id));
      
      if (mailbox.DelegateAccess) {
        mailbox.DelegateAccess.forEach(userId => {
          connections.push(this.createConnection(userId, mailbox.id));
        });
      }
    });
    
    // Google shared drive permissions
    data.GoogleSharedDrives.forEach(drive => {
      // Connect organizers
      drive.Organizers.forEach(userId => {
        connections.push(this.createConnection(userId, drive.id));
      });
      
      // Connect content managers
      drive.ContentManagers.forEach(userId => {
        connections.push(this.createConnection(userId, drive.id));
      });
      
      // Connect contributors
      drive.Contributors.forEach(userId => {
        connections.push(this.createConnection(userId, drive.id));
      });
      
      // Connect commenters
      drive.Commenters.forEach(userId => {
        connections.push(this.createConnection(userId, drive.id));
      });
      
      // Connect viewers (can be groups)
      drive.Viewers.forEach(viewerId => {
        connections.push(this.createConnection(viewerId, drive.id));
      });
    });
    
    // Google Drive ownership and sharing
    data.GoogleDrives.forEach(drive => {
      connections.push(this.createConnection(drive.Owner, drive.id));
      
      drive.SharedWith.forEach(sharedId => {
        connections.push(this.createConnection(sharedId, drive.id));
      });
    });
    
    // Only add migration connections if destination objects exist
    if (data.EntraUsers) {
      data.EntraUsers.forEach(user => {
        if (user.MigratedFromGoogle && user.SourceGoogleUser) {
          connections.push(this.createConnection(user.SourceGoogleUser, user.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
      });
    }
    
    if (data.EntraGroups) {
      data.EntraGroups.forEach(group => {
        if (group.MigratedFromGoogle && group.SourceGoogleGroup) {
          connections.push(this.createConnection(group.SourceGoogleGroup, group.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
        
        // Group memberships
        group.Members.forEach(userId => {
          connections.push(this.createConnection(userId, group.id));
        });
      });
    }
    
    if (data.ExchangeMailboxes) {
      data.ExchangeMailboxes.forEach(mailbox => {
        if (mailbox.MigratedFromGoogle && mailbox.SourceGoogleMailbox) {
          connections.push(this.createConnection(mailbox.SourceGoogleMailbox, mailbox.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
        
        // Mailbox ownership
        connections.push(this.createConnection(mailbox.OwnedBy, mailbox.id));
      });
    }
    
    if (data.SharePointSites) {
      data.SharePointSites.forEach(site => {
        if (site.MigratedFromGoogleDrive && site.SourceGoogleDrive) {
          connections.push(this.createConnection(site.SourceGoogleDrive, site.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
      });
    }
    
    if (data.OneDrives) {
      data.OneDrives.forEach(drive => {
        if (drive.MigratedFromGoogleDrive && drive.SourceGoogleDrive) {
          connections.push(this.createConnection(drive.SourceGoogleDrive, drive.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
        
        // OneDrive ownership
        connections.push(this.createConnection(drive.OwnedBy, drive.id));
      });
    }
    
    return connections;
  }
}
