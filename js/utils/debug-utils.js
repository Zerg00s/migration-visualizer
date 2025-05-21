/**
 * Debug utilities
 */

document.addEventListener('DOMContentLoaded', function() {
  // Make sure debug panel is visible
  const debugPanel = document.querySelector('.debug-panel');
  if (debugPanel) {
    // Add a debug info button
    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn-secondary';
    infoBtn.innerHTML = '<i class="fas fa-info-circle"></i> Debug Info';
    infoBtn.style.marginRight = '10px';
    
    infoBtn.addEventListener('click', () => {
      const debugOutput = document.getElementById('debug-output');
      if (debugOutput) {
        // Create info element
        const infoDiv = document.createElement('div');
        infoDiv.style.background = '#f8f8f8';
        infoDiv.style.padding = '10px';
        infoDiv.style.marginTop = '10px';
        infoDiv.style.border = '1px solid #ddd';
        infoDiv.style.borderRadius = '4px';
        
        // Get browser info
        const browserInfo = {
          userAgent: navigator.userAgent,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
        
        // Get container dimensions
        const containerRect = document.querySelector('.migration-container').getBoundingClientRect();
        
        // Display info
        infoDiv.innerHTML = `
          <h4>Debug Information</h4>
          <p><strong>Browser:</strong> ${browserInfo.userAgent}</p>
          <p><strong>Viewport:</strong> ${browserInfo.viewportWidth}x${browserInfo.viewportHeight}</p>
          <p><strong>Container:</strong> ${Math.round(containerRect.width)}x${Math.round(containerRect.height)} at (${Math.round(containerRect.left)},${Math.round(containerRect.top)})</p>
          <p><strong>Object Count:</strong> ${document.querySelectorAll('.object-circle').length}</p>
          <p><strong>Z-Index Test:</strong> <span id="z-index-test">Testing...</span></p>
        `;
        
        // Append to output
        debugOutput.innerHTML = '';
        debugOutput.appendChild(infoDiv);
        
        // Test z-index stacking
        setTimeout(() => {
          const zIndexTest = document.getElementById('z-index-test');
          if (zIndexTest) {
            // Create a test element
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.zIndex = '1000';
            testElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            testElement.style.width = '50px';
            testElement.style.height = '50px';
            testElement.style.left = `${containerRect.left + 100}px`;
            testElement.style.top = `${containerRect.top + 100}px`;
            
            document.body.appendChild(testElement);
            
            // Remove after 2 seconds
            setTimeout(() => {
              if (testElement.parentNode) {
                testElement.parentNode.removeChild(testElement);
              }
              zIndexTest.textContent = 'Complete';
            }, 2000);
            
            zIndexTest.textContent = 'Test element created';
          }
        }, 500);
      }
    });
    
    debugPanel.appendChild(infoBtn);
  }
});
