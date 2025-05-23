/**
 * Generic Migration Visualizer
 * Handles all migration concepts dynamically based on URL parameters
 */
import { TenantToTenantVisualizer } from './visualizers/tenant-to-tenant.js';
import { FileSharesVisualizer } from './visualizers/file-shares.js';
import { SharePointOnPremVisualizer } from './visualizers/sharepoint-onprem.js';
import { GoogleWorkspaceVisualizer } from './visualizers/google-workspace.js';
import { visualizerRegistry } from './core/visualizer-registry.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Configuration for each concept
const CONCEPTS = {
  'tenant-to-tenant': {
    title: 'Tenant-to-Tenant Migration Visualizer',
    visualizerClass: TenantToTenantVisualizer,
    template: `
      <div class="environment source-environment">
        <h3 class="environment-title">Source Tenant</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">Entra ID Users</h4>
            <div class="bucket-content" id="source-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">Entra ID Security Groups</h4>
            <div class="bucket-content" id="source-security-groups"></div>
          </div>
          <div class="bucket" data-type="sharepoint">
            <h4 class="bucket-title">SharePoint Online</h4>
            <div class="bucket-content" id="source-sharepoint"></div>
          </div>
          <div class="bucket" data-type="teams">
            <h4 class="bucket-title">Teams</h4>
            <div class="bucket-content" id="source-teams"></div>
          </div>
          <div class="bucket" data-type="onedrive">
            <h4 class="bucket-title">OneDrive</h4>
            <div class="bucket-content" id="source-onedrive"></div>
          </div>
          <div class="bucket" data-type="m365-groups">
            <h4 class="bucket-title">M365 Groups</h4>
            <div class="bucket-content" id="source-m365-groups"></div>
          </div>
          <div class="bucket" data-type="mailboxes">
            <h4 class="bucket-title">Mailboxes</h4>
            <div class="bucket-content" id="source-mailboxes"></div>
          </div>
          <div class="bucket" data-type="power-automate">
            <h4 class="bucket-title">Power Automate</h4>
            <div class="bucket-content" id="source-power-automate"></div>
          </div>
          <div class="bucket" data-type="power-apps">
            <h4 class="bucket-title">Power Apps</h4>
            <div class="bucket-content" id="source-power-apps"></div>
          </div>
          <div class="bucket" data-type="power-bi">
            <h4 class="bucket-title">Power BI</h4>
            <div class="bucket-content" id="source-power-bi"></div>
          </div>
        </div>
      </div>
      
      <div class="migration-zone" id="migration-zone">
        <div class="migration-arrows-container">
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        </div>
        <div class="migration-action-text">Click to Migrate Selected Objects</div>
      </div>
      
      <div class="environment destination-environment">
        <h3 class="environment-title">Destination Tenant</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">Entra ID Users</h4>
            <div class="bucket-content" id="destination-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">Entra ID Security Groups</h4>
            <div class="bucket-content" id="destination-security-groups"></div>
          </div>
          <div class="bucket" data-type="sharepoint">
            <h4 class="bucket-title">SharePoint Online</h4>
            <div class="bucket-content" id="destination-sharepoint"></div>
          </div>
          <div class="bucket" data-type="teams">
            <h4 class="bucket-title">Teams</h4>
            <div class="bucket-content" id="destination-teams"></div>
          </div>
          <div class="bucket" data-type="onedrive">
            <h4 class="bucket-title">OneDrive</h4>
            <div class="bucket-content" id="destination-onedrive"></div>
          </div>
          <div class="bucket" data-type="m365-groups">
            <h4 class="bucket-title">M365 Groups</h4>
            <div class="bucket-content" id="destination-m365-groups"></div>
          </div>
          <div class="bucket" data-type="mailboxes">
            <h4 class="bucket-title">Mailboxes</h4>
            <div class="bucket-content" id="destination-mailboxes"></div>
          </div>
          <div class="bucket" data-type="power-automate">
            <h4 class="bucket-title">Power Automate</h4>
            <div class="bucket-content" id="destination-power-automate"></div>
          </div>
          <div class="bucket" data-type="power-apps">
            <h4 class="bucket-title">Power Apps</h4>
            <div class="bucket-content" id="destination-power-apps"></div>
          </div>
          <div class="bucket" data-type="power-bi">
            <h4 class="bucket-title">Power BI</h4>
            <div class="bucket-content" id="destination-power-bi"></div>
          </div>
        </div>
      </div>
    `
  },
  'file-shares': {
    title: 'File Shares to SharePoint Online Migration',
    visualizerClass: FileSharesVisualizer,
    template: `
      <div class="environment source-environment">
        <h3 class="environment-title">On-Premises Environment</h3>
        <div class="bucket-container file-shares-layout">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">AD Users</h4>
            <div class="bucket-content" id="source-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">AD Security Groups</h4>
            <div class="bucket-content" id="source-security-groups"></div>
          </div>
          <div class="bucket" data-type="file-shares">
            <h4 class="bucket-title">File Shares</h4>
            <div class="bucket-content" id="source-file-shares"></div>
          </div>
        </div>
      </div>
      
      <div class="migration-zone" id="migration-zone">
        <div class="migration-arrows-container">
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        </div>
        <div class="migration-action-text">Click to Migrate Selected Objects</div>
      </div>
      
      <div class="environment destination-environment">
        <h3 class="environment-title">Microsoft 365</h3>
        <div class="bucket-container file-shares-layout">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">Entra ID Users</h4>
            <div class="bucket-content" id="destination-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">Entra ID Security Groups</h4>
            <div class="bucket-content" id="destination-security-groups"></div>
          </div>
          <div class="bucket" data-type="sharepoint-sites">
            <h4 class="bucket-title">SharePoint Online Sites</h4>
            <div class="bucket-content" id="destination-sharepoint-sites"></div>
          </div>
        </div>
      </div>
    `
  },
  'sharepoint-onprem': {
    title: 'SharePoint On-Premises to Microsoft 365 Migration',
    visualizerClass: SharePointOnPremVisualizer,
    template: `
      <div class="environment source-environment">
        <h3 class="environment-title">SharePoint On-Premises</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">AD Users</h4>
            <div class="bucket-content" id="source-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">AD Security Groups</h4>
            <div class="bucket-content" id="source-security-groups"></div>
          </div>
          <div class="bucket" data-type="sharepoint-sites">
            <h4 class="bucket-title">SharePoint Sites</h4>
            <div class="bucket-content" id="source-sharepoint-sites"></div>
          </div>
          <div class="bucket" data-type="infopath-forms">
            <h4 class="bucket-title">InfoPath Forms</h4>
            <div class="bucket-content" id="source-infopath-forms"></div>
          </div>
          <div class="bucket" data-type="workflows">
            <h4 class="bucket-title">Workflows</h4>
            <div class="bucket-content" id="source-workflows"></div>
          </div>
        </div>
      </div>
      
      <div class="migration-zone" id="migration-zone">
        <div class="migration-arrows-container">
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        </div>
        <div class="migration-action-text">Click to Migrate Selected Objects</div>
      </div>
      
      <div class="environment destination-environment">
        <h3 class="environment-title">Microsoft 365</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="users">
            <h4 class="bucket-title">Entra ID Users</h4>
            <div class="bucket-content" id="destination-users"></div>
          </div>
          <div class="bucket" data-type="security-groups">
            <h4 class="bucket-title">Entra ID Security Groups</h4>
            <div class="bucket-content" id="destination-security-groups"></div>
          </div>
          <div class="bucket" data-type="sharepoint-online">
            <h4 class="bucket-title">SharePoint Online</h4>
            <div class="bucket-content" id="destination-sharepoint-online"></div>
          </div>
          <div class="bucket" data-type="power-apps">
            <h4 class="bucket-title">Power Apps</h4>
            <div class="bucket-content" id="destination-power-apps"></div>
          </div>
          <div class="bucket" data-type="power-automate">
            <h4 class="bucket-title">Power Automate</h4>
            <div class="bucket-content" id="destination-power-automate"></div>
          </div>
        </div>
      </div>
    `
  },
  'google-workspace': {
    title: 'Google Workspace to Microsoft 365 Migration',
    visualizerClass: GoogleWorkspaceVisualizer,
    template: `
      <div class="environment source-environment">
        <h3 class="environment-title">Google Workspace</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="google-users">
            <h4 class="bucket-title">Google Users</h4>
            <div class="bucket-content" id="source-google-users"></div>
          </div>
          <div class="bucket" data-type="google-groups">
            <h4 class="bucket-title">Google Groups</h4>
            <div class="bucket-content" id="source-google-groups"></div>
          </div>
          <div class="bucket" data-type="google-mailboxes">
            <h4 class="bucket-title">Gmail</h4>
            <div class="bucket-content" id="source-google-mailboxes"></div>
          </div>
          <div class="bucket" data-type="google-shared-drives">
            <h4 class="bucket-title">Shared Drives</h4>
            <div class="bucket-content" id="source-google-shared-drives"></div>
          </div>
          <div class="bucket" data-type="google-drives">
            <h4 class="bucket-title">Google Drive</h4>
            <div class="bucket-content" id="source-google-drives"></div>
          </div>
        </div>
      </div>
      
      <div class="migration-zone" id="migration-zone">
        <div class="migration-arrows-container">
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        </div>
        <div class="migration-action-text">Click to Migrate Selected Objects</div>
      </div>
      
      <div class="environment destination-environment">
        <h3 class="environment-title">Microsoft 365</h3>
        <div class="bucket-container">
          <div class="bucket" data-type="entra-users">
            <h4 class="bucket-title">Entra ID Users</h4>
            <div class="bucket-content" id="destination-entra-users"></div>
          </div>
          <div class="bucket" data-type="entra-groups">
            <h4 class="bucket-title">Entra ID Security Groups</h4>
            <div class="bucket-content" id="destination-entra-groups"></div>
          </div>
          <div class="bucket" data-type="exchange-online">
            <h4 class="bucket-title">Exchange Online</h4>
            <div class="bucket-content" id="destination-exchange-online"></div>
          </div>
          <div class="bucket" data-type="sharepoint-online">
            <h4 class="bucket-title">SharePoint Online</h4>
            <div class="bucket-content" id="destination-sharepoint-online"></div>
          </div>
          <div class="bucket" data-type="onedrive">
            <h4 class="bucket-title">OneDrive</h4>
            <div class="bucket-content" id="destination-onedrive"></div>
          </div>
        </div>
      </div>
    `
  }
};

