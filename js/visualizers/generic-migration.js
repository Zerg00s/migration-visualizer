/**
 * Generic Migration Visualizer
 * Renders migration visualizations based on JSON configuration
 */
import { BaseVisualizer } from '../core/base-visualizer.js';
import { createFlyingAnimation } from '../visualizer/animations.js';

export class GenericMigrationVisualizer extends BaseVisualizer {
  constructor(conceptDefinition) {
    super({
      dataFile: conceptDefinition.dataSource,
      migrationType: conceptDefinition.id,
      enableSelectionBox: true,
      enableAnimations: true
    });
    
    this.conceptDefinition = conceptDefinition;
    this.objectTypeMap = conceptDefinition.objectTypes;
    this.mappings = conceptDefinition.mappings;
    this.connectionRules = conceptDefinition.connectionRules;
  }
  
  /**
   * Load migration data
   */
  async loadData() {
    try {
      const response = await fetch(this.config.dataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading migration data:', error);
      throw error;
    }
  }
  
  /**
   * Extract objects from data based on object type definitions
   */
  extractObjects(data) {
    const objects = [];
    
    // Iterate through defined object types
    Object.entries(this.objectTypeMap).forEach(([typeKey, typeDefinition]) => {
      const collectionName = typeDefinition.dataProperties.collection;
      const collection = data[collectionName];
      
      if (collection && Array.isArray(collection)) {
        objects.push(...collection.map(item => ({
          ...item,
          id: item[typeDefinition.dataProperties.idField || 'id'],
          name: item[typeDefinition.dataProperties.nameField || 'DisplayName'],
          type: typeKey,
          icon: typeDefinition.icon,
          color: typeDefinition.color,
          // Include additional fields
          ...this.extractAdditionalFields(item, typeDefinition.dataProperties.additionalFields)
        })));
      }
    });
    
    return objects;
  }
  
  /**
   * Extract additional fields from object
   */
  extractAdditionalFields(item, additionalFields) {
    const fields = {};
    if (additionalFields) {
      additionalFields.forEach(field => {
        if (item[field] !== undefined) {
          fields[field.toLowerCase()] = item[field];
        }
      });
    }
    return fields;
  }
  
  /**
   * Extract connections from data based on connection rules
   */
  extractConnections(data) {
    const connections = [];
    
    this.connectionRules.forEach(rule => {
      const fromType = this.objectTypeMap[rule.from.objectType];
      const toType = this.objectTypeMap[rule.to.objectType];
      
      if (!fromType || !toType) {
        console.warn(`Invalid connection rule: ${rule.from.objectType} -> ${rule.to.objectType}`);
        return;
      }
      
      const fromCollection = data[fromType.dataProperties.collection];
      const toCollection = data[toType.dataProperties.collection];
      
      if (!fromCollection || !toCollection) {
        return;
      }
      
      // Handle different connection types
      if (rule.to.property) {
        // Single property reference
        toCollection.forEach(toItem => {
          const fromId = toItem[rule.to.property];
          if (fromId) {
            const fromItem = fromCollection.find(f => f[fromType.dataProperties.idField] === fromId);
            if (fromItem) {
              connections.push({
                source: fromItem[fromType.dataProperties.idField],
                target: toItem[toType.dataProperties.idField],
                type: rule.type,
                name: rule.name
              });
            }
          }
        });
      } else if (rule.to.arrayProperty) {
        // Array property reference
        toCollection.forEach(toItem => {
          const fromIds = toItem[rule.to.arrayProperty];
          if (fromIds && Array.isArray(fromIds)) {
            fromIds.forEach(fromRef => {
              // Handle both direct IDs and objects with conditions
              const fromId = typeof fromRef === 'string' ? fromRef : fromRef.Principal || fromRef.id;
              const fromItem = fromCollection.find(f => f[fromType.dataProperties.idField] === fromId);
              
              if (fromItem) {
                // Check condition if specified
                if (!rule.condition || this.evaluateCondition(rule.condition, fromItem, toItem, fromRef)) {
                  connections.push({
                    source: fromItem[fromType.dataProperties.idField],
                    target: toItem[toType.dataProperties.idField],
                    type: rule.type,
                    name: rule.name
                  });
                }
              }
            });
          }
        });
      }
      
      // Reverse connections - from has array property pointing to
      if (rule.from.arrayProperty) {
        fromCollection.forEach(fromItem => {
          const toIds = fromItem[rule.from.arrayProperty];
          if (toIds && Array.isArray(toIds)) {
            toIds.forEach(toId => {
              const toItem = toCollection.find(t => t[toType.dataProperties.idField] === toId);
              if (toItem) {
                connections.push({
                  source: fromItem[fromType.dataProperties.idField],
                  target: toItem[toType.dataProperties.idField],
                  type: rule.type,
                  name: rule.name
                });
              }
            });
          }
        });
      }
    });
    
    return connections;
  }
  
  /**
   * Evaluate a condition expression
   */
  evaluateCondition(condition, fromItem, toItem, reference) {
    try {
      // Simple evaluation - in production you'd want a safer approach
      const func = new Function('from', 'to', 'permission', `return ${condition}`);
      return func(fromItem, toItem, reference);
    } catch (error) {
      console.warn('Error evaluating condition:', condition, error);
      return true;
    }
  }
  
  /**
   * Create visual objects in the DOM
   */
  createObjects(objects, connections) {
    this.connections.length = 0;
    this.connections.push(...connections);
    this.createInitialObjects(objects, connections);
  }

  /**
   * Create a draggable object element
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
    icon.className = data.icon.startsWith('fab') ? data.icon : `fas ${data.icon}`;
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
    const env = this.conceptDefinition.sourceEnvironment;
    
    // Create objects for each bucket
    env.buckets.forEach(bucket => {
      const container = document.getElementById(bucket.id);
      if (!container) {
        console.warn(`Container not found: ${bucket.id}`);
        return;
      }
      
      // Find objects of this bucket's type
      const bucketObjects = allObjects.filter(obj => obj.type === bucket.objectType);
      
      bucketObjects.forEach(obj => {
        const element = this.createObjectElement(obj, 'source');
        container.appendChild(element);
      });
    });
  }

  /**
   * Copy an object from source to destination environment
   */
  copyObjectToDestination(objectId, objectType) {
    const sourceObj = this.objects[`source-${objectId}`];
    
    if (!sourceObj) return null;
    
    // Find the mapping for this object type
    const mapping = this.mappings.find(m => m.sourceType === objectType);
    if (!mapping) {
      console.warn(`No mapping found for type: ${objectType}`);
      return null;
    }
    
    // Find the destination bucket
    let destBucket = mapping.targetBucket;
    if (!destBucket) {
      // Auto-find bucket based on target type
      const targetBucket = this.conceptDefinition.targetEnvironment.buckets.find(
        b => b.objectType === mapping.targetType
      );
      if (targetBucket) {
        destBucket = targetBucket.id;
      }
    }
    
    if (!destBucket) {
      console.warn(`No destination bucket found for type: ${objectType}`);
      return null;
    }
    
    // Apply transformations
    const transformedData = {
      ...sourceObj,
      type: mapping.targetType,
      migrated: true
    };
    
    // Apply transformation rules
    if (mapping.transformations) {
      if (mapping.transformations.icon) {
        transformedData.icon = mapping.transformations.icon;
      }
      if (mapping.transformations.color) {
        transformedData.color = mapping.transformations.color;
      }
      if (mapping.transformations.nameTransform) {
        transformedData.name = this.transformName(
          sourceObj.name, 
          mapping.transformations.nameTransform
        );
      }
    }
    
    const destObj = this.createObjectElement(transformedData, 'destination');
    
    // Add to destination bucket
    const container = document.getElementById(destBucket);
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
      console.warn(`Destination container not found: ${destBucket}`);
      return null;
    }
    
    // Add destination connections
    this.addDestinationConnections(objectId);
    this.updateConnections();
    
    return destObj;
  }
  
  /**
   * Transform object name based on transformation rule
   */
  transformName(name, transformType) {
    switch (transformType) {
      case 'append_migrated':
        return `${name} (Migrated)`;
      case 'append_modern':
        return `${name} (Modern)`;
      case 'append_powerapp':
        return `${name} PowerApp`;
      case 'append_flow':
        return `${name} Flow`;
      default:
        return name;
    }
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

/**
 * Load a migration concept definition
 */
export async function loadMigrationConcept(conceptId) {
  try {
    const response = await fetch(`data/migration-concepts/${conceptId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading migration concept:', error);
    throw error;
  }
}

/**
 * Create a visualizer for a specific migration concept
 */
export async function createMigrationVisualizer(conceptId) {
  const conceptDefinition = await loadMigrationConcept(conceptId);
  return new GenericMigrationVisualizer(conceptDefinition);
}
