# Files Safe to Delete After Refactoring

## Confirmed Safe to Delete:

### 1. Old Visualizer Classes
These have been replaced by the new architecture with BaseVisualizer:

- `js/visualizer/MigrationVisualizer.js`
- `js/file-shares/FileSharesMigrationVisualizer.js` 
- `js/sharepoint-onprem/SharePointOnPremMigrationVisualizer.js`
- `js/google-workspace/GoogleWorkspaceMigrationVisualizer.js`

### 2. Old Data Loaders
These have been replaced by the new data service layer:

- `js/data/data-loader.js`
- `js/data/file-shares-data-loader.js`
- `js/data/sharepoint-onprem-data-loader.js`
- `js/data/google-workspace-data-loader.js`

## Files to KEEP:

### 1. Object Creation Files
These are still being used by the new visualizers:
- `js/file-shares/file-shares-objects.js`
- `js/sharepoint-onprem/sharepoint-onprem-objects.js`
- `js/google-workspace/google-workspace-objects.js`
- `js/visualizer/objects.js`

### 2. Shared Visualizer Utilities
These are still used by BaseVisualizer:
- `js/visualizer/animations.js`
- `js/visualizer/connections.js`
- `js/visualizer/migration.js`
- `js/visualizer/selection.js`
- `js/visualizer/selection-box/` (entire directory)

### 3. Other Files
- `js/data/models.js` - May still be used
- `js/utils/` - All utility files are still needed
- `js/migration-zone.js` - Still used by all pages

## Cleanup Commands:

To delete the safe-to-delete files, run these commands:

```bash
# Delete old visualizer classes
del "C:\SCRIPTS\migration-visualizer\js\visualizer\MigrationVisualizer.js"
del "C:\SCRIPTS\migration-visualizer\js\file-shares\FileSharesMigrationVisualizer.js"
del "C:\SCRIPTS\migration-visualizer\js\sharepoint-onprem\SharePointOnPremMigrationVisualizer.js"
del "C:\SCRIPTS\migration-visualizer\js\google-workspace\GoogleWorkspaceMigrationVisualizer.js"

# Delete old data loaders
del "C:\SCRIPTS\migration-visualizer\js\data\data-loader.js"
del "C:\SCRIPTS\migration-visualizer\js\data\file-shares-data-loader.js"
del "C:\SCRIPTS\migration-visualizer\js\data\sharepoint-onprem-data-loader.js"
del "C:\SCRIPTS\migration-visualizer\js\data\google-workspace-data-loader.js"
```

## Empty Directories to Remove:
After deleting the files above, these directories will be empty and can be removed:
- `js/core/` (empty subdirectory - the core directory itself has files)

Total files that can be deleted: **8 files**
