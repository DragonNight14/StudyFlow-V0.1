class AssignmentTracker {
    constructor() {
        this.assignments = this.loadAssignments();
        this.initializeEventListeners();
        this.renderAssignments();
        this.initializeDarkMode();
        this.initializePushNotifications();
        this.initializeSync();
    }

    async initializePushNotifications() {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                
                if (Notification.permission === 'default') {
                    await Notification.requestPermission();
                }
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    initializeEventListeners() {
        // Navigation
        document.getElementById('home-btn').addEventListener('click', () => {
            this.setActiveNav('home-btn');
            this.switchToView('home-view');
        });

        document.getElementById('all-btn').addEventListener('click', () => {
            this.setActiveNav('all-btn');
            this.switchToView('all-view');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.setActiveNav('settings-btn');
            this.showSettingsView();
        });
    }

    toggleAssignment(id) {
        const assignment = this.assignments.find(a => a.id === id);
        if (assignment) {
            assignment.completed = !assignment.completed;
            this.saveAssignments();
            this.renderAssignments();
        }
    }

    deleteAssignment(id) {
        const assignment = this.assignments.find(a => a.id === id);
        if (!assignment) return;

        // Only allow deletion of manually created assignments
        if (assignment.source && assignment.source !== 'manual') {
            alert('Cannot delete assignments from Canvas or Google Classroom. These are synced from your courses.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
            this.assignments = this.assignments.filter(a => a.id !== id);
            this.saveAssignments();
            this.renderAssignments();
            this.showNotification('Assignment deleted');
        }
    }

    getPriorityCategory(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 4) {
            return 'high-priority';
        } else if (diffDays <= 10) {
            return 'coming-up';
        } else {
            return 'worry-later';
        }
    }

    formatDueDate(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} day(s)`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else {
            return `Due in ${diffDays} day(s)`;
        }
    }

    createAssignmentCard(assignment) {
        const card = document.createElement('div');
        card.className = `assignment-card ${assignment.completed ? 'completed' : ''}`;
        card.setAttribute('data-id', assignment.id);
        card.style.borderLeftColor = assignment.color;

        const dueDateClass = assignment.completed ? '' : this.getPriorityCategory(assignment.dueDate);
        const sourceIcon = this.getSourceIcon(assignment.source);
        const isManual = !assignment.source || assignment.source === 'manual';
        
        card.innerHTML = `
            <div class="assignment-header">
                <div class="assignment-checkbox ${assignment.completed ? 'checked' : ''}" 
                     onclick="app.toggleAssignment('${assignment.id}')">
                </div>
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-actions">
                    ${sourceIcon ? `<div class="assignment-source" title="Source: ${assignment.source || 'Manual'}">${sourceIcon}</div>` : ''}
                    ${isManual ? `<div class="assignment-delete" title="Delete assignment" onclick="app.deleteAssignment('${assignment.id}')">🗑️</div>` : ''}
                </div>
            </div>
            ${assignment.description ? `<div class="assignment-description">${assignment.description}</div>` : ''}
            <div class="assignment-due-date ${dueDateClass}">
                ${this.formatDueDate(assignment.dueDate)}
            </div>
        `;

        return card;
    }

    getSourceIcon(source) {
        switch (source) {
            case 'canvas':
                return '🎨';
            case 'google':
                return '📖';
            default:
                return '✏️';
        }
    }

    renderAssignments() {
        const highPriorityContainer = document.getElementById('high-priority-assignments');
        const comingUpContainer = document.getElementById('coming-up-assignments');
        const worryLaterContainer = document.getElementById('worry-later-assignments');
        const completedContainer = document.getElementById('completed-assignments');
        const allContainer = document.getElementById('all-assignments-list');

        // Clear containers
        [highPriorityContainer, comingUpContainer, worryLaterContainer, completedContainer, allContainer].forEach(container => {
            if (container) container.innerHTML = '';
        });

        this.assignments.forEach(assignment => {
            const card = this.createAssignmentCard(assignment);
            
            if (assignment.completed) {
                if (completedContainer) completedContainer.appendChild(card.cloneNode(true));
            } else {
                const category = this.getPriorityCategory(assignment.dueDate);
                if (category === 'high-priority' && highPriorityContainer) {
                    highPriorityContainer.appendChild(card.cloneNode(true));
                } else if (category === 'coming-up' && comingUpContainer) {
                    comingUpContainer.appendChild(card.cloneNode(true));
                } else if (category === 'worry-later' && worryLaterContainer) {
                    worryLaterContainer.appendChild(card.cloneNode(true));
                }
            }
            
            if (allContainer) allContainer.appendChild(card);
        });

        this.updateEmptyStates();
    }

    updateEmptyStates() {
        const sections = [
            { id: 'high-priority-assignments', message: 'No urgent assignments' },
            { id: 'coming-up-assignments', message: 'No upcoming assignments' },
            { id: 'worry-later-assignments', message: 'No future assignments' },
            { id: 'completed-assignments', message: 'No completed assignments' },
            { id: 'all-assignments-list', message: 'No assignments yet. Create one or connect to Canvas/Google Classroom.' }
        ];

        sections.forEach(section => {
            const container = document.getElementById(section.id);
            if (container && container.children.length === 0) {
                container.innerHTML = `<div class="empty-state">${section.message}</div>`;
            }
        });
    }

    setActiveNav(activeId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(activeId).classList.add('active');
    }

    switchToView(targetViewId) {
        const currentView = document.querySelector('.content-view:not([style*="display: none"])');
        const targetView = document.getElementById(targetViewId);
        
        if (!targetView || currentView === targetView) return;

        // Slide out current view
        if (currentView) {
            currentView.classList.add('slide-out-left');
            setTimeout(() => {
                currentView.style.display = 'none';
                currentView.classList.remove('slide-out-left');
            }, 400);
        }

        // Slide in target view
        setTimeout(() => {
            targetView.style.display = 'block';
            targetView.classList.add('slide-in-right');
            setTimeout(() => {
                targetView.classList.remove('slide-in-right');
            }, 400);
        }, 200);
    }

    showSettingsView() {
        this.switchToView('settings-view');
        this.renderSettingsPage();
    }

    renderSettingsPage() {
        const settingsContainer = document.getElementById('settings-content');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = `
            <div class="settings-section">
                <h3>API Integrations</h3>
                <div class="integration-item">
                    <div class="integration-info">
                        <strong>Canvas LMS</strong>
                        <span id="canvas-status" class="status">Not connected</span>
                    </div>
                    <button id="canvas-settings-btn" class="btn-secondary">Connect</button>
                </div>
                <div class="integration-item">
                    <div class="integration-info">
                        <strong>Google Classroom</strong>
                        <span id="google-status" class="status">Not connected</span>
                    </div>
                    <button id="google-settings-btn" class="btn-secondary">Connect</button>
                </div>
            </div>

            <div class="settings-section">
                <h3>Appearance</h3>
                <div class="setting-item">
                    <label for="dark-mode">Dark Mode</label>
                    <input type="checkbox" id="dark-mode">
                </div>
            </div>

            <div class="settings-section">
                <h3>Notifications</h3>
                <div class="setting-item">
                    <label for="push-notifications">Push Notifications</label>
                    <input type="checkbox" id="push-notifications" checked>
                </div>
            </div>

            <div class="settings-section">
                <h3>Data Management</h3>
                <button id="clear-data-btn" class="btn-danger">Clear All Data</button>
            </div>
        `;

        this.updateConnectionStatus();
        this.initializeSettingsEventListeners();
    }

    initializeSettingsEventListeners() {
        // Dark mode toggle
        const darkModeCheckbox = document.getElementById('dark-mode');
        if (darkModeCheckbox) {
            darkModeCheckbox.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // Canvas connection
        const canvasBtn = document.getElementById('canvas-settings-btn');
        if (canvasBtn) {
            canvasBtn.addEventListener('click', () => {
                if (localStorage.getItem('canvas_connected') === 'true') {
                    this.disconnectCanvas();
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        // Google connection
        const googleBtn = document.getElementById('google-settings-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                if (localStorage.getItem('google_connected') === 'true') {
                    this.disconnectGoogle();
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        // Clear data
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.clear();
                    location.reload();
                }
            });
        }
    }

    initializeDarkMode() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    initializeSync() {
        const canvasConnected = localStorage.getItem('canvas_connected') === 'true';
        const googleConnected = localStorage.getItem('google_connected') === 'true';

        if (canvasConnected) {
            this.syncCanvasAssignments();
        }
        if (googleConnected) {
            this.syncGoogleClassroomAssignments();
        }
    }

    scheduleNotifications() {
        this.assignments.forEach(assignment => {
            if (assignment.completed) return;

            const now = new Date();
            const dueDate = new Date(assignment.dueDate);
            const diffTime = dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Notify 1 day before due date
            if (daysDiff === 1) {
                setTimeout(() => {
                    this.showNotification(`Assignment due tomorrow: ${assignment.title}`);
                }, 1000);
            }
        });
    }

    showNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification('Assignment Tracker', {
                body: message,
                icon: '/icon-192x192.png',
                vibrate: [200, 100, 200]
            });
        }
    }

    async disconnectCanvas() {
        localStorage.removeItem('canvas_connected');
        localStorage.removeItem('canvas_url');
        localStorage.removeItem('canvas_token');
        this.updateConnectionStatus();
        alert('Disconnected from Canvas LMS');
    }

    async disconnectGoogle() {
        localStorage.removeItem('google_connected');
        localStorage.removeItem('google_auth_time');
        this.updateConnectionStatus();
        alert('Disconnected from Google Classroom');
    }

    async syncCanvasAssignments() {
        const canvasUrl = localStorage.getItem('canvas_url');
        const canvasToken = localStorage.getItem('canvas_token');
        
        if (!canvasUrl || !canvasToken) return;

        try {
            console.log('Syncing assignments from Canvas...');
            
            // First, get all courses for the user
            const coursesResponse = await fetch(`${canvasUrl}/api/v1/courses?enrollment_state=active&per_page=100`, {
                headers: {
                    'Authorization': `Bearer ${canvasToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!coursesResponse.ok) {
                throw new Error(`Canvas API error: ${coursesResponse.status} ${coursesResponse.statusText}`);
            }

            const courses = await coursesResponse.json();
            console.log(`Found ${courses.length} active courses`);

            // Get assignments from all courses
            const allAssignments = [];
            
            for (const course of courses) {
                try {
                    const assignmentsResponse = await fetch(`${canvasUrl}/api/v1/courses/${course.id}/assignments?per_page=100`, {
                        headers: {
                            'Authorization': `Bearer ${canvasToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (assignmentsResponse.ok) {
                        const courseAssignments = await assignmentsResponse.json();
                        
                        courseAssignments.forEach(assignment => {
                            // Only include assignments with due dates that aren't already completed
                            if (assignment.due_at && !assignment.has_submitted_submissions) {
                                allAssignments.push({
                                    id: `canvas_${assignment.id}`,
                                    title: assignment.name,
                                    description: assignment.description ? this.stripHtml(assignment.description) : `Assignment for ${course.name}`,
                                    dueDate: new Date(assignment.due_at).toISOString().split('T')[0],
                                    color: this.getCourseColor(course.name),
                                    completed: false,
                                    source: 'canvas',
                                    courseId: course.id,
                                    courseName: course.name,
                                    canvasId: assignment.id,
                                    points: assignment.points_possible,
                                    htmlUrl: assignment.html_url,
                                    createdAt: new Date().toISOString()
                                });
                            }
                        });
                    }
                } catch (courseError) {
                    console.warn(`Error fetching assignments for course ${course.name}:`, courseError);
                }
            }

            console.log(`Found ${allAssignments.length} assignments from Canvas`);

            // Add to assignments if not already present
            allAssignments.forEach(newAssignment => {
                const exists = this.assignments.find(a => a.id === newAssignment.id);
                if (!exists) {
                    this.assignments.push(newAssignment);
                }
            });

            this.saveAssignments();
            this.renderAssignments();
            
            if (allAssignments.length > 0) {
                this.showNotification(`Synced ${allAssignments.length} assignments from Canvas`);
            }

        } catch (error) {
            console.error('Error syncing Canvas assignments:', error);
            alert(`Failed to sync Canvas assignments: ${error.message}`);
        }
    }

    stripHtml(html) {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    getCourseColor(courseName) {
        // Generate consistent colors based on course name
        const colors = ['#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6', '#e67e22', '#16a085', '#2980b9'];
        let hash = 0;
        for (let i = 0; i < courseName.length; i++) {
            hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    async syncGoogleClassroomAssignments() {
        try {
            console.log('Syncing assignments from Google Classroom...');
            
            const googleAuthToken = localStorage.getItem('google_auth_token');
            if (!googleAuthToken) {
                console.warn('No Google auth token found');
                return;
            }

            // Get list of courses
            const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
                headers: {
                    'Authorization': `Bearer ${googleAuthToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!coursesResponse.ok) {
                throw new Error(`Google Classroom API error: ${coursesResponse.status}`);
            }

            const coursesData = await coursesResponse.json();
            const courses = coursesData.courses || [];
            
            console.log(`Found ${courses.length} active courses in Google Classroom`);

            const allAssignments = [];

            for (const course of courses) {
                try {
                    // Get coursework (assignments) for each course
                    const courseworkResponse = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, {
                        headers: {
                            'Authorization': `Bearer ${googleAuthToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (courseworkResponse.ok) {
                        const courseworkData = await courseworkResponse.json();
                        const coursework = courseworkData.courseWork || [];

                        coursework.forEach(work => {
                            if (work.dueDate && work.state === 'PUBLISHED') {
                                // Convert Google's date format to our format
                                const dueDate = new Date(
                                    work.dueDate.year,
                                    work.dueDate.month - 1,
                                    work.dueDate.day
                                );

                                allAssignments.push({
                                    id: `google_${work.id}`,
                                    title: work.title,
                                    description: work.description || `Assignment for ${course.name}`,
                                    dueDate: dueDate.toISOString().split('T')[0],
                                    color: this.getCourseColor(course.name),
                                    completed: false,
                                    source: 'google',
                                    courseId: course.id,
                                    courseName: course.name,
                                    googleId: work.id,
                                    points: work.maxPoints,
                                    alternateLink: work.alternateLink,
                                    createdAt: new Date().toISOString()
                                });
                            }
                        });
                    }
                } catch (courseError) {
                    console.warn(`Error fetching coursework for ${course.name}:`, courseError);
                }
            }

            console.log(`Found ${allAssignments.length} assignments from Google Classroom`);

            // Add to assignments if not already present
            allAssignments.forEach(newAssignment => {
                const exists = this.assignments.find(a => a.id === newAssignment.id);
                if (!exists) {
                    this.assignments.push(newAssignment);
                }
            });

            this.saveAssignments();
            this.renderAssignments();
            
            if (allAssignments.length > 0) {
                this.showNotification(`Synced ${allAssignments.length} assignments from Google Classroom`);
            }

        } catch (error) {
            console.error('Error syncing Google Classroom assignments:', error);
            alert(`Failed to sync Google Classroom assignments: ${error.message}`);
        }
    }

    updateConnectionStatus() {
        const canvasConnected = localStorage.getItem('canvas_connected') === 'true';
        const googleConnected = localStorage.getItem('google_connected') === 'true';

        const canvasStatus = document.getElementById('canvas-status');
        const googleStatus = document.getElementById('google-status');
        const canvasBtn = document.getElementById('canvas-settings-btn');
        const googleBtn = document.getElementById('google-settings-btn');

        if (canvasStatus) {
            canvasStatus.textContent = canvasConnected ? 'Connected' : 'Not connected';
            canvasStatus.style.color = canvasConnected ? '#27ae60' : '#7f8c8d';
            canvasBtn.textContent = canvasConnected ? 'Disconnect' : 'Connect';
        }

        if (googleStatus) {
            googleStatus.textContent = googleConnected ? 'Connected' : 'Not connected';
            googleStatus.style.color = googleConnected ? '#27ae60' : '#7f8c8d';
            googleBtn.textContent = googleConnected ? 'Disconnect' : 'Connect';
        }

        // Update dark mode checkbox
        const darkModeCheckbox = document.getElementById('dark-mode');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = localStorage.getItem('theme') === 'dark';
        }
    }

    loadAssignments() {
        const stored = localStorage.getItem('assignments');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return empty array - no mock data
        return [];
    }

    saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(this.assignments));
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AssignmentTracker();
});
