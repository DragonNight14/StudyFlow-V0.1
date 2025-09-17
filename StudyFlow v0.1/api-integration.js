// API Integration for Canvas LMS and Google Classroom

class APIIntegration {
    constructor(tracker) {
        this.tracker = tracker;
        this.canvasBaseURL = null;
        this.canvasToken = null;
        this.googleAuth = null;
        this.syncInterval = null;
    }

    // Canvas LMS Integration
    async connectCanvas(canvasURL, accessToken) {
        try {
            this.canvasBaseURL = canvasURL;
            this.canvasToken = accessToken;
            
            // Test connection
            const response = await fetch(`${canvasURL}/api/v1/users/self`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid Canvas credentials');
            }

            const user = await response.json();
            localStorage.setItem('canvasURL', canvasURL);
            localStorage.setItem('canvasToken', accessToken);
            localStorage.setItem('canvasUser', JSON.stringify(user));
            localStorage.setItem('canvas-user-name', user.name || user.short_name || 'Canvas User');
            localStorage.setItem('canvas-user-email', user.login_id || user.email || '');
            
            this.tracker.canvasConnected = true;
            localStorage.setItem('canvasConnected', 'true');
            
            // Start syncing assignments
            await this.syncCanvasAssignments();
            this.startAutoSync();
            
            return { success: true, user };
        } catch (error) {
            console.error('Canvas connection failed:', error);
            throw error;
        }
    }

