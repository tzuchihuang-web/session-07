// State management for check-in
let checkInState = {
    currentMood: null,
    energyLevel: 5,
    date: new Date()
};

// Initialize the check-in page
document.addEventListener('DOMContentLoaded', () => {
    initializeMoodTracker();
    initializeEnergyTracker();
    updateCurrentDate();
});

// Update current date display
function updateCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', options);
}

// Mood Tracker Initialization
function initializeMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove previous selection
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selection to clicked button
            button.classList.add('selected');
            // Update state
            checkInState.currentMood = button.dataset.mood;
        });
    });
}

// Energy Tracker Initialization
function initializeEnergyTracker() {
    const energySlider = document.getElementById('energy-level');
    energySlider.addEventListener('input', () => {
        checkInState.energyLevel = parseInt(energySlider.value);
    });
}

// Save Check-in
document.getElementById('save-reflection').addEventListener('click', () => {
    const reflectionText = document.getElementById('reflection-text').value;
    if (!checkInState.currentMood) {
        showNotification('Please select your mood before saving.', 'error');
        return;
    }
    
    if (reflectionText.trim()) {
        const checkIn = {
            date: new Date(),
            mood: checkInState.currentMood,
            energy: checkInState.energyLevel,
            text: reflectionText
        };
        
        // Get existing check-ins
        let checkIns = JSON.parse(localStorage.getItem('digitalWellnessData') || '{"reflections":[]}');
        checkIns.reflections.push(checkIn);
        
        // Save to localStorage
        localStorage.setItem('digitalWellnessData', JSON.stringify(checkIns));
        
        // Show success message
        showNotification('Check-in saved successfully!', 'success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showNotification('Please add a reflection before saving.', 'error');
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}