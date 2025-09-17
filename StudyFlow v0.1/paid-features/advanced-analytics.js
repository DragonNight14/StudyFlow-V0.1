// Advanced Analytics - Paid Feature

class AdvancedAnalytics {
    constructor(tracker) {
        this.tracker = tracker;
        this.isPro = localStorage.getItem('isPro') === 'true';
    }

    generateProductivityReport() {
        if (!this.isPro) {
            this.showUpgradePrompt('Advanced Analytics');
            return;
        }

        const assignments = this.tracker.assignments;
        const completedAssignments = assignments.filter(a => a.completed);
        const now = new Date();
        
        // Calculate metrics
        const metrics = {
            totalAssignments: assignments.length,
            completedCount: completedAssignments.length,
            completionRate: assignments.length > 0 ? (completedAssignments.length / assignments.length * 100).toFixed(1) : 0,
            averageCompletionTime: this.calculateAverageCompletionTime(completedAssignments),
            productivityTrend: this.calculateProductivityTrend(),
            subjectBreakdown: this.getSubjectBreakdown(assignments),
            weeklyProgress: this.getWeeklyProgress(),
            streakAnalysis: this.getStreakAnalysis()
        };

        this.renderAnalyticsDashboard(metrics);
    }

    calculateAverageCompletionTime(completedAssignments) {
        if (completedAssignments.length === 0) return 0;
        
        let totalDays = 0;
        let validAssignments = 0;

        completedAssignments.forEach(assignment => {
            if (assignment.completedDate && assignment.createdDate) {
                const completed = new Date(assignment.completedDate);
                const created = new Date(assignment.createdDate);
                const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
                totalDays += days;
                validAssignments++;
            }
        });

        return validAssignments > 0 ? (totalDays / validAssignments).toFixed(1) : 0;
    }

    calculateProductivityTrend() {
        const last30Days = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = this.tracker.assignments.filter(a => 
                a.completed && a.completedDate === dateStr
            ).length;
            
            last30Days.push({ date: dateStr, completions: dayCompletions });
        }
        
        return last30Days;
    }

    getSubjectBreakdown(assignments) {
        const subjects = {};
        
        assignments.forEach(assignment => {
            const subject = assignment.courseName || assignment.subject || 'Other';
            if (!subjects[subject]) {
                subjects[subject] = { total: 0, completed: 0 };
            }
            subjects[subject].total++;
            if (assignment.completed) {
                subjects[subject].completed++;
            }
        });
        
        return Object.entries(subjects).map(([name, data]) => ({
            name,
            total: data.total,
            completed: data.completed,
            completionRate: ((data.completed / data.total) * 100).toFixed(1)
        }));
    }

    getWeeklyProgress() {
        const weeks = [];
        const now = new Date();
        
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const weekAssignments = this.tracker.assignments.filter(a => {
                const dueDate = new Date(a.dueDate);
                return dueDate >= weekStart && dueDate <= weekEnd;
            });
            
            const completed = weekAssignments.filter(a => a.completed).length;
            
            weeks.push({
                week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                total: weekAssignments.length,
                completed: completed,
                completionRate: weekAssignments.length > 0 ? ((completed / weekAssignments.length) * 100).toFixed(1) : 0
            });
        }
        
        return weeks;
    }

    getStreakAnalysis() {
        return {
            currentStreak: this.tracker.completionStreak,
            longestStreak: parseInt(localStorage.getItem('longestStreak')) || 0,
            streakGoal: parseInt(localStorage.getItem('streakGoal')) || 7,
            streakHistory: JSON.parse(localStorage.getItem('streakHistory')) || []
        };
    }

    renderAnalyticsDashboard(metrics) {
        const modal = document.createElement('div');
        modal.className = 'analytics-modal';
        modal.innerHTML = `
            <div class="analytics-content glass-card">
                <div class="analytics-header">
                    <h2>📊 Advanced Analytics</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="analytics-grid">
                    <div class="metric-card glass-card">
                        <h3>Completion Rate</h3>
                        <div class="metric-value">${metrics.completionRate}%</div>
                        <div class="metric-subtitle">${metrics.completedCount}/${metrics.totalAssignments} completed</div>
                    </div>
                    
                    <div class="metric-card glass-card">
                        <h3>Avg. Completion Time</h3>
                        <div class="metric-value">${metrics.averageCompletionTime}</div>
                        <div class="metric-subtitle">days per assignment</div>
                    </div>
                    
                    <div class="metric-card glass-card">
                        <h3>Current Streak</h3>
                        <div class="metric-value">${metrics.streakAnalysis.currentStreak}</div>
                        <div class="metric-subtitle">days in a row</div>
                    </div>
                    
                    <div class="metric-card glass-card">
                        <h3>Best Streak</h3>
                        <div class="metric-value">${metrics.streakAnalysis.longestStreak}</div>
                        <div class="metric-subtitle">personal record</div>
                    </div>
                </div>
                
                <div class="charts-section">
                    <div class="chart-container glass-card">
                        <h3>Subject Performance</h3>
                        <div class="subject-breakdown">
                            ${metrics.subjectBreakdown.map(subject => `
                                <div class="subject-item">
                                    <div class="subject-name">${subject.name}</div>
                                    <div class="subject-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${subject.completionRate}%"></div>
                                        </div>
                                        <span>${subject.completionRate}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="chart-container glass-card">
                        <h3>Weekly Progress</h3>
                        <div class="weekly-chart">
                            ${metrics.weeklyProgress.map(week => `
                                <div class="week-bar">
                                    <div class="bar" style="height: ${Math.max(week.completionRate, 5)}%"></div>
                                    <div class="week-label">${week.week}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showUpgradePrompt(feature) {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-content glass-card">
                <h2>⭐ Upgrade to Pro</h2>
                <p>Unlock ${feature} and other premium features:</p>
                <ul>
                    <li>📊 Advanced Analytics & Reports</li>
                    <li>☁️ Cloud Sync Across Devices</li>
                    <li>🎨 Custom Themes & Backgrounds</li>
                    <li>📈 Productivity Insights</li>
                    <li>🔔 Smart Notifications</li>
                </ul>
                <div class="upgrade-buttons">
                    <button class="btn btn-primary">Upgrade Now - $4.99/month</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Maybe Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}