    async syncCanvasAssignments() {
        if (!this.canvasBaseURL || !this.canvasToken) return;

        try {
            // Get all courses
            const coursesResponse = await fetch(`${this.canvasBaseURL}/api/v1/courses?enrollment_state=active`, {
                headers: {
                    'Authorization': `Bearer ${this.canvasToken}`
                }
            });

            if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
            
            const courses = await coursesResponse.json();
            
            // Get assignments from all courses
            const allAssignments = [];
            
            for (const course of courses) {
                const assignmentsResponse = await fetch(
                    `${this.canvasBaseURL}/api/v1/courses/${course.id}/assignments?bucket=upcoming&per_page=50`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${this.canvasToken}`
                        }
                    }
                );

                if (assignmentsResponse.ok) {
                    const assignments = await assignmentsResponse.json();
                    
                    assignments.forEach(assignment => {
                        if (assignment.due_at) {
                            allAssignments.push({
                                id: `canvas_${assignment.id}`,
                                title: assignment.name,
                                description: assignment.description || '',
                                dueDate: assignment.due_at.split('T')[0],
                                source: 'canvas',
                                courseName: course.name,
                                courseId: course.id,
                                canvasId: assignment.id,
                                completed: false,
                                customColor: '#e13b2b', // Canvas red
                                url: assignment.html_url
                            });
                        }
                    });
                }
            }

            // Merge with existing assignments
            this.mergeAssignments(allAssignments, 'canvas');
            
            this.tracker.showNotification(`Synced ${allAssignments.length} assignments from Canvas`);
            
        } catch (error) {
            console.error('Canvas sync failed:', error);
            this.tracker.showNotification('Canvas sync failed. Check your connection.', 'error');
        }
    }

    // Google Classroom Integration
    async connectGoogleClassroom() {
        try {
            // Initialize Google API
            await this.loadGoogleAPI();
            
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            
            this.googleAuth = user;
            const profile = user.getBasicProfile();
            localStorage.setItem('googleAuth', JSON.stringify(profile));
            localStorage.setItem('google-user-name', profile.getName());
            localStorage.setItem('google-user-email', profile.getEmail());
            
            this.tracker.googleConnected = true;
            localStorage.setItem('googleConnected', 'true');
            
            // Start syncing assignments
            await this.syncGoogleClassroomAssignments();
            this.startAutoSync();
            
            return { success: true, user: user.getBasicProfile() };
        } catch (error) {
            console.error('Google Classroom connection failed:', error);
            throw error;
        }
    }

    async loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (typeof gapi !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('auth2:client', () => {
                    gapi.client.init({
                        apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with actual API key
                        clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
                        discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest?version=v1'],
                        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly'
                    }).then(resolve).catch(reject);
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async syncGoogleClassroomAssignments() {
        if (!this.googleAuth) return;

        try {
            // Get all courses
            const coursesResponse = await gapi.client.classroom.courses.list({
                courseStates: ['ACTIVE']
            });

            const courses = coursesResponse.result.courses || [];
            const allAssignments = [];

            for (const course of courses) {
                // Get coursework (assignments)
                const courseworkResponse = await gapi.client.classroom.courses.courseWork.list({
                    courseId: course.id,
                    courseWorkStates: ['PUBLISHED']
                });

                const coursework = courseworkResponse.result.courseWork || [];

                coursework.forEach(work => {
                    if (work.dueDate) {
                        const dueDate = `${work.dueDate.year}-${String(work.dueDate.month).padStart(2, '0')}-${String(work.dueDate.day).padStart(2, '0')}`;
                        
                        allAssignments.push({
                            id: `google_${work.id}`,
                            title: work.title,
                            description: work.description || '',
                            dueDate: dueDate,
                            source: 'google',
                            courseName: course.name,
                            courseId: course.id,
                            googleId: work.id,
                            completed: false,
                            customColor: '#4285f4', // Google blue
                            url: work.alternateLink
                        });
                    }
                });
            }

            // Merge with existing assignments
            this.mergeAssignments(allAssignments, 'google');
            
            this.tracker.showNotification(`Synced ${allAssignments.length} assignments from Google Classroom`);
            
        } catch (error) {
            console.error('Google Classroom sync failed:', error);
            this.tracker.showNotification('Google Classroom sync failed. Check your connection.', 'error');
        }
    }

    mergeAssignments(newAssignments, source) {
        // Remove existing assignments from this source
        this.tracker.assignments = this.tracker.assignments.filter(a => a.source !== source);
        
        // Add new assignments
        this.tracker.assignments.push(...newAssignments);
        
        // Sort by due date
        this.tracker.assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // Save to localStorage
        this.tracker.saveAssignments();
        this.tracker.renderAssignments();
    }

    startAutoSync() {
        // Clear existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Sync every 30 minutes
        this.syncInterval = setInterval(() => {
            if (this.tracker.canvasConnected) {
                this.syncCanvasAssignments();
            }
            if (this.tracker.googleConnected) {
                this.syncGoogleClassroomAssignments();
            }
        }, 30 * 60 * 1000);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    disconnectCanvas() {
        this.canvasBaseURL = null;
        this.canvasToken = null;
        localStorage.removeItem('canvasURL');
        localStorage.removeItem('canvasToken');
        localStorage.removeItem('canvasUser');
        localStorage.removeItem('canvas-user-name');
        localStorage.removeItem('canvas-user-email');
        localStorage.setItem('canvasConnected', 'false');
        
        // Remove Canvas assignments
        this.tracker.assignments = this.tracker.assignments.filter(a => a.source !== 'canvas');
        this.tracker.saveAssignments();
        this.tracker.renderAssignments();
        
        this.tracker.canvasConnected = false;
    }

    disconnectGoogle() {
        if (this.googleAuth) {
            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.signOut();
        }
        
        this.googleAuth = null;
        localStorage.removeItem('googleAuth');
        localStorage.removeItem('google-user-name');
        localStorage.removeItem('google-user-email');
        localStorage.setItem('googleConnected', 'false');
        
        // Remove Google assignments
        this.tracker.assignments = this.tracker.assignments.filter(a => a.source !== 'google');
        this.tracker.saveAssignments();
        this.tracker.renderAssignments();
        
        this.tracker.googleConnected = false;
    }

    // Error handling with user-friendly messages
    handleAPIError(error, source) {
        let message = `${source} sync failed. `;
        
        if (error.status === 401) {
            message += 'Please reconnect your account.';
        } else if (error.status === 403) {
            message += 'Permission denied. Check your account permissions.';
        } else if (error.status === 429) {
            message += 'Rate limit exceeded. Please try again later.';
        } else if (!navigator.onLine) {
            message += 'No internet connection. Will retry when online.';
        } else {
            message += 'Please check your connection and try again.';
        }
        
        this.tracker.showNotification(message, 'error', 5000);
    }

    // Offline queue for when connection is restored
    queueOfflineAction(action, data) {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        offlineQueue.push({
            action,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
    }

    async processOfflineQueue() {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        
        for (const item of offlineQueue) {
            try {
                switch (item.action) {
                    case 'syncCanvas':
                        await this.syncCanvasAssignments();
                        break;
                    case 'syncGoogle':
                        await this.syncGoogleClassroomAssignments();
                        break;
                }
            } catch (error) {
                console.error('Failed to process offline queue item:', error);
            }
        }
        
        // Clear processed queue
        localStorage.setItem('offlineQueue', '[]');
    }

    // Initialize API connections on app start
    async initializeConnections() {
        // Restore Canvas connection
        const canvasURL = localStorage.getItem('canvasURL');
        const canvasToken = localStorage.getItem('canvasToken');
        
        if (canvasURL && canvasToken) {
            this.canvasBaseURL = canvasURL;
            this.canvasToken = canvasToken;
            
            try {
                await this.syncCanvasAssignments();
            } catch (error) {
                console.error('Failed to restore Canvas connection:', error);
            }
        }

        // Restore Google connection
        const googleAuth = localStorage.getItem('googleAuth');
        if (googleAuth) {
            try {
                await this.loadGoogleAPI();
                const authInstance = gapi.auth2.getAuthInstance();
                if (authInstance.isSignedIn.get()) {
                    this.googleAuth = authInstance.currentUser.get();
                    await this.syncGoogleClassroomAssignments();
                }
            } catch (error) {
                console.error('Failed to restore Google connection:', error);
            }
        }

        // Start auto-sync if any connections are active
        if (this.tracker.canvasConnected || this.tracker.googleConnected) {
            this.startAutoSync();
        }

        // Process any offline actions
        if (navigator.onLine) {
            await this.processOfflineQueue();
        }
    }
}
