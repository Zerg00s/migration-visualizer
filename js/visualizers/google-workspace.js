/**
 * Google Workspace Migration Visualizer
 * Consolidated visualizer for Google Workspace to M365 migrations
 */
import { BaseVisualizer } from '../core/base-visualizer.js';
import { createFlyingAnimation } from '../visualizer/animations.js';

// Data Service for Google Workspace
class GoogleWorkspaceDataService {
  async loadGoogleWorkspaceData(dataFile) {
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading Google Workspace data:', error);
      throw error;
    }
  }

  extractAllObjects(data) {
    const objects = [];
    
    // Add users (note: JSON uses 'GoogleUsers', not 'users')
    if (data.GoogleUsers) {
      objects.push(...data.GoogleUsers.map(user => ({
        ...user,
        name: user.DisplayName, // Map DisplayName to name
        type: 'google-user',
        icon: 'fa-user',
        color: '#4285f4'
      })));
    }
    
    // Add groups (note: JSON uses 'GoogleGroups', not 'groups')
    if (data.GoogleGroups) {
      objects.push(...data.GoogleGroups.map(group => ({
        ...group,
        name: group.DisplayName, // Map DisplayName to name
        type: 'google-group',
        icon: 'fa-users',
        color: '#34a853'
      })));
    }
    
    // Add mailboxes (note: JSON uses 'GoogleMailboxes', not 'mailboxes')
    if (data.GoogleMailboxes) {
      objects.push(...data.GoogleMailboxes.map(mailbox => ({
        ...mailbox,
        name: mailbox.DisplayName, // Map DisplayName to name
        type: 'google-mailbox',
        icon: 'fa-envelope',
        color: '#ea4335'
      })));
    }
    
    // Add shared drives (note: JSON uses 'GoogleSharedDrives', not 'sharedDrives')
    if (data.GoogleSharedDrives) {
      objects.push(...data.GoogleSharedDrives.map(drive => ({
        ...drive,
        name: drive.DisplayName, // Map DisplayName to name
        type: 'google-shared-drive',
        icon: 'fa-folder-open',
        color: '#fbbc05'
      })));
    }
    
    // Add personal drives (note: JSON uses 'GoogleDrives', not 'personalDrives')
    if (data.GoogleDrives) {
      objects.push(...data.GoogleDrives.map(drive => ({
        ...drive,
        name: drive.DisplayName, // Map DisplayName to name
        type: 'google-drive',
        icon: 'fa-cloud',
        color: '#ff6d01'
      })));
    }
    
    return objects;
  }

  generateConnections(data) {
    const connections = [];
    
    console.log('Generating Google Workspace connections from data:', {
      googleUsers: data.GoogleUsers?.length || 0,
      googleGroups: data.GoogleGroups?.length || 0,
      googleMailboxes: data.GoogleMailboxes?.length || 0,
      googleSharedDrives: data.GoogleSharedDrives?.length || 0,
      googleDrives: data.GoogleDrives?.length || 0
    });
    
    // User-to-mailbox connections (1:1) - using Owner property
    if (data.GoogleUsers && data.GoogleMailboxes) {
      data.GoogleUsers.forEach(user => {
        const mailbox = data.GoogleMailboxes.find(m => m.Owner === user.id);
        if (mailbox) {
          connections.push({
            source: user.id,
            target: mailbox.id,
            type: 'ownership'
          });
          console.log(`Connection: ${user.DisplayName} -> ${mailbox.DisplayName}`);
        }
      });
    }
    
    // User-to-personal-drive connections (1:1) - using Owner property
    if (data.GoogleUsers && data.GoogleDrives) {
      data.GoogleUsers.forEach(user => {
        const drive = data.GoogleDrives.find(d => d.Owner === user.id);
        if (drive) {
          connections.push({
            source: user.id,
            target: drive.id,
            type: 'ownership'
          });
          console.log(`Connection: ${user.DisplayName} -> ${drive.DisplayName}`);
        }
      });
    }
    
    // User-to-shared-drive connections (permissions based)
    if (data.GoogleUsers && data.GoogleSharedDrives) {
      data.GoogleSharedDrives.forEach(drive => {
        // Check organizers
        if (drive.Organizers) {
          drive.Organizers.forEach(userId => {
            const user = data.GoogleUsers.find(u => u.id === userId);
            if (user) {
              connections.push({
                source: user.id,
                target: drive.id,
                type: 'organizer'
              });
              console.log(`Connection: ${user.DisplayName} -> ${drive.DisplayName} (organizer)`);
            }
          });
        }
        
        // Check content managers
        if (drive.ContentManagers) {
          drive.ContentManagers.forEach(userId => {
            const user = data.GoogleUsers.find(u => u.id === userId);
            if (user) {
              connections.push({
                source: user.id,
                target: drive.id,
                type: 'content-manager'
              });
              console.log(`Connection: ${user.DisplayName} -> ${drive.DisplayName} (content manager)`);
            }
          });
        }
      });
    }
    
    // Group membership connections - using Members property
    if (data.GoogleUsers && data.GoogleGroups) {
      data.GoogleGroups.forEach(group => {
        if (group.Members) {
          group.Members.forEach(memberId => {
            const user = data.GoogleUsers.find(u => u.id === memberId);
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
    
    console.log(`Generated ${connections.length} total Google Workspace connections`);
    return connections;
  }
}

// Main Visualizer Class
export class GoogleWorkspaceVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/google-workspace-data.json',
      migrationType: 'google-workspace',
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.dataService = new GoogleWorkspaceDataService();
  }
  
  /**
   * Load Google Workspace migration data
   */
  async loadData() {
    return await this.dataService.loadGoogleWorkspaceData(this.config.dataFile);
  }
  
  /**
   * Extract objects from Google Workspace data
   */
  extractObjects(data) {
    return this.dataService.extractAllObjects(data);
  }
  
  /**
   * Extract connections from Google Workspace data
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
    console.log('createObjects - stored Google Workspace connections:', this.connections.length);
    this.createInitialObjects(objects, connections);
  }

  /**
   * Create a draggable object element for Google Workspace migration
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
    
    // Map of object types to container IDs for Google Workspace
    const typeToContainerMap = {
      'google-user': 'source-google-users',
      'google-group': 'source-google-groups',
      'google-mailbox': 'source-google-mailboxes',
      'google-shared-drive': 'source-google-shared-drives',
      'google-drive': 'source-google-drives'
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
    console.log('createInitialObjects - Google Workspace connections already stored:', this.connections.length);
  }

  /**
   * Copy an object from source to destination environment
   */
  copyObjectToDestination(objectId, objectType) {
    const sourceObj = this.objects[`source-${objectId}`];
    
    if (!sourceObj) return null;
    
    // Map of source object types to destination container IDs and types
    const typeToDestinationMap = {
      'google-user': { container: 'destination-entra-users', type: 'entra-user' },
      'google-group': { container: 'destination-entra-groups', type: 'entra-group' },
      'google-mailbox': { container: 'destination-exchange-online', type: 'exchange-online' },
      'google-shared-drive': { container: 'destination-sharepoint-online', type: 'sharepoint' },
      'google-drive': { container: 'destination-onedrive', type: 'onedrive' }
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
      // Transform icons and colors for Microsoft 365
      ...(objectType === 'google-user' && {
        icon: 'fa-user',
        color: '#64b5f6'
      }),
      ...(objectType === 'google-group' && {
        icon: 'fa-users',
        color: '#7e57c2'
      }),
      ...(objectType === 'google-mailbox' && {
        icon: 'fa-envelope',
        color: '#0078d4'
      }),
      ...(objectType === 'google-shared-drive' && {
        icon: 'fa-share-alt',
        color: '#4caf50'
      }),
      ...(objectType === 'google-drive' && {
        icon: 'fa-cloud',
        color: '#2196f3'
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

// Entry point for google-workspace page
export function initializeGoogleWorkspaceVisualizer() {
  return new GoogleWorkspaceVisualizer();
}
