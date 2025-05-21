/**
 * D3-based Connections visualization functionality
 */

/**
 * Update the connections visualization
 * @param {Object} svg - D3 selection for SVG element
 * @param {Array} connections - Connection data
 * @param {Set} selectedObjects - Set of selected object IDs
 * @param {boolean} showAllConnections - Whether to show all connections
 * @param {Function} drawConnection - Function to draw a single connection
 */
export function updateConnections(svg, connections, selectedObjects, showAllConnections, drawConnection) {
  // Clear existing connections
  svg.selectAll('.connection-line, .connections-group').remove();
  
  // Get link data for visualization
  const linkData = prepareConnectionData(connections, selectedObjects, showAllConnections);
  
  // Draw connections using D3
  drawConnections(svg, linkData, selectedObjects);
}

/**
 * Prepare data for connections
 * @param {Array} connections - Connection data
 * @param {Set} selectedObjects - Set of selected object IDs
 * @param {boolean} showAllConnections - Whether to show all connections
 * @returns {Array} Array of link data for D3
 */
function prepareConnectionData(connections, selectedObjects, showAllConnections) {
  const linkData = [];
  
  // Define which connections to show
  const connectionsToShow = showAllConnections ? 
    connections : 
    connections.filter(conn => {
      const sourceId = conn.source;
      const targetId = conn.target;
      
      return Array.from(selectedObjects).some(selectedId => {
        const selectedBasicId = selectedId.split('-')[1];
        return selectedBasicId === sourceId || selectedBasicId === targetId;
      });
    });
  
  // Get the SVG container's position for offset calculation
  const svgContainer = document.getElementById('svg-container');
  const svgRect = svgContainer.getBoundingClientRect();
  const containerOffsetX = svgRect.left;
  const containerOffsetY = svgRect.top;
  
  // Create link data for D3
  connectionsToShow.forEach(conn => {
    // Get all potential elements
    const sourceElements = [
      document.querySelector(`#source-${conn.source}`),
      document.querySelector(`#destination-${conn.source}`)
    ].filter(Boolean);
    
    const targetElements = [
      document.querySelector(`#source-${conn.target}`),
      document.querySelector(`#destination-${conn.target}`)
    ].filter(Boolean);
    
    // Check if source or target objects are migrated
    const sourceMigrated = document.querySelector(`#destination-${conn.source}`) !== null;
    const targetMigrated = document.querySelector(`#destination-${conn.target}`) !== null;
    
    // Create connections based on migration status
    if (sourceMigrated && targetMigrated) {
      // If both are migrated, only show connection in destination
      const sourceEl = document.querySelector(`#destination-${conn.source}`);
      const targetEl = document.querySelector(`#destination-${conn.target}`);
      if (sourceEl && targetEl) {
        addConnectionToLinkData(sourceEl, targetEl, conn, linkData, containerOffsetX, containerOffsetY, selectedObjects);
      }
    } else if (sourceMigrated && !targetMigrated) {
      // If source is migrated but target is not, show cross-environment connection
      const sourceEl = document.querySelector(`#destination-${conn.source}`);
      const targetEl = document.querySelector(`#source-${conn.target}`);
      if (sourceEl && targetEl) {
        addConnectionToLinkData(sourceEl, targetEl, conn, linkData, containerOffsetX, containerOffsetY, selectedObjects, true);
      }
    } else if (!sourceMigrated && targetMigrated) {
      // If target is migrated but source is not, show cross-environment connection
      const sourceEl = document.querySelector(`#source-${conn.source}`);
      const targetEl = document.querySelector(`#destination-${conn.target}`);
      if (sourceEl && targetEl) {
        addConnectionToLinkData(sourceEl, targetEl, conn, linkData, containerOffsetX, containerOffsetY, selectedObjects, true);
      }
    } else {
      // If neither is migrated, show connection in source only
      const sourceEl = document.querySelector(`#source-${conn.source}`);
      const targetEl = document.querySelector(`#source-${conn.target}`);
      if (sourceEl && targetEl) {
        addConnectionToLinkData(sourceEl, targetEl, conn, linkData, containerOffsetX, containerOffsetY, selectedObjects);
      }
    }
  });
  
  return linkData;
}

/**
 * Helper function to add a connection to the link data
 * @param {HTMLElement} sourceEl - Source element
 * @param {HTMLElement} targetEl - Target element
 * @param {Object} conn - Connection data
 * @param {Array} linkData - Link data array to add to
 * @param {number} containerOffsetX - Container X offset
 * @param {number} containerOffsetY - Container Y offset
 * @param {Set} selectedObjects - Set of selected object IDs
 * @param {boolean} isCrossEnvironment - Whether this is a cross-environment connection
 */
function addConnectionToLinkData(sourceEl, targetEl, conn, linkData, containerOffsetX, containerOffsetY, selectedObjects, isCrossEnvironment = false) {
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  
  // Get element positions relative to SVG container
  const source = {
    x: sourceRect.left + sourceRect.width / 2 - containerOffsetX,
    y: sourceRect.top + sourceRect.height / 2 - containerOffsetY,
    id: sourceEl.id,
    environment: sourceEl.getAttribute('data-environment')
  };
  
  const target = {
    x: targetRect.left + targetRect.width / 2 - containerOffsetX,
    y: targetRect.top + targetRect.height / 2 - containerOffsetY,
    id: targetEl.id,
    environment: targetEl.getAttribute('data-environment')
  };
  
  // Add to link data
  linkData.push({
    source,
    target,
    sameEnvironment: source.environment === target.environment,
    isCrossEnvironment: isCrossEnvironment,
    selected: selectedObjects.has(sourceEl.id) || selectedObjects.has(targetEl.id),
    connectionData: conn
  });
}

