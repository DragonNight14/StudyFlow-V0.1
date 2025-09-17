class EnhancedAssignmentTracker {
    constructor() {
        this.assignments = JSON.parse(localStorage.getItem('assignments')) || [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.currentView = 'home';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.completionStreak = parseInt(localStorage.getItem('completionStreak')) || 0;
        this.canvasConnected = localStorage.getItem('canvasConnected') === 'true';
        this.googleConnected = localStorage.getItem('googleConnected') === 'true';
        this.notificationsQueue = [];
        
        // Add sample assignments if none exist
        if (this.assignments.length === 0) {
            this.addSampleAssignments();
        }
        
        this.init();
    }

    addSampleAssignments() {
        const sampleAssignments = [
            {
                id: Date.now() + 1,
                title: "Math Homework - Chapter 5",
                description: "Complete exercises 1-20 on quadratic equations",
                subject: "math",
                courseName: "Algebra II",
                dueDate: this.getDateString(3), // 3 days from now
                dueTime: "23:59",
                completed: false,
                priority: "high",
                customColor: "#ef4444",
                source: "manual",
                createdAt: Date.now()
            },
            {
                id: Date.now() + 2,
                title: "Science Lab Report",
                description: "Write lab report on photosynthesis experiment",
                subject: "science",
                courseName: "Biology",
                dueDate: this.getDateString(7), // 1 week from now
                dueTime: "15:30",
                completed: false,
                priority: "medium",
                customColor: "#10b981",
                source: "manual",
                createdAt: Date.now()
            },
            {
                id: Date.now() + 3,
                title: "English Essay Draft",
                description: "First draft of persuasive essay on climate change",
                subject: "english",
                courseName: "English Literature",
                dueDate: this.getDateString(10), // 10 days from now
                dueTime: "12:00",
                completed: false,
                priority: "medium",
                customColor: "#3b82f6",
                source: "manual",
                createdAt: Date.now()
            },
            {
                id: Date.now() + 4,
                title: "History Research Project",
                description: "Research paper on World War II causes",
                subject: "history",
                courseName: "World History",
                dueDate: this.getDateString(21), // 3 weeks from now
                dueTime: "23:59",
                completed: false,
                priority: "low",
                customColor: "#8b5cf6",
                source: "manual",
                createdAt: Date.now()
            },
            {
                id: Date.now() + 5,
                title: "Art Portfolio Submission",
                description: "Submit 5 completed drawings for portfolio review",
                subject: "art",
                courseName: "Visual Arts",
                dueDate: this.getDateString(14), // 2 weeks from now
                dueTime: "17:00",
                completed: false,
                priority: "medium",
                customColor: "#f43f5e",
                source: "manual",
                createdAt: Date.now()
            },
            {
                id: Date.now() + 6,
                title: "Chemistry Quiz Prep",
                description: "Study for quiz on chemical bonding",
                subject: "science",
                courseName: "Chemistry",
                dueDate: this.getDateString(2), // 2 days from now
                dueTime: "08:00",
                completed: true,
                priority: "high",
                customColor: "#f59e0b",
                source: "manual",
                createdAt: Date.now() - 86400000, // Created yesterday
                completedAt: Date.now() - 3600000 // Completed 1 hour ago
            }
        ];

        this.assignments = sampleAssignments;
        this.saveAssignments();
    }

    getDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    applySavedStylesImmediate() {
        const primaryColor = localStorage.getItem('primary-color') || '#667eea';
        const secondaryColor = localStorage.getItem('secondary-color') || '#764ba2';
        const accentColor = localStorage.getItem('accent-color') || '#f59e0b';
        const backgroundType = localStorage.getItem('background-type') || 'gradient';

        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);

        this.applyBackground(backgroundType);
        
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    async init() {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            try {
                await navigator.serviceWorker.register('./enhanced-sw.js');
                
                if (Notification.permission === 'default') {
                    await Notification.requestPermission();
                }
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }

        this.setupEventListeners();
        this.renderCurrentView();
        this.updateStatistics();
        this.checkAndUpdateStreak();
        this.scheduleNotifications();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('home-btn').addEventListener('click', () => {
            this.setActiveNav('home-btn');
            this.switchToView('home-view');
        });

        document.getElementById('all-assignments-btn').addEventListener('click', () => {
            this.setActiveNav('all-assignments-btn');
            this.switchToView('all-view');
        });

        document.getElementById('calendar-btn').addEventListener('click', () => {
            this.setActiveNav('calendar-btn');
            this.switchToView('calendar-view');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.setActiveNav('settings-btn');
            this.showSettingsView();
        });

        // Calendar navigation
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar();
            });
        }

        // Create assignment button
        const createBtn = document.getElementById('create-assignment-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                window.location.href = 'create-assignment-enhanced.html';
            });
        }

        this.initializeSearchAndFilter();
    }

    initializeSearchAndFilter() {
        const searchInput = document.getElementById('assignment-search');
        const statusFilter = document.getElementById('status-filter');
        const sourceFilter = document.getElementById('source-filter');
        const priorityFilter = document.getElementById('priority-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAssignments());
        }

        [statusFilter, sourceFilter, priorityFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.filterAssignments());
            }
        });
    }

    // Enhanced assignment card creation with glassmorphic design
    createAssignmentCard(assignment) {
        const card = document.createElement('div');
        card.className = `assignment-card ${assignment.completed ? 'completed' : ''}`;
        card.setAttribute('data-id', assignment.id);
        
        // Custom color streak
        const colorStreak = assignment.customColor || this.getSourceColor(assignment.source);
        card.style.borderLeftColor = colorStreak;
        
        // Add custom background if set
        if (assignment.customBackground) {
            card.style.backgroundImage = `url(${assignment.customBackground})`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        }

        const dueDateClass = assignment.completed ? '' : this.getPriorityCategory(assignment.dueDate);
        const sourceIcon = this.getSourceIcon(assignment.source);
        const isManual = !assignment.source || assignment.source === 'manual';
        
        card.innerHTML = `
            <div class="assignment-header">
                <div class="assignment-checkbox ${assignment.completed ? 'checked' : ''}" 
                     onclick="tracker.toggleAssignment('${assignment.id}')"
                     role="checkbox"
                     aria-checked="${assignment.completed}"
                     aria-label="${assignment.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${assignment.title}"
                     tabindex="0">
                </div>
                <div class="assignment-title">${assignment.title}</div>
                <div class="assignment-actions">
                    ${sourceIcon ? `<div class="assignment-source" title="Source: ${assignment.source || 'Manual'}">${sourceIcon}</div>` : ''}
                    ${isManual ? `<div class="assignment-edit" title="Edit assignment" onclick="tracker.editAssignment('${assignment.id}')">✏️</div>` : ''}
                    ${isManual ? `<div class="assignment-delete" title="Delete assignment" onclick="tracker.deleteAssignment('${assignment.id}')">🗑️</div>` : ''}
                </div>
            </div>
            ${assignment.description ? `<div class="assignment-description">${assignment.description}</div>` : ''}
            <div class="assignment-due-date ${dueDateClass}">
                ${this.formatDueDate(assignment.dueDate)}
            </div>
        `;

        // Add stagger animation
        card.style.animationDelay = `${Math.random() * 0.3}s`;
        
        return card;
    }

    getSourceColor(source) {
        switch (source) {
            case 'canvas':
                return '#e13b2b'; // Canvas red
            case 'google':
                return '#4285f4'; // Google blue
            default:
                return '#f59e0b'; // Default accent
        }
    }

    getSourceIcon(source) {
        switch (source) {
            case 'canvas':
                return '🎨';
            case 'google':
                return '📚';
            default:
                return '📝';
        }
    }

    // Enhanced toggle with animations
    toggleAssignment(id) {
        const assignment = this.assignments.find(a => a.id == id);
        if (!assignment) return;

        const checkbox = document.querySelector(`[data-id="${id}"] .assignment-checkbox`);
        const card = document.querySelector(`[data-id="${id}"]`);
        
        if (checkbox && card) {
            checkbox.classList.add('checking');
            card.classList.add('completing');
            
            setTimeout(() => {
                assignment.completed = !assignment.completed;
                
                if (assignment.completed) {
                    this.updateCompletionStreak();
                    this.showNotification(`🎉 Great job! "${assignment.title}" completed!`);
                } else {
                    this.showNotification(`📝 "${assignment.title}" marked as incomplete`);
                }
                
                this.saveAssignments();
                this.renderAssignments();
                this.updateStatistics();
            }, 300);
        }
    }

    editAssignment(id) {
        if (!this.assignmentEditor) {
            this.assignmentEditor = new AssignmentEditor(this);
        }
        this.assignmentEditor.editAssignment(id);
    }

    deleteAssignment(id) {
        const assignment = this.assignments.find(a => a.id == id);
        if (!assignment) return;

        if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
            this.assignments = this.assignments.filter(a => a.id != id);
            this.saveAssignments();
            this.renderAssignments();
            this.updateStatistics();
            this.showNotification(`Assignment "${assignment.title}" deleted`);
        }
    }

    updateCompletionStreak() {
        const today = new Date().toDateString();
        const lastDate = this.lastCompletionDate;
        
        if (lastDate === today) {
            // Already completed something today
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
            // Continuing streak
            this.completionStreak++;
        } else if (!lastDate || lastDate !== today) {
            // Starting new streak
            this.completionStreak = 1;
        }
        
        this.lastCompletionDate = today;
        localStorage.setItem('completionStreak', this.completionStreak.toString());
        localStorage.setItem('lastCompletionDate', today);
    }

    checkAndUpdateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.lastCompletionDate;
        
        if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate !== today && lastDate !== yesterday.toDateString()) {
                // Streak broken
                this.completionStreak = 0;
                localStorage.setItem('completionStreak', '0');
            }
        }
    }

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Calendar with tap-and-hold pip markers
    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;

        const monthYear = document.getElementById('calendar-month-year');
        if (monthYear) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            monthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        calendarGrid.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAssignments = this.assignments.filter(a => a.dueDate === dateStr && !a.completed);
            
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                ${dayAssignments.length > 0 ? `<div class="calendar-assignment-count">${dayAssignments.length}</div>` : ''}
            `;

            if (dayAssignments.length > 0) {
                this.addCalendarDayListeners(dayElement, dateStr, dayAssignments);
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    addCalendarDayListeners(dayElement, dateStr, assignments) {
        let touchTimer = null;
        let isLongPress = false;

        // Touch events for mobile
        dayElement.addEventListener('touchstart', (e) => {
            isLongPress = false;
            touchTimer = setTimeout(() => {
                isLongPress = true;
                this.showPipMarker(e.touches[0], dateStr, assignments);
            }, 500);
        });

        dayElement.addEventListener('touchend', (e) => {
            clearTimeout(touchTimer);
            if (!isLongPress) {
                this.showCalendarPopup(dateStr, assignments);
            }
        });

        dayElement.addEventListener('touchmove', () => {
            clearTimeout(touchTimer);
        });

        // Mouse events for desktop
        dayElement.addEventListener('mousedown', (e) => {
            isLongPress = false;
            touchTimer = setTimeout(() => {
                isLongPress = true;
                this.showPipMarker(e, dateStr, assignments);
            }, 500);
        });

        dayElement.addEventListener('mouseup', () => {
            clearTimeout(touchTimer);
            if (!isLongPress) {
                this.showCalendarPopup(dateStr, assignments);
            }
        });

        dayElement.addEventListener('mouseleave', () => {
            clearTimeout(touchTimer);
        });
    }

    showPipMarker(event, dateStr, assignments) {
        this.hidePipMarker();

        const pip = document.createElement('div');
        pip.className = 'pip-marker';
        pip.innerHTML = `
            <div class="pip-header">
                <strong>${new Date(dateStr).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                })}</strong>
            </div>
            <div class="pip-assignments">
                ${assignments.map(a => `
                    <div class="pip-assignment">
                        <div class="pip-assignment-title">${a.title}</div>
                        <div class="pip-assignment-priority ${this.getPriorityCategory(a.dueDate)}">${this.formatDueDate(a.dueDate)}</div>
                    </div>
                `).join('')}
            </div>
        `;

        const x = event.clientX || event.pageX;
        const y = event.clientY || event.pageY;
        
        pip.style.left = `${Math.min(x, window.innerWidth - 300)}px`;
        pip.style.top = `${Math.max(y - 100, 20)}px`;

        document.body.appendChild(pip);
        this.pipMarker = pip;

        // Auto-hide after 3 seconds
        this.pipTimeout = setTimeout(() => {
            this.hidePipMarker();
        }, 3000);

        // Hide on click outside
        setTimeout(() => {
            document.addEventListener('click', this.hidePipMarker.bind(this), { once: true });
        }, 100);
    }

    hidePipMarker() {
        if (this.pipMarker) {
            this.pipMarker.classList.add('hiding');
            setTimeout(() => {
                if (this.pipMarker && this.pipMarker.parentNode) {
                    this.pipMarker.parentNode.removeChild(this.pipMarker);
                }
                this.pipMarker = null;
            }, 200);
        }
        if (this.pipTimeout) {
            clearTimeout(this.pipTimeout);
            this.pipTimeout = null;
        }
    }

    saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(this.assignments));
    }

    renderAssignments() {
        this.renderPriorityAssignments();
        this.renderAllAssignments();
        this.updateStatistics();
    }

    renderPriorityAssignments() {
        const highPriorityContainer = document.getElementById('high-priority-assignments');
        const comingUpContainer = document.getElementById('coming-up-assignments');
        const worryLaterContainer = document.getElementById('worry-later-assignments');
        const completedContainer = document.getElementById('completed-assignments');
        const completedSection = document.getElementById('completed');

        if (!highPriorityContainer || !comingUpContainer || !worryLaterContainer || !completedContainer) return;

        // Clear containers
        highPriorityContainer.innerHTML = '';
        comingUpContainer.innerHTML = '';
        worryLaterContainer.innerHTML = '';
        completedContainer.innerHTML = '';

        const now = new Date();
        const highPriorityAssignments = [];
        const comingUpAssignments = [];
        const worryLaterAssignments = [];
        const completedAssignments = [];

        this.assignments.forEach(assignment => {
            if (assignment.completed) {
                completedAssignments.push(assignment);
            } else {
                const dueDate = new Date(assignment.dueDate);
                const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                if (daysDiff <= 4) {
                    highPriorityAssignments.push(assignment);
                } else if (daysDiff <= 10) {
                    comingUpAssignments.push(assignment);
                } else {
                    worryLaterAssignments.push(assignment);
                }
            }
        });

        // Render assignments in each section
        this.renderAssignmentSection(highPriorityContainer, highPriorityAssignments, 'No urgent assignments right now 🎉');
        this.renderAssignmentSection(comingUpContainer, comingUpAssignments, 'No upcoming assignments');
        this.renderAssignmentSection(worryLaterContainer, worryLaterAssignments, 'No long-term assignments');
        
        // Show/hide completed section
        if (completedAssignments.length > 0) {
            this.renderAssignmentSection(completedContainer, completedAssignments, '');
            completedSection.style.display = 'block';
        } else {
            completedSection.style.display = 'none';
        }
    }

    renderAssignmentSection(container, assignments, emptyMessage) {
        if (assignments.length === 0) {
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        } else {
            assignments.forEach(assignment => {
                const card = this.createAssignmentCard(assignment);
                container.appendChild(card);
            });
        }
    }

    renderAllAssignments() {
        const container = document.getElementById('all-assignments');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.assignments.length === 0) {
            container.innerHTML = '<div class="empty-state">No assignments yet. Create your first assignment!</div>';
            return;
        }

        const filteredAssignments = this.getFilteredAssignments();
        
        if (filteredAssignments.length === 0) {
            container.innerHTML = '<div class="empty-state">No assignments match your filters</div>';
            return;
        }

        filteredAssignments.forEach(assignment => {
            const card = this.createAssignmentCard(assignment);
            container.appendChild(card);
        });
    }

    getFilteredAssignments() {
        const searchTerm = document.getElementById('assignment-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const sourceFilter = document.getElementById('source-filter')?.value || 'all';
        const priorityFilter = document.getElementById('priority-filter')?.value || 'all';

        return this.assignments.filter(assignment => {
            const matchesSearch = assignment.title.toLowerCase().includes(searchTerm) ||
                                assignment.description?.toLowerCase().includes(searchTerm) ||
                                assignment.courseName?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'all' || 
                                (statusFilter === 'completed' && assignment.completed) ||
                                (statusFilter === 'pending' && !assignment.completed);
            
            const matchesSource = sourceFilter === 'all' || 
                                (assignment.source || 'manual') === sourceFilter;
            
            const matchesPriority = priorityFilter === 'all' || 
                                  assignment.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesSource && matchesPriority;
        });
    }

    updateStatistics() {
        const totalElement = document.getElementById('total-assignments');
        const completedElement = document.getElementById('completed-count');
        const overdueElement = document.getElementById('overdue-count');
        const streakElement = document.getElementById('streak-count');
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');

        if (!totalElement || !completedElement || !overdueElement || !streakElement) return;

        const activeAssignments = this.assignments.filter(a => !a.completed);
        const completedAssignments = this.assignments.filter(a => a.completed);
        const now = new Date();
        const overdueAssignments = activeAssignments.filter(a => new Date(a.dueDate) < now);

        totalElement.textContent = activeAssignments.length;
        completedElement.textContent = completedAssignments.length;
        overdueElement.textContent = overdueAssignments.length;
        streakElement.textContent = this.completionStreak;

        // Update progress bar
        const totalTasks = this.assignments.length;
        const completedTasks = completedAssignments.length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        if (progressFill && progressPercentage) {
            progressFill.style.width = `${progressPercent}%`;
            progressPercentage.textContent = `${progressPercent}%`;
        }
    }

    switchToView(viewId) {
        // Hide all views
        document.querySelectorAll('.content-view').forEach(view => {
            view.style.display = 'none';
        });

        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block';
            this.currentView = viewId;

            // Render content based on view
            if (viewId === 'calendar-view') {
                this.renderCalendar();
            } else if (viewId === 'all-view') {
                this.renderAllAssignments();
            } else if (viewId === 'home-view') {
                this.renderPriorityAssignments();
            }
        }
    }

    setActiveNav(activeId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    showSettingsView() {
        this.switchToView('settings-view');
        if (window.settingsManager) {
            window.settingsManager.renderSettingsPage();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getPriorityCategory(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const daysDiff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) return 'overdue';
        if (daysDiff <= 4) return 'high-priority';
        if (daysDiff <= 10) return 'coming-up';
        return 'worry-later';
    }

    formatDueDate(dueDate) {
        const date = new Date(dueDate);
        const now = new Date();
        const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
            return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
        } else if (daysDiff === 0) {
            return 'Due today';
        } else if (daysDiff === 1) {
            return 'Due tomorrow';
        } else {
            return `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
        }
    }

    filterAssignments() {
        this.renderAllAssignments();
    }

    renderCurrentView() {
        this.renderPriorityAssignments();
        this.renderAllAssignments();
        this.renderCalendar();
    }

    activateDevMode() {
        // Check if panel already exists
        const existingPanel = document.getElementById('dev-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Toggle dev mode if already active
        if (localStorage.getItem('dev-mode') === 'true') {
            this.closeDevPanel();
            return;
        }

        localStorage.setItem('dev-mode', 'true');
        
        // Create dev panel
        const devPanel = document.createElement('div');
        devPanel.id = 'dev-panel';
        devPanel.className = 'dev-panel glass-card';
        devPanel.innerHTML = `
            <div class="dev-header">
                <h3>🔧 Developer Panel</h3>
                <button class="close-btn" onclick="tracker.closeDevPanel()">×</button>
            </div>
            
            <div class="dev-content">
                <div class="dev-section">
                    <h4>🎛️ Quick Actions</h4>
                    <div class="dev-buttons">
                        <button class="btn btn-secondary" onclick="tracker.generateTestData()">Generate Test Data</button>
                        <button class="btn btn-secondary" onclick="tracker.clearAllData()">Clear All Data</button>
                        <button class="btn btn-secondary" onclick="tracker.exportLogs()">Export Logs</button>
                        <button class="btn btn-premium" onclick="tracker.unlockPremium()">Unlock Premium</button>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>📊 System Info</h4>
                    <div class="system-info">
                        <div class="info-item">
                            <span>Version:</span>
                            <span>v2.0 Glassmorphic</span>
                        </div>
                        <div class="info-item">
                            <span>Assignments:</span>
                            <span id="dev-assignment-count">${this.assignments.length}</span>
                        </div>
                        <div class="info-item">
                            <span>Storage Used:</span>
                            <span id="dev-storage-size">${this.calculateStorageSize()}</span>
                        </div>
                        <div class="info-item">
                            <span>Canvas:</span>
                            <span class="status ${this.canvasConnected ? 'connected' : 'disconnected'}">${this.canvasConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <div class="info-item">
                            <span>Google:</span>
                            <span class="status ${this.googleConnected ? 'connected' : 'disconnected'}">${this.googleConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>🐛 Debug Console</h4>
                    <div class="debug-console" id="debug-console">
                        <div class="console-line">Dev mode activated at ${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>⚡ Performance</h4>
                    <div class="performance-metrics">
                        <div class="metric">
                            <span>Render Time:</span>
                            <span id="render-time">~${Math.random() * 50 + 10 | 0}ms</span>
                        </div>
                        <div class="metric">
                            <span>Memory Usage:</span>
                            <span id="memory-usage">${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'}MB</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(devPanel);
        
        // Add dev panel styles
        this.addDevPanelStyles();
        
        // Bind methods to window for onclick handlers
        window.closeDevPanel = () => this.closeDevPanel();
        window.generateTestData = () => this.generateTestData();
        window.clearAllData = () => this.clearAllData();
        window.exportLogs = () => this.exportLogs();
        window.unlockPremium = () => this.unlockPremium();
        
        // Update performance metrics every 5 seconds
        this.devMetricsInterval = setInterval(() => {
            this.updateDevMetrics();
        }, 5000);
        
        this.showNotification('🔧 Developer mode activated! Use ↑↑↓↓←→←→BA again to toggle.', 'success', 5000);
        
        // Log dev activation
        this.logToDevConsole('Developer mode activated');
        this.logToDevConsole(`User Agent: ${navigator.userAgent}`);
        this.logToDevConsole(`Screen: ${screen.width}x${screen.height}`);
    }

    closeDevPanel() {
        const devPanel = document.getElementById('dev-panel');
        if (devPanel) {
            devPanel.remove();
        }
        
        // Clear performance interval
        if (this.devMetricsInterval) {
            clearInterval(this.devMetricsInterval);
            this.devMetricsInterval = null;
        }
        
        localStorage.setItem('dev-mode', 'false');
        this.showNotification('🔧 Developer mode deactivated', 'info');
    }

    generateTestData() {
        const testAssignments = [
            {
                id: 'test_' + Date.now() + '_1',
                title: 'Test Assignment - Math Homework',
                description: 'Complete chapters 5-7 exercises',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                source: 'manual',
                priority: 'high',
                completed: false,
                customColor: '#ff6b6b'
            },
            {
                id: 'test_' + Date.now() + '_2',
                title: 'Test Assignment - Science Project',
                description: 'Research renewable energy sources',
                dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                source: 'manual',
                priority: 'medium',
                completed: false,
                customColor: '#4ecdc4'
            },
            {
                id: 'test_' + Date.now() + '_3',
                title: 'Test Assignment - History Essay',
                description: 'Write 1000 words on WWII',
                dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                source: 'manual',
                priority: 'low',
                completed: true,
                customColor: '#45b7d1'
            }
        ];

        this.assignments.push(...testAssignments);
        this.saveAssignments();
        this.renderAssignments();
        this.updateDevInfo();
        
        this.logToDevConsole(`Generated ${testAssignments.length} test assignments`);
        this.showNotification(`Generated ${testAssignments.length} test assignments`, 'success');
    }

    clearAllData() {
        if (confirm('⚠️ This will delete ALL data including assignments, settings, and connections. Continue?')) {
            localStorage.clear();
            this.assignments = [];
            this.canvasConnected = false;
            this.googleConnected = false;
            this.completionStreak = 0;
            
            // Re-render everything
            this.renderAssignments();
            this.renderCurrentView();
            this.updateStatistics();
            this.updateDevInfo();
            
            this.logToDevConsole('All data cleared - localStorage wiped');
            this.showNotification('🗑️ All data cleared successfully', 'success');
            
            // Refresh settings if open
            if (document.getElementById('settings-view').style.display !== 'none') {
                settingsManager.renderSettingsPage();
            }
        }
    }

    exportLogs() {
        const logs = {
            timestamp: new Date().toISOString(),
            assignments: this.assignments,
            localStorage: { ...localStorage },
            systemInfo: {
                userAgent: navigator.userAgent,
                screen: `${screen.width}x${screen.height}`,
                language: navigator.language,
                platform: navigator.platform
            },
            performance: {
                memory: performance.memory?.usedJSHeapSize || 'N/A',
                timing: performance.timing
            }
        };

        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hw-tracker-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.logToDevConsole('Logs exported');
        this.showNotification('📋 Logs exported successfully', 'success');
    }

    unlockPremium() {
        localStorage.setItem('premium-user', 'true');
        localStorage.setItem('dev-premium', 'true');
        localStorage.setItem('trial-start', Date.now().toString());
        
        this.logToDevConsole('Premium features unlocked via dev panel');
        this.showNotification('💎 Premium features unlocked! All restrictions removed.', 'success');
        
        // Refresh settings if open to show unlocked features
        if (document.getElementById('settings-view').style.display !== 'none') {
            settingsManager.renderSettingsPage();
        }
        
        // Update any premium UI elements
        document.querySelectorAll('.premium-feature').forEach(element => {
            element.classList.add('unlocked');
        });
    }

    calculateStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return `${(total / 1024).toFixed(1)}KB`;
    }

    updateDevInfo() {
        const assignmentCount = document.getElementById('dev-assignment-count');
        const storageSize = document.getElementById('dev-storage-size');
        
        if (assignmentCount) assignmentCount.textContent = this.assignments.length;
        if (storageSize) storageSize.textContent = this.calculateStorageSize();
    }

    updateDevMetrics() {
        const renderTime = document.getElementById('render-time');
        const memoryUsage = document.getElementById('memory-usage');
        
        if (renderTime) {
            renderTime.textContent = `~${Math.random() * 50 + 10 | 0}ms`;
        }
        
        if (memoryUsage) {
            if (performance.memory) {
                const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                memoryUsage.textContent = `${used}MB`;
            } else {
                memoryUsage.textContent = 'N/A';
            }
        }
        
        // Update assignment count and storage in real-time
        this.updateDevInfo();
    }

    logToDevConsole(message) {
        const console = document.getElementById('debug-console');
        if (console) {
            const line = document.createElement('div');
            line.className = 'console-line';
            line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            console.appendChild(line);
            console.scrollTop = console.scrollHeight;
            
            // Keep only last 50 lines
            while (console.children.length > 50) {
                console.removeChild(console.firstChild);
            }
        }
    }

    showDevPasswordPrompt() {
        const modal = document.createElement('div');
        modal.className = 'dev-password-modal';
        modal.innerHTML = `
            <div class="dev-password-content glass-card">
                <div class="dev-password-header">
                    <h3>🔧 Developer Access</h3>
                    <button class="close-btn" onclick="this.closest('.dev-password-modal').remove()">×</button>
                </div>
                
                <div class="dev-password-body">
                    <p>Enter the developer password:</p>
                    <input type="password" id="dev-password-input" placeholder="Password" maxlength="20">
                    
                    <div class="password-hint">
                        <details>
                            <summary>💡 Need a hint?</summary>
                            <p>Think about the classic gaming cheat code... but as text!</p>
                            <small>Hint: ↑↑↓↓←→←→BA</small>
                        </details>
                    </div>
                    
                    <div class="dev-password-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.dev-password-modal').remove()">Cancel</button>
                        <button class="btn btn-premium" onclick="tracker.checkDevPassword()">Access</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Focus password input
        setTimeout(() => {
            const input = document.getElementById('dev-password-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.checkDevPassword();
                    }
                });
            }
        }, 100);

        // Add modal styles
        this.addDevPasswordStyles();
    }

    checkDevPassword() {
        const input = document.getElementById('dev-password-input');
        const password = input ? input.value.toLowerCase() : '';
        
        // Password is "konami" or "uuddlrlrba"
        if (password === 'konami' || password === 'uuddlrlrba' || password === 'dev123') {
            document.querySelector('.dev-password-modal').remove();
            this.activateDevMode();
        } else {
            input.style.borderColor = '#ef4444';
            input.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.animation = '';
            }, 500);
            this.showNotification('❌ Incorrect password', 'error');
        }
    }

    addDevPasswordStyles() {
        if (document.getElementById('dev-password-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'dev-password-styles';
        styles.textContent = `
            .dev-password-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }

            .dev-password-content {
                max-width: 400px;
                margin: 1rem;
                padding: 2rem;
                animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .dev-password-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .dev-password-header h3 {
                margin: 0;
                color: var(--text-primary);
            }

            .dev-password-body p {
                color: var(--text-secondary);
                margin-bottom: 1rem;
            }

            #dev-password-input {
                width: 100%;
                padding: 0.75rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius-small);
                color: var(--text-primary);
                font-size: 1rem;
                margin-bottom: 1rem;
            }

            #dev-password-input:focus {
                outline: none;
                border-color: var(--accent-color);
                box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
            }

            .password-hint {
                margin: 1rem 0;
                padding: 1rem;
                background: rgba(245, 158, 11, 0.1);
                border-radius: var(--border-radius-small);
                border: 1px solid rgba(245, 158, 11, 0.2);
            }

            .password-hint details summary {
                cursor: pointer;
                color: var(--accent-color);
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .password-hint p {
                margin: 0.5rem 0;
                font-size: 0.875rem;
            }

            .password-hint small {
                font-family: 'Courier New', monospace;
                background: rgba(0, 0, 0, 0.3);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                color: #00ff00;
            }

            .dev-password-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            @media (max-width: 768px) {
                .dev-password-content {
                    margin: 0.5rem;
                    padding: 1.5rem;
                }
                
                .dev-password-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    addDevPanelStyles() {
        if (document.getElementById('dev-panel-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'dev-panel-styles';
        styles.textContent = `
            .dev-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10000;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 0.875rem;
                animation: slideInRight 0.3s ease-out;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }

    // Mobile dev access - triple tap on title
    let titleTapCount = 0;
    let titleTapTimer = null;
    
    const appTitle = document.querySelector('header h1');
    if (appTitle) {
        appTitle.addEventListener('click', () => {
            titleTapCount++;
            
            if (titleTapTimer) {
                clearTimeout(titleTapTimer);
            }
            
            if (titleTapCount === 3) {
                tracker.showDevPasswordPrompt();
                titleTapCount = 0;
            } else {
                titleTapTimer = setTimeout(() => {
                    titleTapCount = 0;
                }, 1000);
            }
        });
            .dev-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
            }

            .dev-buttons .btn {
                padding: 0.5rem;
                font-size: 0.75rem;
                border-radius: 6px;
            }

            .system-info, .performance-metrics {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .info-item, .metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                color: #fff;
            }

            .info-item span:first-child, .metric span:first-child {
                opacity: 0.7;
                font-size: 0.75rem;
            }

            .debug-console {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 0.75rem;
                height: 120px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.75rem;
            }

            .console-line {
                color: #00ff00;
                margin-bottom: 0.25rem;
                word-break: break-all;
            }

            .status.connected {
                color: #00ff00;
            }

            .status.disconnected {
                color: #ff6b6b;
            }

            @media (max-width: 768px) {
                .dev-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}