// Register visualizers
visualizerRegistry.register('tenant-to-tenant', TenantToTenantVisualizer);
visualizerRegistry.register('file-shares', FileSharesVisualizer);
visualizerRegistry.register('sharepoint-onprem', SharePointOnPremVisualizer);
visualizerRegistry.register('google-workspace', GoogleWorkspaceVisualizer);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Get concept from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const concept = urlParams.get('concept') || 'tenant-to-tenant';
    
    // Validate concept
    if (!CONCEPTS[concept]) {
      console.error(`Unknown concept: ${concept}`);
      showError(`Unknown migration concept: ${concept}`);
      return;
    }
    
    const conceptConfig = CONCEPTS[concept];
    
    // Update page title and navigation
    updatePageTitle(conceptConfig.title);
    updateNavigation(concept);
    
    // Load the template for this concept
    loadTemplate(conceptConfig.template);
    
    // Create and initialize the visualizer
    const visualizer = visualizerRegistry.create(concept);
    
    // Make it globally available for migration zone (temporary for compatibility)
    window.migrationVisualizer = visualizer;
    
    // Initialize the visualizer
    await visualizer.init();
    
    // Initialize migration zone
    initializeMigrationZone();
    adjustArrowsForScreenSize();
    
    // Make visualizer available globally for debugging
    if (window.DEBUG || localStorage.getItem('debug') === 'true') {
      window.visualizer = visualizer;
    }
  } catch (error) {
    console.error('Failed to initialize generic visualizer:', error);
    showError('Failed to initialize migration visualizer. Please try refreshing the page.');
  }
});

/**
 * Update page title
 */
function updatePageTitle(title) {
  document.title = title;
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

/**
 * Update navigation active state
 */
function updateNavigation(concept) {
  // Remove active class from all nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current concept
  const currentNavLink = document.getElementById(`nav-${concept}`);
  if (currentNavLink) {
    currentNavLink.classList.add('active');
  }
}

/**
 * Load template HTML into the migration container
 */
function loadTemplate(template) {
  const migrationContainer = document.getElementById('migration-container');
  if (migrationContainer) {
    migrationContainer.innerHTML = template.trim();
  }
}

/**
 * Show error message
 */
function showError(message) {
  // Create error message element if it doesn't exist
  let errorElement = document.getElementById('error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'error-message';
    document.querySelector('.visualizer-main').prepend(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}