/**
 * Data models for the Migration Visualizer
 */

/**
 * Security Groups data
 */
export const securityGroups = [
  { id: 'sg-it', name: 'IT', color: '#7e57c2' },
  { id: 'sg-hr', name: 'HR', color: '#7e57c2' },
  { id: 'sg-finance', name: 'Finance', color: '#7e57c2' },
  { id: 'sg-engineers', name: 'Engineers', color: '#7e57c2' },
  { id: 'sg-everyone', name: 'Everyone', color: '#7e57c2' }
];

/**
 * User data
 */
export const users = [
  { id: 'user-1', name: 'John Doe', department: 'IT', email: 'john.doe@example.com' },
  { id: 'user-2', name: 'Jane Smith', department: 'IT', email: 'jane.smith@example.com' },
  { id: 'user-3', name: 'Alice Brown', department: 'HR', email: 'alice.brown@example.com' },
  { id: 'user-4', name: 'Bob Johnson', department: 'HR', email: 'bob.johnson@example.com' },
  { id: 'user-5', name: 'Charlie Davis', department: 'Finance', email: 'charlie.davis@example.com' },
  { id: 'user-6', name: 'Diana Evans', department: 'Finance', email: 'diana.evans@example.com' },
  { id: 'user-7', name: 'Eric Wilson', department: 'Engineers', email: 'eric.wilson@example.com' },
  { id: 'user-8', name: 'Fiona Garcia', department: 'Engineers', email: 'fiona.garcia@example.com' },
  { id: 'user-9', name: 'George Hill', department: 'Marketing', email: 'george.hill@example.com' },
  { id: 'user-10', name: 'Helen King', department: 'Sales', email: 'helen.king@example.com' }
];

/**
 * Connection data - which users belong to which groups
 */
export const initialConnections = [
  // IT department
  { source: 'user-1', target: 'sg-it' },
  { source: 'user-2', target: 'sg-it' },
  
  // HR department
  { source: 'user-3', target: 'sg-hr' },
  { source: 'user-4', target: 'sg-hr' },
  
  // Finance department
  { source: 'user-5', target: 'sg-finance' },
  { source: 'user-6', target: 'sg-finance' },
  
  // Engineers department
  { source: 'user-7', target: 'sg-engineers' },
  { source: 'user-8', target: 'sg-engineers' },
  
  // Everyone group - all users connected
  { source: 'user-1', target: 'sg-everyone' },
  { source: 'user-2', target: 'sg-everyone' },
  { source: 'user-3', target: 'sg-everyone' },
  { source: 'user-4', target: 'sg-everyone' },
  { source: 'user-5', target: 'sg-everyone' },
  { source: 'user-6', target: 'sg-everyone' },
  { source: 'user-7', target: 'sg-everyone' },
  { source: 'user-8', target: 'sg-everyone' },
  { source: 'user-9', target: 'sg-everyone' },
  { source: 'user-10', target: 'sg-everyone' }
];