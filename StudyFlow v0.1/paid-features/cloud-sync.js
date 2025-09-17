// Cloud Sync - Paid Feature

class CloudSync {
    constructor(tracker) {
        this.tracker = tracker;
        this.isPro = localStorage.getItem('isPro') === 'true';
        this.syncEndpoint = 'https://api.hwtracker.com/sync'; // Replace with actual endpoint
        this.userId = localStorage.getItem('userId');
        this.lastSync = localStorage.getItem('lastSync');
    }

    async enableCloudSync() {
        if (!this.isPro) {
            this.showUpgradePrompt();
            return;
        }

        try {
            // Initialize cloud sync
            await this.authenticateUser();
            await this.performInitialSync();
            this.startAutoSync();
            
            this.tracker.showNotification('Cloud sync enabled! Your data is now backed up.', 'success');
        } catch (error) {
            this.tracker.showNotification('Failed to enable cloud sync. Please try again.', 'error');
        }
    }

    async authenticateUser() {
        // Simulate user authentication
        if (!this.userId) {
            this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', this.userId);
        }
    }

    async performInitialSync() {
        const localData = {
            assignments: this.tracker.assignments,
            settings: this.getLocalSettings(),
            lastModified: Date.now()
        };

        // Upload local data to cloud
        await this.uploadToCloud(localData);
        
        // Download and merge cloud data
        const cloudData = await this.downloadFromCloud();
        if (cloudData) {
            this.mergeCloudData(cloudData);
        }

        this.lastSync = Date.now();
        localStorage.setItem('lastSync', this.lastSync.toString());
    }

    async uploadToCloud(data) {
        // Simulate cloud upload
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('cloudBackup', JSON.stringify(data));
                resolve();
            }, 1000);
        });
    }

    async downloadFromCloud() {
        // Simulate cloud download
        return new Promise((resolve) => {
            setTimeout(() => {
                const backup = localStorage.getItem('cloudBackup');
                resolve(backup ? JSON.parse(backup) : null);
            }, 500);
        });
    }

    mergeCloudData(cloudData) {
        if (!cloudData) return;

        // Merge assignments (cloud takes precedence for newer items)
        const cloudAssignments = cloudData.assignments || [];
        const localAssignments = this.tracker.assignments;
        
        const mergedAssignments = [...localAssignments];
        
        cloudAssignments.forEach(cloudAssignment => {
            const localIndex = mergedAssignments.findIndex(a => a.id === cloudAssignment.id);
            if (localIndex >= 0) {
                // Update if cloud version is newer
                if (cloudAssignment.lastModified > (mergedAssignments[localIndex].lastModified || 0)) {
                    mergedAssignments[localIndex] = cloudAssignment;
                }
            } else {
                // Add new assignment from cloud
                mergedAssignments.push(cloudAssignment);
            }
        });

        this.tracker.assignments = mergedAssignments;
        this.tracker.saveAssignments();
        this.tracker.renderAssignments();
    }

    getLocalSettings() {
        return {
            darkMode: this.tracker.isDarkMode,
            primaryColor: localStorage.getItem('primary-color'),
            secondaryColor: localStorage.getItem('secondary-color'),
            accentColor: localStorage.getItem('accent-color'),
            backgroundType: localStorage.getItem('background-type')
        };
    }

    startAutoSync() {
        // Sync every 5 minutes
        setInterval(() => {
            this.syncInBackground();
        }, 5 * 60 * 1000);

        // Sync when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncInBackground();
            }
        });
    }

    async syncInBackground() {
        if (!this.isPro || !navigator.onLine) return;

        try {
            const localData = {
                assignments: this.tracker.assignments,
                settings: this.getLocalSettings(),
                lastModified: Date.now()
            };

            await this.uploadToCloud(localData);
            const cloudData = await this.downloadFromCloud();
            
            if (cloudData && cloudData.lastModified > this.lastSync) {
                this.mergeCloudData(cloudData);
                this.lastSync = Date.now();
                localStorage.setItem('lastSync', this.lastSync.toString());
            }
        } catch (error) {
            console.error('Background sync failed:', error);
        }
    }

    showUpgradePrompt() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-content glass-card">
                <h2>☁️ Cloud Sync - Pro Feature</h2>
                <p>Keep your assignments synced across all your devices!</p>
                <div class="feature-list">
                    <div class="feature-item">✅ Automatic backup</div>
                    <div class="feature-item">✅ Cross-device sync</div>
                    <div class="feature-item">✅ Never lose your data</div>
                    <div class="feature-item">✅ Real-time updates</div>
                </div>
                <div class="upgrade-buttons">
                    <button class="btn btn-primary">Upgrade to Pro - $4.99/month</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}
