/**
 * Tenant-to-Tenant Migration Visualizer
 * Consolidated visualizer for M365 tenant-to-tenant migrations
 */
import { BaseVisualizer } from '../core/base-visualizer.js';
import { createFlyingAnimation } from '../visualizer/animations.js';

// Data Service for Tenant-to-Tenant
class TenantDataService {
  async loadTenantData(dataFile) {
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading tenant data:', error);
      throw error;
    }
  }

  extractAllObjects(data) {
    const objects = [];
    
    // Add users (note: JSON uses 'Users', not 'users')
    if (data.Users) {
      objects.push(...data.Users.map(user => ({
        ...user,
        name: user.DisplayName, // Map DisplayName to name
        type: 'user',
        icon: 'fa-user',
        color: '#64b5f6'
      })));
    }
    
    // Add groups (note: JSON uses 'SecurityGroups', not 'groups')
    if (data.SecurityGroups) {
      objects.push(...data.SecurityGroups.map(group => ({
        ...group,
        name: group.DisplayName, // Map DisplayName to name
        type: 'group',
        icon: 'fa-users',
        color: '#7e57c2'
      })));
    }
    
    // Add M365 groups
    if (data.M365Groups) {
      objects.push(...data.M365Groups.map(group => ({
        ...group,
        name: group.DisplayName, // Map DisplayName to name
        type: 'm365-group',
        icon: 'fa-users-cog',
        color: '#ff9800'
      })));
    }
    
    // Add SharePoint sites
    if (data.SharePointSites) {
      objects.push(...data.SharePointSites.map(site => ({
        ...site,
        name: site.DisplayName, // Map DisplayName to name
        type: 'sharepoint',
        icon: 'fa-share-alt',
        color: '#4caf50'
      })));
    }
    
    // Add Teams
    if (data.Teams) {
      objects.push(...data.Teams.map(team => ({
        ...team,
        name: team.DisplayName, // Map DisplayName to name
        type: 'teams',
        icon: 'fa-comments',
        color: '#673ab7'
      })));
    }
    
    // Add OneDrive
    if (data.OneDrives) {
      objects.push(...data.OneDrives.map(drive => ({
        ...drive,
        name: drive.DisplayName, // Map DisplayName to name
        type: 'onedrive',
        icon: 'fa-cloud',
        color: '#2196f3'
      })));
    }
    
    // Add Mailboxes
    if (data.Mailboxes) {
      objects.push(...data.Mailboxes.map(mailbox => ({
        ...mailbox,
        name: mailbox.DisplayName, // Map DisplayName to name
        type: 'mailbox',
        icon: 'fa-envelope',
        color: '#e91e63'
      })));
    }
    
    // Add Power Automate
    if (data.PowerAutomate) {
      objects.push(...data.PowerAutomate.map(flow => ({
        ...flow,
        name: flow.DisplayName, // Map DisplayName to name
        type: 'power-automate',
        icon: 'fa-bolt',
        color: '#0066ff'
      })));
    }
    
    // Add Power Apps
    if (data.PowerApps) {
      objects.push(...data.PowerApps.map(app => ({
        ...app,
        name: app.DisplayName, // Map DisplayName to name
        type: 'power-apps',
        icon: 'fa-mobile-alt',
        color: '#742774'
      })));
    }
    
    // Add Power BI
    if (data.PowerBI) {
      objects.push(...data.PowerBI.map(report => ({
        ...report,
        name: report.DisplayName, // Map DisplayName to name
        type: 'power-bi',
        icon: 'fa-chart-bar',
        color: '#f2c811'
      })));
    }
    
    return objects;
  }

  generateConnections(data) {
    const connections = [];
    
    // User-to-mailbox connections (1:1) - using OwnedBy property
    if (data.Users && data.Mailboxes) {
      data.Users.forEach(user => {
        const mailbox = data.Mailboxes.find(m => m.OwnedBy === user.id);
        if (mailbox) {
          connections.push({
            source: user.id,
            target: mailbox.id,
            type: 'ownership'
          });
        }
      });
    }
    
    // User-to-OneDrive connections (1:1) - using OwnedBy property
    if (data.Users && data.OneDrives) {
      data.Users.forEach(user => {
        const drive = data.OneDrives.find(d => d.OwnedBy === user.id);
        if (drive) {
          connections.push({
            source: user.id,
            target: drive.id,
            type: 'ownership'
          });
        }
      });
    }
    
    // User-to-SharePoint connections (permissions based) - using Owners, Members, Visitors
    if (data.Users && data.SharePointSites) {
      data.SharePointSites.forEach(site => {
        // Site owners
        if (site.Owners) {
          site.Owners.forEach(ownerId => {
            const user = data.Users.find(u => u.id === ownerId);
            if (user) {
              connections.push({
                source: user.id,
                target: site.id,
                type: 'site-owner'
              });
            }
          });
        }
        
        // Site members  
        if (site.Members) {
          site.Members.forEach(memberId => {
            const user = data.Users.find(u => u.id === memberId);
            if (user) {
              connections.push({
                source: user.id,
                target: site.id,
                type: 'site-member'
              });
            }
          });
        }
      });
    }
    
    // Group membership connections - using Members property
    if (data.Users && data.SecurityGroups) {
      data.SecurityGroups.forEach(group => {
        if (group.Members) {
          group.Members.forEach(memberId => {
            const user = data.Users.find(u => u.id === memberId);
            if (user) {
              connections.push({
                source: user.id,
                target: group.id,
                type: 'membership'
              });
            }
          });
        }
      });
    }
    
    // Power Platform connections - user ownership
    if (data.Users && data.PowerAutomate) {
      data.PowerAutomate.forEach(flow => {
        if (flow.OwnedBy) {
          const user = data.Users.find(u => u.id === flow.OwnedBy);
          if (user) {
            connections.push({
              source: user.id,
              target: flow.id,
              type: 'ownership'
            });
          }
        }
      });
    }
    
    if (data.Users && data.PowerApps) {
      data.PowerApps.forEach(app => {
        if (app.OwnedBy) {
          const user = data.Users.find(u => u.id === app.OwnedBy);
          if (user) {
            connections.push({
              source: user.id,
              target: app.id,
              type: 'ownership'
            });
          }
        }
      });
    }
    
    if (data.Users && data.PowerBI) {
      data.PowerBI.forEach(report => {
        if (report.OwnedBy) {
          const user = data.Users.find(u => u.id === report.OwnedBy);
          if (user) {
            connections.push({
              source: user.id,
              target: report.id,
              type: 'ownership'
            });
          }
        }
      });
    }
    
    return connections;
  }
}

