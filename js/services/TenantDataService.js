/**
 * TenantDataService - Service for tenant-to-tenant migration data
 * Handles extraction and transformation of tenant migration objects
 */
import { DataService } from './DataService.js';

export class TenantDataService extends DataService {
  constructor() {
    super();
    
    // Define colors and icons for each object type
    this.objectConfig = {
      user: { color: '#64b5f6', icon: 'fa-user' },
      group: { color: '#7e57c2', icon: 'fa-users' },
      teams: { color: '#673ab7', icon: 'fa-people-group' },
      sharepoint: { color: '#4caf50', icon: 'fa-folder' },
      onedrive: { color: '#2196f3', icon: 'fa-folder-open' },
      mailbox: { color: '#e91e63', icon: 'fa-envelope' },
      'm365-group': { color: '#ff9800', icon: 'fa-people-group' },
      'power-automate': { color: '#0066ff', icon: 'fa-bolt' },
      'power-apps': { color: '#742774', icon: 'fa-mobile-alt' },
      'power-bi': { color: '#f2c811', icon: 'fa-chart-bar' }
    };
  }
  
  /**
   * Load tenant migration data
   * @param {string} url - The URL to load data from
   * @returns {Promise<Object>} The loaded tenant data
   */
  async loadTenantData(url) {
    return await this.loadData(url);
  }
  
  /**
   * Extract all objects from tenant data
   * @param {Object} data - The tenant migration data
   * @returns {Array} Array of all objects
   */
  extractAllObjects(data) {
    return [
      ...this.extractUsers(data),
      ...this.extractSecurityGroups(data),
      ...this.extractTeams(data),
      ...this.extractSharePointSites(data),
      ...this.extractOneDrives(data),
      ...this.extractMailboxes(data),
      ...this.extractM365Groups(data),
      ...this.extractPowerAutomate(data),
      ...this.extractPowerApps(data),
      ...this.extractPowerBI(data)
    ];
  }
  
