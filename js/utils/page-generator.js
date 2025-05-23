/**
 * Migration Page Generator
 * Dynamically generates HTML structure based on migration concept definition
 */

export class MigrationPageGenerator {
  constructor(conceptDefinition) {
    this.concept = conceptDefinition;
  }
  
  /**
   * Generate the complete page HTML
   */
  generatePageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.concept.name} Visualizer</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/status-indicators.css">
    <link rel="stylesheet" href="css/details-panel.css">
    <link rel="stylesheet" href="css/selection-box.css">
    <link rel="stylesheet" href="css/migration-animations.css">
    <link rel="stylesheet" href="css/migration-zone.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <div id="loading-indicator" class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading migration data...</p>
            </div>
            <nav>
                <div class="logo">
                    <h1><i class="fas fa-project-diagram"></i> Migration Visualizer</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="tenant-to-tenant.html">Tenant-to-Tenant</a></li>
                    <li><a href="file-shares.html">File Shares</a></li>
                    <li><a href="sharepoint-onprem.html">On-Prem SharePoint</a></li>
                    <li><a href="google-workspace.html">Google Workspace</a></li>
                </ul>
            </nav>
        </header>

        <main class="visualizer-main">
            <div class="visualizer-header">
                <h2>${this.concept.name}</h2>
                
                <div class="controls">
                    <button id="toggle-connections" class="btn-secondary">
                        <i class="fas fa-network-wired"></i> Show All Connections
                    </button>
                    <button id="reset" class="btn-warning">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>

            <div class="visualizer-content">
                <div class="object-details">
                    <h3>Selected Object Details</h3>
                    <div id="object-details-content">
                        <p>Select an object to view its details and connections</p>
                    </div>
                </div>

                <div class="migration-container">
                ${this.generateEnvironmentHTML('source', this.concept.sourceEnvironment)}
                
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
                
                ${this.generateEnvironmentHTML('destination', this.concept.targetEnvironment)}
                
                <!-- SVG container moved inside the migration container for proper positioning -->
                <div id="svg-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    <svg id="connections-svg" class="connections-layer" width="100%" height="100%"></svg>
                </div>
            </div>
            
            </div> <!-- Close visualizer-content -->
        </main>

        <footer>
            <div class="footer-content">
                <div class="footer-info">
                    <p>&copy; 2025 Migration Visualizer. By Denis Molodtsov with 💗</p>
                </div>
                <div class="footer-links">
                    <a href="index.html">Home</a>
                    <a href="tenant-to-tenant.html">Tenant-to-Tenant</a>
                    <a href="file-shares.html">File Shares</a>
                    <a href="sharepoint-onprem.html">On-Prem SharePoint</a>
                    <a href="google-workspace.html">Google Workspace</a>
                </div>
            </div>
        </footer>
    </div>

    <script type="module">
        import { createMigrationVisualizer } from './js/visualizers/generic-migration.js';
        import { initializeMigrationZone, adjustArrowsForScreenSize } from './js/migration-zone.js';
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // Create and initialize the visualizer
                const visualizer = await createMigrationVisualizer('${this.concept.id}');
                
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
                console.error('Failed to initialize visualizer:', error);
            }
        });
    </script>
</body>
</html>`;
  }
  
  /**
   * Generate HTML for an environment (source or destination)
   */
  generateEnvironmentHTML(envType, environment) {
    const envClass = envType === 'source' ? 'source-environment' : 'destination-environment';
    
    // Calculate grid layout
    const gridLayout = this.calculateGridLayout(environment.buckets);
    
    return `<div class="environment ${envClass}">
                    <h3 class="environment-title">${environment.title}</h3>
                    
                    <div class="bucket-container" style="${this.generateGridStyle(gridLayout)}">
                        ${environment.buckets.map(bucket => this.generateBucketHTML(bucket, envType)).join('\n                        ')}
                    </div>
                </div>`;
  }
  
  /**
   * Generate HTML for a bucket
   */
  generateBucketHTML(bucket, envType) {
    const bucketId = bucket.id;
    const gridArea = bucket.layout ? 
      `grid-column: ${bucket.layout.gridColumn} / span ${bucket.layout.width || 1}; grid-row: ${bucket.layout.gridRow} / span ${bucket.layout.height || 1};` : '';
    
    return `<div class="bucket" data-type="${bucket.objectType}" style="${gridArea}">
                            <h4 class="bucket-title">${bucket.title}</h4>
                            <div class="bucket-content" id="${bucketId}"></div>
                        </div>`;
  }
  
  /**
   * Calculate grid layout dimensions
   */
  calculateGridLayout(buckets) {
    let maxCol = 3;
    let maxRow = 1;
    
    buckets.forEach(bucket => {
      if (bucket.layout) {
        maxCol = Math.max(maxCol, bucket.layout.gridColumn + (bucket.layout.width || 1) - 1);
        maxRow = Math.max(maxRow, bucket.layout.gridRow + (bucket.layout.height || 1) - 1);
      }
    });
    
    return { columns: maxCol, rows: maxRow };
  }
  
  /**
   * Generate CSS grid style
   */
  generateGridStyle(gridLayout) {
    return `display: grid; grid-template-columns: repeat(${gridLayout.columns}, 1fr); grid-template-rows: repeat(${gridLayout.rows}, 1fr); gap: 1rem;`;
  }
  
  /**
   * Generate standalone CSS for custom layouts
   */
  generateCustomCSS() {
    let css = '';
    
    // Add any custom CSS based on the concept definition
    if (this.concept.customStyles) {
      css += this.concept.customStyles;
    }
    
    // Add object type specific colors
    Object.entries(this.concept.objectTypes).forEach(([typeKey, typeDefinition]) => {
      if (typeDefinition.color) {
        css += `
.object-circle.${typeKey} { background-color: ${typeDefinition.color}; }
.object-icon.${typeKey} { background-color: ${typeDefinition.color}; }
.connection-icon.${typeKey} { background-color: ${typeDefinition.color}; }
`;
      }
    });
    
    return css;
  }
}

/**
 * Create and save a migration page
 */
export async function generateMigrationPage(conceptId) {
  try {
    const response = await fetch(`data/migration-concepts/${conceptId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const conceptDefinition = await response.json();
    
    const generator = new MigrationPageGenerator(conceptDefinition);
    const html = generator.generatePageHTML();
    
    // Return the generated HTML
    return html;
  } catch (error) {
    console.error('Error generating migration page:', error);
    throw error;
  }
}