// Main Visualizer Class
export class TenantToTenantVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/tenant-to-tenant-data.json',
      migrationType: 'tenant-to-tenant',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new TenantDataService();
  }
  
  /**
   * Load tenant-to-tenant migration data
   */
  async loadData() {
    return await this.dataService.loadTenantData(this.config.dataFile);
  }
  
  /**
   * Extract objects from tenant data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from tenant data
   */
  extractConnections(data) {
    return this.dataService.generateConnections(data);
  }
  
  /**
   * Create visual objects in the DOM
   */
  createObjects(objects, connections) {
    this.connections = connections;
    this.createInitialObjects(objects, connections);
  }

  /**
   * Create a draggable object element for tenant-to-tenant migration
   */
  createObjectElement(data, environment = 'source') {
    const element = document.createElement('div');
    element.className = `object-circle ${data.type}`;
    element.id = `${environment}-${data.id}`;
    element.setAttribute('data-id', data.id);
    element.setAttribute('data-type', data.type);
    element.setAttribute('data-environment', environment);
    element.setAttribute('data-name', data.name);
    
    // Set styles
    element.style.backgroundColor = data.color;
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = `fas ${data.icon}`;
    element.appendChild(icon);
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'object-tooltip';
    tooltip.textContent = data.name;
    
    if (data.department) {
      element.setAttribute('data-department', data.department);
      tooltip.textContent += ` (${data.department})`;
    }
    
    // Add migrated status if available
    if (data.migrated !== undefined) {
      element.setAttribute('data-migrated', data.migrated.toString());
      
      if (data.migrated) {
        const migratedIndicator = document.createElement('div');
        migratedIndicator.className = 'migrated-indicator';
        
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check';
        checkIcon.style.fontSize = '8px';
        checkIcon.style.color = 'white';
        migratedIndicator.appendChild(checkIcon);
        
        element.appendChild(migratedIndicator);
      }
    }
    
    element.appendChild(tooltip);
    
    // Store the object in our state
    this.objects[`${environment}-${data.id}`] = {
      ...data,
      element,
      environment
    };
    
    return element;
  }

  /**
   * Create initial objects in source environment
   */
  createInitialObjects(allObjects, connections) {
    // Group objects by type
    const objectsByType = allObjects.reduce((acc, obj) => {
      if (!acc[obj.type]) acc[obj.type] = [];
      acc[obj.type].push(obj);
      return acc;
    }, {});
    
    // Map of object types to container IDs for tenant-to-tenant
    const typeToContainerMap = {
      'user': 'source-users',
      'group': 'source-security-groups',
      'm365-group': 'source-m365-groups',
      'sharepoint': 'source-sharepoint',
      'teams': 'source-teams',
      'onedrive': 'source-onedrive',
      'mailbox': 'source-mailboxes',
      'power-automate': 'source-power-automate',
      'power-apps': 'source-power-apps',
      'power-bi': 'source-power-bi'
    };
    
    // Create objects by type
    Object.keys(objectsByType).forEach(type => {
      const containerSelector = typeToContainerMap[type];
      
      if (!containerSelector) {
        console.warn(`No container mapping found for type: ${type}`);
        return;
      }
      
      const container = document.getElementById(containerSelector);
      
      if (!container) {
        console.warn(`Container not found: ${containerSelector} for type: ${type}`);
        return;
      }
      
      objectsByType[type].forEach(obj => {
        const sourceObj = this.createObjectElement(obj, 'source');
        container.appendChild(sourceObj);
      });
    });
    
    // Store connections
    this.connections.length = 0;
    this.connections.push(...connections);
  }

  /**
   * Copy an object from source to destination environment
   */
  copyObjectToDestination(objectId, objectType) {
    const sourceObj = this.objects[`source-${objectId}`];
    
    if (!sourceObj) return null;
    
    // Map of source object types to destination container IDs and types
    const typeToDestinationMap = {
      'user': { container: 'destination-users', type: 'user' },
      'group': { container: 'destination-security-groups', type: 'group' },
      'm365-group': { container: 'destination-m365-groups', type: 'm365-group' },
      'sharepoint': { container: 'destination-sharepoint', type: 'sharepoint' },
      'teams': { container: 'destination-teams', type: 'teams' },
      'onedrive': { container: 'destination-onedrive', type: 'onedrive' },
      'mailbox': { container: 'destination-mailboxes', type: 'mailbox' },
      'power-automate': { container: 'destination-power-automate', type: 'power-automate' },
      'power-apps': { container: 'destination-power-apps', type: 'power-apps' },
      'power-bi': { container: 'destination-power-bi', type: 'power-bi' }
    };
    
    const destinationInfo = typeToDestinationMap[objectType];
    
    if (!destinationInfo) {
      console.warn(`No destination mapping found for type: ${objectType}`);
      return null;
    }
    
    // Create destination object (same type for tenant-to-tenant)
    const transformedData = {
      ...sourceObj,
      type: destinationInfo.type,
      migrated: true
    };
    
    const destObj = this.createObjectElement(transformedData, 'destination');
    
    // Add to appropriate destination bucket
    const container = document.getElementById(destinationInfo.container);
    if (container) {
      // Hide initially for animation
      destObj.style.opacity = '0';
      container.appendChild(destObj);
      
      // Get source element for animation
      const sourceEl = document.getElementById(`source-${objectId}`);
      if (sourceEl) {
        // Create flying animation
        createFlyingAnimation(sourceEl, destObj, sourceObj);
        
        // Show destination object after animation
        setTimeout(() => {
          destObj.style.opacity = '1';
          destObj.classList.add('migrating');
          
          setTimeout(() => {
            destObj.classList.remove('migrating');
          }, 800);
        }, 1200);
      }
    } else {
      console.warn(`Destination container not found: ${destinationInfo.container}`);
      return null;
    }
    
    // Add destination connections
    this.addDestinationConnections(objectId);
    this.updateConnections();
    
    return destObj;
  }

  /**
   * Add connections for migrated objects
   */
  addDestinationConnections(objectId) {
    // Find all connections involving this object
    const relatedConnections = this.connections.filter(conn => 
      conn.source === objectId || conn.target === objectId
    );
    
    relatedConnections.forEach(conn => {
      // Create destination equivalent
      const destConnection = {
        ...conn,
        source: conn.source,
        target: conn.target,
        environment: 'destination'
      };
      
      // Only add if both objects exist in destination
      const fromExists = document.getElementById(`destination-${conn.source}`);
      const toExists = document.getElementById(`destination-${conn.target}`);
      
      if (fromExists && toExists) {
        // Check if this connection already exists
        const exists = this.connections.some(c => 
          c.source === destConnection.source && 
          c.target === destConnection.target &&
          c.environment === 'destination'
        );
        
        if (!exists) {
          this.connections.push(destConnection);
        }
      }
    });
  }
}

// Entry point for tenant-to-tenant page
export function initializeTenantToTenantVisualizer() {
  return new TenantToTenantVisualizer();
}