/**
 * Draw connections using D3
 * @param {Object} svg - D3 selection for SVG element
 * @param {Array} linkData - Prepared link data for D3
 * @param {Set} selectedObjects - Set of selected object IDs
 */
function drawConnections(svg, linkData, selectedObjects) {
  // Clear existing connections
  svg.selectAll('.connections-group').remove();
  
  // Create group for all connections
  const linksGroup = svg.append('g')
    .attr('class', 'connections-group');
  
  // Draw connections
  linkData.forEach(link => {
    // Create path generator based on connection type
    const pathGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(link.sameEnvironment ? d3.curveLinear : d3.curveBasis);
    
    // Calculate control points for curved connections
    const points = calculatePathPoints(link.source, link.target, link.sameEnvironment);
    
    // Generate base CSS classes
    let cssClasses = 'connection-line';
    
    // If this is a cross-environment connection (either explicit or different environments)
    if (link.isCrossEnvironment || !link.sameEnvironment) {
      cssClasses += ' cross-environment';
    }
    
    // If connection is selected
    if (link.selected) {
      cssClasses += ' highlighted';
    }
    
    // Create path
    const path = linksGroup.append('path')
      .attr('class', cssClasses)
      .attr('d', pathGenerator(points))
      .attr('stroke', getConnectionColor(link.source.environment, link.target.environment))
      .attr('stroke-width', link.selected ? 3 : 2)
      .attr('fill', 'none')
      .attr('opacity', link.selected ? 1 : 0.8);
    
    // Add unique identifier
    path.attr('id', `connection-${link.source.id}-${link.target.id}`);
  });
}

/**
 * Calculate path points for connection
 * @param {Object} source - Source position data
 * @param {Object} target - Target position data
 * @param {boolean} sameEnvironment - Whether source and target are in the same environment
 * @returns {Array} Array of points for path
 */
function calculatePathPoints(source, target, sameEnvironment) {
  if (sameEnvironment) {
    // Direct line for same environment
    return [
      { x: source.x, y: source.y },
      { x: target.x, y: target.y }
    ];
  }
  
  // For curved paths, add control points
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const midX = source.x + dx / 2;
  
  // For horizontal curves, use horizontal control points
  return [
    { x: source.x, y: source.y },
    { x: midX, y: source.y },
    { x: midX, y: target.y },
    { x: target.x, y: target.y }
  ];
}

/**
 * Draw a connection line between two elements
 * Legacy method - delegates to the new system
 */
export function drawConnection(sourceEl, targetEl, connection, svg, selectedObjects) {
  // This function is kept for API compatibility but is no longer used directly
  // The connections are now drawn by the drawConnections function
}

/**
 * Get color for a connection based on the environments
 * @param {string} sourceEnv - Source environment
 * @param {string} targetEnv - Target environment
 * @returns {string} Color string
 */
export function getConnectionColor(sourceEnv, targetEnv) {
  // If both in source, use source color
  if (sourceEnv === 'source' && targetEnv === 'source') {
    return 'var(--source-color)';
  }
  
  // If both in destination, use destination color
  if (sourceEnv === 'destination' && targetEnv === 'destination') {
    return 'var(--destination-color)';
  }
  
  // Cross-environment connections
  return 'var(--secondary-color)';
}

/**
 * Legacy method to generate SVG path
 * Kept for compatibility
 */
export function generatePath(x1, y1, x2, y2, sameEnvironment) {
  // This function is kept for API compatibility
  if (sameEnvironment) {
    return `M${x1},${y1} L${x2},${y2}`;
  } else {
    const midX = (x1 + x2) / 2;
    return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  }
}

/**
 * Add connections for a newly added destination object
 * @param {string} objectId - Object ID
 * @param {Array} connections - Connections data reference
 */
export function addDestinationConnections(objectId, connections) {
  // Find all connections related to this object
  const relatedConnections = connections.filter(conn => 
    conn.source === objectId || conn.target === objectId
  );
  
  // For each connection, check what type of connection to create
  relatedConnections.forEach(conn => {
    const otherEndId = conn.source === objectId ? conn.target : conn.source;
    const destinationOtherEnd = document.querySelector(`#destination-${otherEndId}`);
    
    // If the other end exists in destination, create a connection between both destination objects
    if (destinationOtherEnd) {
      const newConn = conn.source === objectId ? 
        { source: objectId, target: otherEndId } : 
        { source: otherEndId, target: objectId };
      
      // Check if this connection already exists
      const exists = connections.some(c => 
        c.source === newConn.source && 
        c.target === newConn.target
      );
      
      // Add the new connection if it doesn't exist
      if (!exists) {
        connections.push(newConn);
      }
    }
    
    // For connections that don't have both ends migrated yet, 
    // no explicit cross-environment connection needs to be added
    // as the connection logic in prepareConnectionData will handle it
  });
}