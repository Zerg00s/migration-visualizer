# Migration Visualizer - Refactoring Documentation

## Overview
This document describes the refactoring of the Migration Visualizer project to improve code organization, maintainability, and extensibility while maintaining all existing functionality.

## Key Improvements

### 1. Base Class Architecture
- Created `BaseVisualizer` class that all migration visualizers inherit from
- Eliminates code duplication across different visualizer types
- Provides consistent interface and behavior

### 2. Service Layer
- Created data service classes to separate data logic from visualization
- `DataService` - Base service class
- `TenantDataService` - Tenant-to-tenant migration data
- `FileSharesDataService` - File shares migration data
- `SharePointOnPremDataService` - SharePoint on-premises migration data
- `GoogleWorkspaceDataService` - Google Workspace migration data

### 3. Centralized Configuration
- Created `config.js` for all application settings
- Colors, animations, UI settings in one place
- Frozen objects to prevent accidental modifications

### 4. Visualizer Registry
- Dynamic registration system for visualizers
- Easy to add new migration types
- Consistent initialization pattern

### 5. State Management
- Created `StateManager` class for centralized state
- Event-driven architecture with pub/sub pattern
- Undo/redo functionality support
- History tracking

## File Structure

```
js/
├── core/                          # Core framework classes
│   ├── BaseVisualizer.js         # Abstract base class for all visualizers
│   ├── VisualizerRegistry.js     # Registry for visualizer types
│   └── app-init.js               # Central initialization
├── services/                      # Data service layer
│   ├── DataService.js            # Base data service
│   ├── TenantDataService.js      # Tenant-specific data handling
│   ├── FileSharesDataService.js  # File shares data handling
│   ├── SharePointOnPremDataService.js
│   └── GoogleWorkspaceDataService.js
├── state/                         # State management
│   └── StateManager.js           # Centralized state management
├── config/                        # Configuration
│   └── config.js                 # Application configuration
├── migrations/                    # Migration-specific visualizers
│   ├── tenant-to-tenant/
│   │   └── TenantToTenantVisualizer.js
│   ├── file-shares/
│   │   └── FileSharesVisualizer.js
│   ├── sharepoint-onprem/
│   │   └── SharePointOnPremVisualizer.js
│   └── google-workspace/
│       └── GoogleWorkspaceVisualizer.js
└── [existing folders...]          # Unchanged existing code
```

## Migration Guide

### Adding a New Migration Type

1. Create a data service:
```javascript
// js/services/NewMigrationDataService.js
import { DataService } from './DataService.js';

export class NewMigrationDataService extends DataService {
  // Implement data extraction methods
}
```

2. Create a visualizer:
```javascript
// js/migrations/new-migration/NewMigrationVisualizer.js
import { BaseVisualizer } from '../../core/BaseVisualizer.js';

export class NewMigrationVisualizer extends BaseVisualizer {
  constructor() {
    super({
      dataFile: 'data/new-migration-data.json',
      migrationType: 'new-migration'
    });
  }
  
  // Implement abstract methods
}
```

3. Register in the entry point:
```javascript
// js/new-migration.js
import { NewMigrationVisualizer } from './migrations/new-migration/NewMigrationVisualizer.js';
import { visualizerRegistry } from './core/VisualizerRegistry.js';

visualizerRegistry.register('new-migration', NewMigrationVisualizer);
```

## Backward Compatibility

All refactoring maintains backward compatibility:
- Same HTML structure
- Same visual appearance
- Same user interactions
- Same data formats
- Same URLs

The refactoring is internal only and doesn't affect the user experience.

## Benefits

1. **Maintainability**: Clear separation of concerns, easier to understand and modify
2. **Reusability**: Common functionality shared through base classes
3. **Extensibility**: Easy to add new migration types
4. **Testability**: Isolated components are easier to test
5. **Performance**: Better state management reduces unnecessary operations
6. **Developer Experience**: Clear patterns and consistent structure

## Future Enhancements

With this refactored architecture, future enhancements are easier:
- Add unit tests for each component
- Implement advanced filtering and search
- Add export/import functionality
- Create custom themes
- Add real-time collaboration features
- Implement advanced analytics

## Usage

The refactored code works exactly the same as before from a user perspective. Developers can now:

1. Access the visualizer instance for debugging:
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');
// Access visualizer
console.log(window.visualizer);
```

2. Subscribe to state changes:
```javascript
const visualizer = window.visualizer;
visualizer.stateManager.subscribe('selectionChanged', (data) => {
  console.log('Selection changed:', data);
});
```

3. Programmatically control the visualizer:
```javascript
// Select an object
visualizer.selectObject('user_1');
// Migrate selected
visualizer.migrateSelectedObjects();
// Reset
visualizer.resetVisualization();
```
