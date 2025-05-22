/**
 * SharePoint On-Premises Data loader for Migration Visualizer
 * Loads data from JSON file and formats it for SharePoint on-premises migration visualization
 */

/**
 * Load SharePoint on-premises migration data from JSON file
 * @returns {Promise<Object>} The loaded migration data
 */
export async function loadSharePointOnPremData() {
  try {
    const response = await fetch('data/sharepoint-onprem-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load SharePoint on-premises data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading SharePoint on-premises data:', error);
    throw error;
  }
}

/**
 * Extract user objects from SharePoint on-premises data (AD Users)
 * @param {Object} data - The migration data
 * @returns {Array} Array of user objects formatted for visualization
 */
export function extractADUsers(data) {
  return data.Users.map(user => ({
    id: user.id,
    name: user.DisplayName,
    type: 'user',
    color: '#64b5f6',
    icon: 'fa-user',
    department: user.Department,
    email: user.Email,
    title: user.Title,
    samAccountName: user.SamAccountName,
    domain: user.Domain,
    accountStatus: user.AccountStatus
  }));
}

/**
 * Extract security group objects from SharePoint on-premises data (AD Security Groups)
 * @param {Object} data - The migration data
 * @returns {Array} Array of security group objects formatted for visualization
 */
export function extractADSecurityGroups(data) {
  return data.SecurityGroups.map(group => ({
    id: group.id,
    name: group.DisplayName,
    type: 'group',
    color: '#7e57c2',
    icon: 'fa-users',
    description: group.Description,
    members: group.Members,
    samAccountName: group.SamAccountName,
    domain: group.Domain,
    groupType: group.GroupType,
    groupScope: group.GroupScope
  }));
}

/**
 * Extract SharePoint site objects from SharePoint on-premises data
 * @param {Object} data - The migration data
 * @returns {Array} Array of SharePoint site objects formatted for visualization
 */
export function extractSharePointSites(data) {
  return data.SharePointSites.map(site => ({
    id: site.id,
    name: site.DisplayName,
    type: 'sharepoint-onprem',
    color: '#2e7d32',
    icon: 'fa-server',
    description: site.Description,
    url: site.URL,
    server: site.Server,
    templateType: site.TemplateType,
    webApplication: site.WebApplication,
    contentDatabase: site.ContentDatabase,
    owners: site.Owners,
    members: site.Members,
    visitors: site.Visitors,
    storageUsed: site.StorageUsed,
    listCount: site.ListCount,
    pageViews: site.PageViews,
    sharepointVersion: site.SharePointVersion
  }));
}

/**
 * Extract InfoPath form objects from SharePoint on-premises data
 * @param {Object} data - The migration data
 * @returns {Array} Array of InfoPath form objects formatted for visualization
 */
export function extractInfoPathForms(data) {
  return data.InfoPathForms.map(form => ({
    id: form.id,
    name: form.DisplayName,
    type: 'infopath-form',
    color: '#607d8b',
    icon: 'fa-wpforms',
    description: form.Description,
    formTemplate: form.FormTemplate,
    connectedSite: form.ConnectedSite,
    formLibrary: form.FormLibrary,
    createdBy: form.CreatedBy,
    formVersion: form.FormVersion,
    dataConnections: form.DataConnections,
    submissionCount: form.SubmissionCount,
    status: form.Status,
    browserEnabled: form.BrowserEnabled
  }));
}

/**
 * Extract workflow objects from SharePoint on-premises data
 * @param {Object} data - The migration data
 * @returns {Array} Array of workflow objects formatted for visualization
 */
export function extractWorkflows(data) {
  return data.Workflows.map(workflow => ({
    id: workflow.id,
    name: workflow.DisplayName,
    type: 'workflow',
    color: '#9c27b0',
    icon: 'fa-project-diagram',
    description: workflow.Description,
    workflowType: workflow.WorkflowType,
    connectedSite: workflow.ConnectedSite,
    associatedList: workflow.AssociatedList,
    createdBy: workflow.CreatedBy,
    workflowVersion: workflow.WorkflowVersion,
    status: workflow.Status,
    instancesRunning: workflow.InstancesRunning,
    instancesCompleted: workflow.InstancesCompleted,
    instancesError: workflow.InstancesError,
    approvalSteps: workflow.ApprovalSteps
  }));
}

/**
 * Generate connections based on the relationships in the SharePoint on-premises data
 * @param {Object} data - The migration data
 * @returns {Array} Array of connection objects
 */
export function generateSharePointOnPremConnections(data) {
  let connections = [];
  
  // Add security group membership connections
  data.SecurityGroups.forEach(group => {
    group.Members.forEach(userId => {
      connections.push({
        source: userId,
        target: group.id
      });
    });
  });
  
  // Add SharePoint site permissions connections
  data.SharePointSites.forEach(site => {
    // Connect owners
    site.Owners.forEach(userId => {
      connections.push({
        source: userId,
        target: site.id
      });
    });
    
    // Connect members (groups)
    site.Members.forEach(memberId => {
      connections.push({
        source: memberId,
        target: site.id
      });
    });
    
    // Connect visitors (groups)
    site.Visitors.forEach(visitorId => {
      connections.push({
        source: visitorId,
        target: site.id
      });
    });
  });
  
  // Add InfoPath form connections to SharePoint sites
  data.InfoPathForms.forEach(form => {
    // Connect form creator
    connections.push({
      source: form.CreatedBy,
      target: form.id
    });
    
    // Connect form to its SharePoint site
    connections.push({
      source: form.id,
      target: form.ConnectedSite
    });
  });
  
  // Add workflow connections to SharePoint sites
  data.Workflows.forEach(workflow => {
    // Connect workflow creator
    connections.push({
      source: workflow.CreatedBy,
      target: workflow.id
    });
    
    // Connect workflow to its SharePoint site
    connections.push({
      source: workflow.id,
      target: workflow.ConnectedSite
    });
  });
  
  return connections;
}

/**
 * Get all objects from SharePoint on-premises migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all objects for visualization
 */
export function getAllSharePointOnPremObjects(data) {
  return [
    ...extractADUsers(data),
    ...extractADSecurityGroups(data),
    ...extractSharePointSites(data),
    ...extractInfoPathForms(data),
    ...extractWorkflows(data)
  ];
}

/**
 * Get all connections from SharePoint on-premises migration data
 * @param {Object} data - The migration data
 * @returns {Array} Array of all connections for visualization
 */
export function getAllSharePointOnPremConnections(data) {
  return generateSharePointOnPremConnections(data);
}