  /**
   * Extract user objects
   */
  extractUsers(data) {
    return data.Users.map(user => 
      this.transformObject(user, 'user', {
        ...this.objectConfig.user,
        additionalProps: {
          department: user.Department,
          email: user.Email,
          title: user.Title,
          disabled: user.Disabled
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
        ...this.objectConfig.group,
        additionalProps: {
          description: group.Description,
          members: group.Members,
          classification: group.Classification
        }
      })
    );
  }
  
  /**
   * Extract team objects
   */
  extractTeams(data) {
    return data.Teams.map(team =>
      this.transformObject(team, 'teams', {
        ...this.objectConfig.teams,
        additionalProps: {
          description: team.Description,
          owners: team.Owners,
          members: team.Members,
          readOnly: team.ReadOnly
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
        ...this.objectConfig.sharepoint,
        additionalProps: {
          description: site.Description,
          url: site.URL,
          owners: site.Owners,
          members: site.Members,
          visitors: site.Visitors,
          readOnly: site.ReadOnly
        }
      })
    );
  }
  
  /**
   * Extract OneDrive objects
   */
  extractOneDrives(data) {
    return data.OneDrives.map(onedrive =>
      this.transformObject(onedrive, 'onedrive', {
        ...this.objectConfig.onedrive,
        additionalProps: {
          ownedBy: onedrive.OwnedBy,
          sharedWith: onedrive.SharedWith,
          migrated: onedrive.Migrated
        }
      })
    );
  }
  
  /**
   * Extract mailbox objects
   */
  extractMailboxes(data) {
    return data.Mailboxes.map(mailbox =>
      this.transformObject(mailbox, 'mailbox', {
        ...this.objectConfig.mailbox,
        additionalProps: {
          email: mailbox.Email,
          ownedBy: mailbox.OwnedBy,
          delegateAccess: mailbox.DelegateAccess,
          migrated: mailbox.Migrated
        }
      })
    );
  }
  
  /**
   * Extract M365 Group objects
   */
  extractM365Groups(data) {
    return data.M365Groups.map(group =>
      this.transformObject(group, 'm365-group', {
        ...this.objectConfig['m365-group'],
        additionalProps: {
          email: group.Email,
          description: group.Description,
          owners: group.Owners,
          members: group.Members,
          connectedTeam: group.ConnectedTeam,
          connectedSite: group.ConnectedSite,
          migrated: group.Migrated
        }
      })
    );
  }
  
  /**
   * Extract Power Automate objects
   */
  extractPowerAutomate(data) {
    return data.PowerAutomate.map(flow =>
      this.transformObject(flow, 'power-automate', {
        ...this.objectConfig['power-automate'],
        additionalProps: {
          description: flow.Description,
          ownedBy: flow.OwnedBy,
          state: flow.State,
          runs: flow.Runs,
          triggerType: flow.TriggerType,
          category: flow.Category,
          connectedSharePointSites: flow.ConnectedSharePointSites
        }
      })
    );
  }
  
  /**
   * Extract Power Apps objects
   */
  extractPowerApps(data) {
    return data.PowerApps.map(app =>
      this.transformObject(app, 'power-apps', {
        ...this.objectConfig['power-apps'],
        additionalProps: {
          description: app.Description,
          ownedBy: app.OwnedBy,
          appType: app.AppType,
          users: app.Users,
          category: app.Category,
          connectedSharePointSites: app.ConnectedSharePointSites
        }
      })
    );
  }
  
  /**
   * Extract Power BI objects
   */
  extractPowerBI(data) {
    return data.PowerBI.map(report =>
      this.transformObject(report, 'power-bi', {
        ...this.objectConfig['power-bi'],
        additionalProps: {
          description: report.Description,
          ownedBy: report.OwnedBy,
          workspaceName: report.WorkspaceName,
          viewers: report.Viewers,
          category: report.Category,
          connectedSharePointSites: report.ConnectedSharePointSites
        }
      })
    );
  }
  
  /**
   * Generate connections from tenant data
   * @param {Object} data - The tenant migration data
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
    
    // Team memberships
    data.Teams.forEach(team => {
      team.Owners.forEach(userId => {
        connections.push(this.createConnection(userId, team.id));
      });
      
      team.Members.forEach(memberId => {
        if (!memberId.startsWith('sg_')) {
          connections.push(this.createConnection(memberId, team.id));
        }
      });
    });
    
    // SharePoint site connections
    data.SharePointSites.forEach(site => {
      site.Owners.forEach(userId => {
        connections.push(this.createConnection(userId, site.id));
      });
      
      if (site.Members) {
        site.Members.forEach(memberId => {
          if (!memberId.startsWith('sg_')) {
            connections.push(this.createConnection(memberId, site.id));
          }
        });
      }
    });
    
    // OneDrive connections
    data.OneDrives.forEach(onedrive => {
      connections.push(this.createConnection(onedrive.OwnedBy, onedrive.id));
      
      onedrive.SharedWith.forEach(userId => {
        connections.push(this.createConnection(userId, onedrive.id));
      });
    });
    
    // Mailbox connections
    data.Mailboxes.forEach(mailbox => {
      connections.push(this.createConnection(mailbox.OwnedBy, mailbox.id));
      
      if (mailbox.DelegateAccess) {
        mailbox.DelegateAccess.forEach(userId => {
          connections.push(this.createConnection(userId, mailbox.id));
        });
      }
    });
    
    // M365 Group connections
    data.M365Groups.forEach(group => {
      group.Owners.forEach(userId => {
        connections.push(this.createConnection(userId, group.id));
      });
      
      group.Members.forEach(memberId => {
        if (!memberId.startsWith('sg_')) {
          connections.push(this.createConnection(memberId, group.id));
        }
      });
      
      if (group.ConnectedTeam) {
        connections.push(this.createConnection(group.id, group.ConnectedTeam));
      }
      
      if (group.ConnectedSite) {
        connections.push(this.createConnection(group.id, group.ConnectedSite));
      }
    });
    
    // Power Platform connections
    this.addPowerPlatformConnections(data.PowerAutomate, connections);
    this.addPowerPlatformConnections(data.PowerApps, connections);
    this.addPowerPlatformConnections(data.PowerBI, connections);
    
    return connections;
  }
  
  /**
   * Add Power Platform connections
   */
  addPowerPlatformConnections(items, connections) {
    items.forEach(item => {
      connections.push(this.createConnection(item.OwnedBy, item.id));
      
      if (item.ConnectedSharePointSites) {
        item.ConnectedSharePointSites.forEach(siteId => {
          connections.push(this.createConnection(item.id, siteId));
        });
      }
    });
  }
}
