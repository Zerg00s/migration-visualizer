/**
 * Application configuration
 * Centralized configuration for colors, animations, and other settings
 */
export const config = {
  // Object type colors
  colors: {
    user: '#64b5f6',
    group: '#7e57c2',
    sharepoint: '#4caf50',
    teams: '#673ab7',
    onedrive: '#2196f3',
    'm365-group': '#ff9800',
    mailbox: '#e91e63',
    'power-automate': '#0066ff',
    'power-apps': '#742774',
    'power-bi': '#f2c811',
    'file-share': '#795548',
    'infopath-form': '#607d8b',
    workflow: '#9c27b0',
    'sharepoint-onprem': '#2e7d32',
    'google-user': '#4285f4',
    'google-group': '#34a853',
    'google-mailbox': '#ea4335',
    'google-shared-drive': '#fbbc05',
    'google-drive': '#ff6d01',
    'exchange-online': '#0078d4',
    'entra-user': '#64b5f6',
    'entra-group': '#7e57c2'
  },
  
  // Animation settings
  animations: {
    duration: 300,
    easing: 'ease',
    migrationDuration: 800,
    initialRenderDelay: 50,
    connectionFadeIn: 200
  },
  
  // Visualization settings
  visualization: {
    objectSize: 45,
    objectGap: 12,
    connectionOpacity: 0.3,
    connectionHighlightOpacity: 0.7,
    selectedScale: 1.15,
    hoveredScale: 1.1,
    bucketMinHeight: 160,
    bucketMinWidth: 100
  },
  
  // API and data settings
  api: {
    dataPath: 'data/',
    timeout: 5000,
    retryCount: 3,
    retryDelay: 1000
  },
  
  // UI settings
  ui: {
    detailsPanelWidth: 350,
    headerHeight: 60,
    footerHeight: 60,
    borderRadius: 8,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  
  // Feature flags
  features: {
    enableSelectionBox: true,
    enableAnimations: true,
    enableDebugMode: false,
    enableKeyboardShortcuts: true,
    enableTouchSupport: true
  }
};

// Freeze config to prevent accidental modifications
Object.freeze(config);
Object.freeze(config.colors);
Object.freeze(config.animations);
Object.freeze(config.visualization);
Object.freeze(config.api);
Object.freeze(config.ui);
Object.freeze(config.features);
