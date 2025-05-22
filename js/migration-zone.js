/**
 * Migration Zone functionality
 * Handles the clickable migration area between environments
 */

export function initializeMigrationZone() {
    const migrationZone = document.getElementById('migration-zone');
    
    if (!migrationZone) {
        console.warn('Migration zone not found');
        return;
    }
    
    // Handle migration zone click
    migrationZone.addEventListener('click', handleMigrationZoneClick);
    
    // Update migration zone state based on selection
    document.addEventListener('selectionChanged', updateMigrationZoneState);
    
    // Update initial state
    updateMigrationZoneState();
}

/**
 * Handle click on migration zone
 */
function handleMigrationZoneClick(event) {
    event.preventDefault();
    
    const migrationZone = event.currentTarget;
    
    // Check if we have selected objects
    if (!migrationZone.classList.contains('has-selection')) {
        return;
    }
    
    // Check if migration is already in progress
    if (migrationZone.classList.contains('migrating')) {
        return;
    }
    
    // Get the visualizer instance and trigger migration directly
    const selectedObjects = document.querySelectorAll('.object-circle.selected');
    if (selectedObjects.length > 0) {
        // Add visual feedback
        migrationZone.classList.add('migrating');
        
        // Trigger migration through the global visualizer instance
        if (window.migrationVisualizer) {
            window.migrationVisualizer.migrateSelectedObjects();
        }
        
        // Remove migrating state after animation
        setTimeout(() => {
            migrationZone.classList.remove('migrating');
        }, 2000);
    }
}

/**
 * Update migration zone visual state based on current selection
 */
function updateMigrationZoneState() {
    const migrationZone = document.getElementById('migration-zone');
    const selectedCount = document.querySelectorAll('.object-circle.selected').length;
    
    if (!migrationZone) return;
    
    if (selectedCount > 0) {
        migrationZone.classList.add('has-selection');
        migrationZone.setAttribute('title', `Click to migrate ${selectedCount} selected object${selectedCount === 1 ? '' : 's'}`);
    } else {
        migrationZone.classList.remove('has-selection');
        migrationZone.setAttribute('title', 'Select objects to enable migration');
    }
}

/**
 * Update arrow animations based on migration state
 * @param {boolean} isActive - Whether migration is active
 */
export function updateMigrationArrows(isActive = false) {
    const arrows = document.querySelectorAll('.migration-arrow');
    const migrationZone = document.getElementById('migration-zone');
    
    if (isActive) {
        migrationZone?.classList.add('migrating');
        // Removed crazy jumping animation - arrows now stay calm during migration
    } else {
        migrationZone?.classList.remove('migrating');
        arrows.forEach(arrow => {
            arrow.style.animation = ''; // Reset to CSS default
        });
    }
}

/**
 * Create particle effect when migration happens
 * @param {HTMLElement} sourceElement - Source object element
 * @param {HTMLElement} targetElement - Target bucket element
 */
export function createMigrationParticles(sourceElement, targetElement) {
    const migrationZone = document.getElementById('migration-zone');
    if (!migrationZone || !sourceElement || !targetElement) return;
    
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const zoneRect = migrationZone.getBoundingClientRect();
    
    // Create particle elements
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'migration-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background-color: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${sourceRect.left + sourceRect.width / 2}px;
            top: ${sourceRect.top + sourceRect.height / 2}px;
            opacity: 1;
            transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle through migration zone to target
        setTimeout(() => {
            const randomOffset = (Math.random() - 0.5) * 40;
            particle.style.left = `${targetRect.left + targetRect.width / 2 + randomOffset}px`;
            particle.style.top = `${targetRect.top + targetRect.height / 2 + randomOffset}px`;
            particle.style.opacity = '0';
            particle.style.transform = 'scale(2)';
        }, i * 50);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000 + (i * 50));
    }
}

/**
 * Calculate optimal number of arrows - fixed at 5
 */
function calculateArrowCount() {
    // Always return 5 arrows regardless of screen size
    return 5;
}

/**
 * Dynamically adjust arrow count based on screen size
 */
export function adjustArrowsForScreenSize() {
    const arrowContainer = document.querySelector('.migration-arrows-container');
    if (!arrowContainer) return;
    
    const optimalCount = calculateArrowCount();
    const currentArrows = arrowContainer.querySelectorAll('.migration-arrow');
    
    // Remove excess arrows
    if (currentArrows.length > optimalCount) {
        for (let i = optimalCount; i < currentArrows.length; i++) {
            currentArrows[i].remove();
        }
    }
    
    // Add missing arrows
    if (currentArrows.length < optimalCount) {
        for (let i = currentArrows.length; i < optimalCount; i++) {
            const arrow = document.createElement('div');
            arrow.className = 'migration-arrow';
            arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
            arrow.style.animationDelay = `${i * 0.2}s`;
            arrowContainer.appendChild(arrow);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeMigrationZone();
    adjustArrowsForScreenSize();
});

// Adjust arrows on window resize
window.addEventListener('resize', adjustArrowsForScreenSize);