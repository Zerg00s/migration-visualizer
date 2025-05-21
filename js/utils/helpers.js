/**
 * Utility functions for the Migration Visualizer
 */

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Format date to locale string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning)
 */
export function showNotification(message, type = 'success') {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector('.notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Add animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Set up removal
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

/**
 * Add notification styles to the document
 */
export function addNotificationStyles() {
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .notification {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 12px 16px;
        width: 300px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 4px solid #1e88e5;
      }
      
      .notification.success {
        border-left-color: #43a047;
      }
      
      .notification.error {
        border-left-color: #e53935;
      }
      
      .notification.warning {
        border-left-color: #ffb300;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #757575;
        margin-left: 10px;
      }
      
      .notification-close:hover {
        color: #212121;
      }
    `;
    document.head.appendChild(style);
  }
}