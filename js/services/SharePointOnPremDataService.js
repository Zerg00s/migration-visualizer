/**
 * SharePointOnPremDataService - Service for SharePoint on-premises migration data
 * Handles extraction and transformation of SharePoint on-prem migration objects
 */
import { DataService } from './DataService.js';

export class SharePointOnPremDataService extends DataService {
  constructor() {
    super();
    
    // Define colors and icons for each object type
    this.objectConfig = {
      'sharepoint-site': { color: '#2e7d32', icon: 'fa-server' },
      'infopath-form': { color: '#607d8b', icon: 'fa-file-alt' },
      'workflow': { color: '#9c27b0', icon: 'fa-project-diagram' },
      'user': { color: '#1565c0', icon: 'fa-user' },
      'group': { color: '#7b1fa2', icon: 'fa-users' },
      'sharepoint-online': { color: '#4caf50', icon: 'fa-cloud' },
      'power-apps': { color: '#742774', icon: 'fa-mobile-alt' },
      'power-automate': { color: '#0066ff', icon: 'fa-bolt' },
      'entra-user': { color: '#64b5f6', icon: 'fa-user' },
      'entra-group': { color: '#7e57c2', icon: 'fa-users' }
    };
  }
  
  /**
   * Load SharePoint on-prem migration data
   * @param {string} url - The URL to load data from
   * @returns {Promise<Object>} The loaded SharePoint on-prem data
   */
  async loadSharePointOnPremData(url) {
    return await this.loadData(url);
  }
  
  /**
   * Extract all objects from SharePoint on-prem data
   * @param {Object} data - The SharePoint on-prem migration data
   * @returns {Array} Array of all objects
   */
  extractAllObjects(data) {
    const objects = [
      ...this.extractSharePointSites(data),
      ...this.extractInfoPathForms(data),
      ...this.extractWorkflows(data),
      ...this.extractUsers(data),
      ...this.extractSecurityGroups(data)
    ];
    
    // Only add destination objects if they exist
    if (data.SharePointOnlineSites) {
      objects.push(...this.extractSharePointOnlineSites(data));
    }
    if (data.PowerApps) {
      objects.push(...this.extractPowerApps(data));
    }
    if (data.PowerAutomate) {
      objects.push(...this.extractPowerAutomate(data));
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
   * Extract SharePoint on-prem site objects
   */
  extractSharePointSites(data) {
    return data.SharePointSites.map(site => 
      this.transformObject(site, 'sharepoint-site', {
        ...this.objectConfig['sharepoint-site'],
        additionalProps: {
          url: site.URL,
          server: site.Server,
          templateType: site.TemplateType,
          webApplication: site.WebApplication,
          contentDatabase: site.ContentDatabase,
          owners: site.Owners,
          members: site.Members,
          visitors: site.Visitors,
          storageUsed: site.StorageUsed,
          listCount: site.ListCount,
          pageViews: site.PageViews,
          sharePointVersion: site.SharePointVersion
        }
      })
    );
  }
  
  /**
   * Extract InfoPath form objects
   */
  extractInfoPathForms(data) {
    return data.InfoPathForms.map(form =>
      this.transformObject(form, 'infopath-form', {
        ...this.objectConfig['infopath-form'],
        additionalProps: {
          formTemplate: form.FormTemplate,
          connectedSite: form.ConnectedSite,
          formLibrary: form.FormLibrary,
          createdBy: form.CreatedBy,
          formVersion: form.FormVersion,
          dataConnections: form.DataConnections,
          submissionCount: form.SubmissionCount,
          status: form.Status,
          browserEnabled: form.BrowserEnabled
        }
      })
    );
  }
  
  /**
   * Extract workflow objects
   */
  extractWorkflows(data) {
    return data.Workflows.map(workflow =>
      this.transformObject(workflow, 'workflow', {
        ...this.objectConfig['workflow'],
        additionalProps: {
          workflowType: workflow.WorkflowType,
          connectedSite: workflow.ConnectedSite,
          associatedList: workflow.AssociatedList,
          createdBy: workflow.CreatedBy,
          workflowVersion: workflow.WorkflowVersion,
          status: workflow.Status,
          instancesRunning: workflow.InstancesRunning,
          instancesCompleted: workflow.InstancesCompleted,
          instancesError: workflow.InstancesError,
          approvalSteps: workflow.ApprovalSteps
        }
      })
    );
  }
  
  /**
   * Extract user objects
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
   * Extract SharePoint Online site objects
   */
  extractSharePointOnlineSites(data) {
    return data.SharePointOnlineSites.map(site =>
      this.transformObject(site, 'sharepoint-online', {
        ...this.objectConfig['sharepoint-online'],
        additionalProps: {
          url: site.URL,
          description: site.Description,
          migratedFromOnPrem: site.MigratedFromOnPrem,
          sourceOnPremSite: site.SourceOnPremSite
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
          convertedFromInfoPath: app.ConvertedFromInfoPath,
          sourceInfoPathForm: app.SourceInfoPathForm,
          environment: app.Environment
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
          convertedFromWorkflow: flow.ConvertedFromWorkflow,
          sourceWorkflow: flow.SourceWorkflow,
          environment: flow.Environment
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
   * Generate connections from SharePoint on-prem data
   * @param {Object} data - The SharePoint on-prem migration data
   * @returns {Array} Array of connections
   */
  generateConnections(data) {
    let connections = [];
    
    // SharePoint site permissions
    data.SharePointSites.forEach(site => {
      // Connect owners
      site.Owners.forEach(userId => {
        connections.push(this.createConnection(userId, site.id));
      });
      
      // Connect members (can be groups)
      site.Members.forEach(memberId => {
        connections.push(this.createConnection(memberId, site.id));
      });
      
      // Connect visitors (can be groups)
      site.Visitors.forEach(visitorId => {
        connections.push(this.createConnection(visitorId, site.id));
      });
    });
    
    // InfoPath form connections
    data.InfoPathForms.forEach(form => {
      connections.push(this.createConnection(form.ConnectedSite, form.id));
      connections.push(this.createConnection(form.CreatedBy, form.id));
    });
    
    // Workflow connections
    data.Workflows.forEach(workflow => {
      connections.push(this.createConnection(workflow.ConnectedSite, workflow.id));
      connections.push(this.createConnection(workflow.CreatedBy, workflow.id));
    });
    
    // Security group memberships
    data.SecurityGroups.forEach(group => {
      group.Members.forEach(userId => {
        connections.push(this.createConnection(userId, group.id));
      });
    });
    
    // Only add destination connections if objects exist
    if (data.SharePointOnlineSites) {
      data.SharePointOnlineSites.forEach(site => {
        if (site.MigratedFromOnPrem && site.SourceOnPremSite) {
          connections.push(this.createConnection(site.SourceOnPremSite, site.id, {
            connectionType: 'migration',
            crossEnvironment: true
          }));
        }
      });
    }
    
    if (data.PowerApps) {
      data.PowerApps.forEach(app => {
        if (app.ConvertedFromInfoPath && app.SourceInfoPathForm) {
          connections.push(this.createConnection(app.SourceInfoPathForm, app.id, {
            connectionType: 'conversion',
            crossEnvironment: true
          }));
        }
      });
    }
    
    if (data.PowerAutomate) {
      data.PowerAutomate.forEach(flow => {
        if (flow.ConvertedFromWorkflow && flow.SourceWorkflow) {
          connections.push(this.createConnection(flow.SourceWorkflow, flow.id, {
            connectionType: 'conversion',
            crossEnvironment: true
          }));
        }
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
