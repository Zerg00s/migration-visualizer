/**
 * File Shares Migration Visualizer
 * Consolidated visualizer for file shares to M365 migrations
 */
import { BaseVisualizer } from '../core/base-visualizer.js';
import { createFlyingAnimation } from '../visualizer/animations.js';

// Data Service for File Shares
class FileSharesDataService {
  async loadFileSharesData(dataFile) {
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading file shares data:', error);
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
    
    // Add file shares (note: JSON uses 'FileShares', not 'fileShares')
    if (data.FileShares) {
      objects.push(...data.FileShares.map(share => ({
        ...share,
        name: share.DisplayName, // Map DisplayName to name
        type: 'file-share',
        icon: 'fa-folder',
        color: '#795548'
      })));
    }
    
    return objects;
  }

  generateConnections(data) {
    const connections = [];
    
    // Generate user-to-file-share connections based on permissions
    if (data.FileShares && data.Users) {
      data.FileShares.forEach(share => {
        if (share.Permissions) {
          share.Permissions.forEach(permission => {
            const user = data.Users.find(u => u.id === permission.Principal);
            if (user) {
              connections.push({
                from: `source-${user.id}`,
                to: `source-${share.id}`,
                type: 'access',
                permission: permission.Access
              });
            }
          });
        }
      });
    }
    
    // Generate group-to-file-share connections
    if (data.FileShares && data.SecurityGroups) {
      data.FileShares.forEach(share => {
        if (share.Permissions) {
          share.Permissions.forEach(permission => {
            const group = data.SecurityGroups.find(g => g.id === permission.Principal);
            if (group) {
              connections.push({
                from: `source-${group.id}`,
                to: `source-${share.id}`,
                type: 'group-access',
                permission: permission.Access
              });
            }
          });
        }
      });
    }
    
    // Generate user-to-group membership connections
    if (data.Users && data.SecurityGroups) {
      data.SecurityGroups.forEach(group => {
        if (group.Members) {
          group.Members.forEach(memberId => {
            const user = data.Users.find(u => u.id === memberId);
            if (user) {
              connections.push({
                from: `source-${user.id}`,
                to: `source-${group.id}`,
                type: 'membership'
              });
            }
          });
        }
      });
    }
    
    return connections;
  }
}

// Main Visualizer Class
export class FileSharesVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/file-shares-data.json',
      migrationType: 'file-shares',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new FileSharesDataService();
  }
  
  /**
   * Load file shares migration data
   */
  async loadData() {
    return await this.dataService.loadFileSharesData(this.config.dataFile);
  }
  
  /**
   * Extract objects from file shares data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from file shares data
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
   * Create a draggable object element for file shares migration
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
    
    // Map of object types to container IDs
    const typeToContainerMap = {
      'user': 'source-users',
      'group': 'source-security-groups',
      'file-share': 'source-file-shares'
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
      'file-share': { container: 'destination-sharepoint-sites', type: 'sharepoint-site' }
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
      // Transform file share to SharePoint site
      ...(objectType === 'file-share' && {
        icon: 'fa-share-alt',
        color: '#4caf50'
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
      conn.from.includes(objectId) || conn.to.includes(objectId)
    );
    
    relatedConnections.forEach(conn => {
      // Create destination equivalent
      const destConnection = {
        ...conn,
        from: conn.from.replace('source-', 'destination-'),
        to: conn.to.replace('source-', 'destination-'),
        environment: 'destination'
      };
      
      // Only add if both objects exist in destination
      const fromExists = document.getElementById(destConnection.from);
      const toExists = document.getElementById(destConnection.to);
      
      if (fromExists && toExists) {
        this.connections.push(destConnection);
      }
    });
  }
}

// Entry point for file-shares page
export function initializeFileSharesVisualizer() {
  return new FileSharesVisualizer();
}
