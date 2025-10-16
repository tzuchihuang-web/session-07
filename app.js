// State management
let appState = {
    reflections: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    loadSavedData();
    updatePatternAnalysis();
    
    // Add event listener for storage changes (for real-time updates)
    window.addEventListener('storage', (e) => {
        if (e.key === 'digitalWellnessData') {
            loadSavedData();
            initializeCalendar();
            updatePatternAnalysis();
        }
    });
});

// Create popup for day data
function createDayPopup(dayData) {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.day-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'day-popup';
    
    const date = new Date(dayData.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    popup.innerHTML = `
        <div class="popup-header">
            <h3>${formattedDate}</h3>
            <button class="close-popup">×</button>
        </div>
        <div class="popup-content">
            <div class="popup-mood">
                <label>Mood:</label>
                <span class="mood-emoji">${getMoodEmoji(dayData.mood)}</span>
            </div>
            <div class="popup-energy">
                <label>Energy Level:</label>
                <div class="energy-bar-container">
                    <div class="energy-bar" style="width: ${dayData.energy * 10}%"></div>
                    <span>${dayData.energy}/10</span>
                </div>
            </div>
            <div class="popup-reflection">
                <label>Reflection:</label>
                <p>${dayData.text}</p>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Position popup
    const rect = event.target.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !event.target.contains(e.target)) {
            popup.remove();
        }
    });

    // Close button functionality
    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });
}

// Helper function to get data for a specific day
function getDayData(date) {
    const reflections = appState.reflections || [];
    return reflections.find(reflection => {
        const reflectionDate = new Date(reflection.date);
        return reflectionDate.getDate() === date.getDate() &&
               reflectionDate.getMonth() === date.getMonth() &&
               reflectionDate.getFullYear() === date.getFullYear();
    });
}

// Helper function to get emoji for mood
function getMoodEmoji(mood) {
    const emojis = {
        '1': '😔',
        '2': '😐',
        '3': '🙂',
        '4': '😊',
        '5': '😄'
    };
    return emojis[mood] || '🤔';
}

// Calendar Initialization
function initializeCalendar() {
    const calendar = document.getElementById('calendar-grid');
    const calendarSection = document.querySelector('.calendar-view');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Clear existing content
    calendar.innerHTML = '';
    
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Update calendar header with month and year
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const calendarTitle = calendarSection.querySelector('h2');
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Create day headers
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-header');
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Create day cells
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-cell', 'empty');
        calendar.appendChild(emptyCell);
    }
    
    // Create cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-cell');
        
        const dateDiv = document.createElement('div');
        dateDiv.classList.add('date');
        dateDiv.textContent = day;
        dayCell.appendChild(dateDiv);
        
        const dataDiv = document.createElement('div');
        dataDiv.classList.add('day-data');
        dayCell.appendChild(dataDiv);
        
        // Add data if exists for this day
        const currentDate = new Date(currentYear, currentMonth, day);
        const dayData = getDayData(currentDate);
        if (dayData) {
            dataDiv.innerHTML = `
                <div class="mood-indicator">${getMoodEmoji(dayData.mood)}</div>
                <div class="energy-bar-mini" style="width: ${dayData.energy * 10}%"></div>
            `;
            dayCell.classList.add('has-data');
            
            // Add click event for popup
            dayCell.addEventListener('click', (event) => {
                createDayPopup(dayData);
                event.stopPropagation();
            });
        }
        
        calendar.appendChild(dayCell);
    }
}

// Pattern Analysis
function updatePatternAnalysis() {
    if (!appState.reflections || appState.reflections.length === 0) {
        document.getElementById('pattern-content').innerHTML = `
            <div class="pattern-item">
                <p>Start adding daily check-ins to see your patterns!</p>
            </div>
        `;
        document.getElementById('summary-content').innerHTML = `
            <p>Welcome to your Digital Wellness journey! Complete your first check-in to start seeing personalized insights.</p>
        `;
        return;
    }

    const patterns = analyzePatterns(appState.reflections);
    
    // Update the pattern display
    document.getElementById('pattern-content').innerHTML = generatePatternHTML(patterns);
    
    // Update the summary
    document.getElementById('summary-content').innerHTML = generateSummaryHTML(patterns);
}

// Pattern Analysis Helper Functions
function analyzePatterns(reflections) {
    const patterns = {
        energyTrends: calculateEnergyTrends(reflections),
        moodPatterns: identifyMoodPatterns(reflections),
        timeOfDay: analyzeTimePatterns(reflections),
        insights: generateInsights(reflections)
    };
    
    return patterns;
}

function calculateEnergyTrends(reflections) {
    const energyByDay = new Array(7).fill(0);
    const countByDay = new Array(7).fill(0);
    
    reflections.forEach(reflection => {
        const day = new Date(reflection.date).getDay();
        energyByDay[day] += reflection.energy;
        countByDay[day]++;
    });
    
    return energyByDay.map((total, index) => 
        countByDay[index] ? total / countByDay[index] : 0
    );
}

function identifyMoodPatterns(reflections) {
    const moodCounts = {};
    reflections.forEach(reflection => {
        moodCounts[reflection.mood] = (moodCounts[reflection.mood] || 0) + 1;
    });
    return moodCounts;
}

function analyzeTimePatterns(reflections) {
    const timePatterns = {
        morning: 0,
        afternoon: 0,
        evening: 0
    };
    
    reflections.forEach(reflection => {
        const hour = new Date(reflection.date).getHours();
        if (hour < 12) timePatterns.morning++;
        else if (hour < 18) timePatterns.afternoon++;
        else timePatterns.evening++;
    });
    
    return timePatterns;
}

function generateInsights(reflections) {
    const insights = [];
    
    // Get the last 7 days of reflections
    const recentReflections = reflections
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7);
        
    // Analyze energy patterns
    const avgEnergy = recentReflections.reduce((sum, r) => sum + r.energy, 0) / recentReflections.length;
    if (avgEnergy > 7) {
        insights.push("Your energy levels have been consistently high this week.");
    } else if (avgEnergy < 4) {
        insights.push("Your energy levels have been lower than usual. Consider taking breaks between study sessions.");
    }
    
    // Analyze mood patterns
    const moodCounts = recentReflections.reduce((acc, r) => {
        acc[r.mood] = (acc[r.mood] || 0) + 1;
        return acc;
    }, {});
    
    const mostFrequentMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0];
        
    insights.push(`You've most often felt ${getMoodDescription(mostFrequentMood[0])} this week.`);
    
    return insights;
}

function getMoodDescription(mood) {
    const descriptions = {
        '1': 'down',
        '2': 'neutral',
        '3': 'good',
        '4': 'very good',
        '5': 'excellent'
    };
    return descriptions[mood] || 'neutral';
}

function generatePatternHTML(patterns) {
    if (!patterns.insights || patterns.insights.length === 0) {
        return `
            <div class="pattern-item">
                <p>Start adding daily check-ins to see your patterns!</p>
            </div>
        `;
    }

    return `
        <div class="pattern-item">
            <h4>This Week's Insights</h4>
            ${patterns.insights.map(insight => `<p>• ${insight}</p>`).join('')}
        </div>
    `;
}

function generateSummaryHTML(patterns) {
    if (!patterns.insights || patterns.insights.length === 0) {
        return `
            <p>Welcome to your Digital Wellness journey! Complete your first check-in to start seeing personalized insights.</p>
        `;
    }

    const timePattern = getMostProductiveTime(patterns.timeOfDay);
    return `
        <p>Based on your recent check-ins:</p>
        <ul>
            ${timePattern ? `<li>You tend to be most engaged during ${timePattern}.</li>` : ''}
            <li>Consider scheduling focused work during your high-energy periods.</li>
            <li>Take mindful breaks when your energy dips to maintain productivity.</li>
        </ul>
    `;
}

// Storage Functions
function loadSavedData() {
    const savedData = localStorage.getItem('digitalWellnessData');
    if (savedData) {
        try {
            appState = JSON.parse(savedData);
            // Ensure dates are properly converted from strings
            appState.reflections = appState.reflections.map(reflection => ({
                ...reflection,
                date: new Date(reflection.date)
            }));
            updatePatternAnalysis();
        } catch (e) {
            console.error('Error loading saved data:', e);
            appState = { reflections: [] };
        }
    }
}

function getMostProductiveTime(timePatterns) {
    if (!timePatterns) return null;
    const times = Object.entries(timePatterns);
    if (times.length === 0) return null;
    const maxTime = times.reduce((max, current) => 
        current[1] > max[1] ? current : max
    );
    return maxTime[0];
}