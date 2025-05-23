/**
 * SharePoint OnPrem Migration Visualizer
 * Consolidated visualizer for SharePoint OnPrem to M365 migrations
 */
import { BaseVisualizer } from '../core/base-visualizer.js';
import { createFlyingAnimation } from '../visualizer/animations.js';

// Data Service for SharePoint OnPrem
class SharePointOnPremDataService {
  async loadSharePointOnPremData(dataFile) {
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading SharePoint OnPrem data:', error);
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
    
    // Add SharePoint sites (note: JSON uses 'SharePointSites', not 'sites')
    if (data.SharePointSites) {
      objects.push(...data.SharePointSites.map(site => ({
        ...site,
        name: site.DisplayName, // Map DisplayName to name
        type: 'sharepoint-onprem',
        icon: 'fa-share-alt',
        color: '#2e7d32'
      })));
    }
    
    // Add InfoPath forms
    if (data.InfoPathForms) {
      objects.push(...data.InfoPathForms.map(form => ({
        ...form,
        name: form.DisplayName, // Map DisplayName to name
        type: 'infopath-form',
        icon: 'fa-file-alt',
        color: '#607d8b'
      })));
    }
    
    // Add workflows
    if (data.Workflows) {
      objects.push(...data.Workflows.map(workflow => ({
        ...workflow,
        name: workflow.DisplayName, // Map DisplayName to name
        type: 'workflow',
        icon: 'fa-project-diagram',
        color: '#9c27b0'
      })));
    }
    
    return objects;
  }

  generateConnections(data) {
    const connections = [];
    
    console.log('Generating SharePoint OnPrem connections from data:', {
      users: data.Users?.length || 0,
      securityGroups: data.SecurityGroups?.length || 0,
      sharePointSites: data.SharePointSites?.length || 0,
      infoPathForms: data.InfoPathForms?.length || 0,
      workflows: data.Workflows?.length || 0
    });
    
    // User-to-site connections based on permissions
    if (data.SharePointSites && data.Users) {
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
              console.log(`Connection: ${user.DisplayName} -> ${site.DisplayName} (owner)`);
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
              console.log(`Connection: ${user.DisplayName} -> ${site.DisplayName} (member)`);
            }
          });
        }
      });
    }
    
    // Group-to-site connections
    if (data.SharePointSites && data.SecurityGroups) {
      data.SharePointSites.forEach(site => {
        // Group members
        if (site.Members) {
          site.Members.forEach(memberId => {
            const group = data.SecurityGroups.find(g => g.id === memberId);
            if (group) {
              connections.push({
                source: group.id,
                target: site.id,
                type: 'group-access'
              });
              console.log(`Connection: ${group.DisplayName} -> ${site.DisplayName} (group access)`);
            }
          });
        }
      });
    }
    
    // User-to-group membership connections
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
              console.log(`Connection: ${user.DisplayName} -> ${group.DisplayName} (member)`);
            }
          });
        }
      });
    }
    
    // InfoPath form-to-site connections
    if (data.InfoPathForms && data.SharePointSites) {
      data.InfoPathForms.forEach(form => {
        if (form.HostingSite) {
          const site = data.SharePointSites.find(s => s.id === form.HostingSite);
          if (site) {
            connections.push({
              source: form.id,
              target: site.id,
              type: 'hosted-on'
            });
            console.log(`Connection: ${form.DisplayName} -> ${site.DisplayName} (hosted on)`);
          }
        }
      });
    }
    
    // Workflow-to-site connections
    if (data.Workflows && data.SharePointSites) {
      data.Workflows.forEach(workflow => {
        if (workflow.AssociatedSite) {
          const site = data.SharePointSites.find(s => s.id === workflow.AssociatedSite);
          if (site) {
            connections.push({
              source: workflow.id,
              target: site.id,
              type: 'runs-on'
            });
            console.log(`Connection: ${workflow.DisplayName} -> ${site.DisplayName} (runs on)`);
          }
        }
      });
    }
    
    console.log(`Generated ${connections.length} total SharePoint OnPrem connections`);
    return connections;
  }
}

// Main Visualizer Class
export class SharePointOnPremVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/sharepoint-onprem-data.json',
      migrationType: 'sharepoint-onprem',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new SharePointOnPremDataService();
  }
  
  /**
   * Load SharePoint OnPrem migration data
   */
  async loadData() {
    return await this.dataService.loadSharePointOnPremData(this.config.dataFile);
  }
  
  /**
   * Extract objects from SharePoint OnPrem data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from SharePoint OnPrem data
   */
  extractConnections(data) {
    return this.dataService.generateConnections(data);
  }
  
  /**
   * Create visual objects in the DOM
   */
  createObjects(objects, connections) {
    // Don't assign the array reference directly - copy the connections instead
    this.connections.length = 0;
    this.connections.push(...connections);
    console.log('createObjects - stored SharePoint OnPrem connections:', this.connections.length);
    this.createInitialObjects(objects, connections);
  }

  /**
   * Create a draggable object element for SharePoint OnPrem migration
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
    
    // Map of object types to container IDs for SharePoint OnPrem
    const typeToContainerMap = {
      'user': 'source-users',
      'group': 'source-security-groups',
      'sharepoint-onprem': 'source-sharepoint-sites',
      'infopath-form': 'source-infopath-forms',
      'workflow': 'source-workflows'
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
    
    // Connections are already stored in this.connections by createObjects method
    console.log('createInitialObjects - SharePoint OnPrem connections already stored:', this.connections.length);
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
      'sharepoint-onprem': { container: 'destination-sharepoint-online', type: 'sharepoint' },
      'infopath-form': { container: 'destination-power-apps', type: 'power-apps' },
      'workflow': { container: 'destination-power-automate', type: 'power-automate' }
    };
    
    const destinationInfo = typeToDestinationMap[objectType];
    
    if (!destinationInfo) {
      console.warn(`No destination mapping found for type: ${objectType}`);
      return null;
    }
    
    // Create destination object with transformed properties
    const transformedData = {
      ...sourceObj,
      type: destinationInfo.type,
      migrated: true,
      // Transform to modern M365 equivalents
      ...(objectType === 'sharepoint-onprem' && {
        icon: 'fa-share-alt',
        color: '#4caf50'
      }),
      ...(objectType === 'infopath-form' && {
        icon: 'fa-mobile-alt',
        color: '#742774'
      }),
      ...(objectType === 'workflow' && {
        icon: 'fa-bolt',
        color: '#0066ff'
      })
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

// Entry point for sharepoint-onprem page
export function initializeSharePointOnPremVisualizer() {
  return new SharePointOnPremVisualizer();
}
