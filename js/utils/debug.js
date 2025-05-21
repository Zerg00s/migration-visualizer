/**
 * Debug utilities for development
 */

// Create debug toggle button
document.addEventListener('DOMContentLoaded', function() {
  const body = document.body;
  const debugOutput = document.getElementById('debug-output');
  
  // Create toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'debug-toggle';
  toggleBtn.innerHTML = '<i class="fas fa-bug"></i>';
  toggleBtn.addEventListener('click', function() {
    body.classList.toggle('debug-mode');
  });
  
  document.body.appendChild(toggleBtn);
  
  // Log object counts
  window.debugObjectCounts = function() {
    const counters = {};
    
    document.querySelectorAll('.object-circle').forEach(el => {
      const type = el.getAttribute('data-type');
      const env = el.getAttribute('data-environment');
      const key = `${env}-${type}`;
      
      if (!counters[key]) counters[key] = 0;
      counters[key]++;
    });
    
    let output = "Object Counts:\n";
    Object.keys(counters).sort().forEach(key => {
      output += `${key}: ${counters[key]}\n`;
    });
    
    if (debugOutput) {
      debugOutput.textContent = output;
    }
    
    console.log(output);
    return counters;
  };
  
  // Add keystroke shortcut: Ctrl+Shift+D to toggle debug mode
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      body.classList.toggle('debug-mode');
      window.debugObjectCounts();
      e.preventDefault();
    }
  });
});