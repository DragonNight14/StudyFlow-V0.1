// Assignment Editor - Enhanced editing functionality

class AssignmentEditor {
    constructor(tracker) {
        this.tracker = tracker;
        this.currentAssignment = null;
        this.modal = null;
    }

    editAssignment(assignmentId) {
        this.currentAssignment = this.tracker.assignments.find(a => a.id === assignmentId);
        if (!this.currentAssignment) return;

        // Only allow editing of manual assignments
        if (this.currentAssignment.source && this.currentAssignment.source !== 'manual') {
            this.tracker.showNotification('Cannot edit assignments from Canvas or Google Classroom', 'error');
            return;
        }

        this.showEditModal();
    }

    showEditModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'edit-modal';
        this.modal.innerHTML = `
            <div class="edit-content glass-card">
                <div class="edit-header">
                    <h2>✏️ Edit Assignment</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <form class="edit-form" id="edit-form">
                    <div class="form-section">
                        <h3>📚 Basic Information</h3>
                        
                        <div class="form-group">
                            <label for="edit-title">Assignment Title *</label>
                            <input type="text" id="edit-title" value="${this.currentAssignment.title}" required>
                        </div>

                        <div class="form-group">
                            <label for="edit-description">Description</label>
                            <textarea id="edit-description" rows="3">${this.currentAssignment.description || ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-subject">Subject</label>
                                <select id="edit-subject">
                                    <option value="">Select a subject</option>
                                    <option value="math" ${this.currentAssignment.subject === 'math' ? 'selected' : ''}>Mathematics</option>
                                    <option value="science" ${this.currentAssignment.subject === 'science' ? 'selected' : ''}>Science</option>
                                    <option value="english" ${this.currentAssignment.subject === 'english' ? 'selected' : ''}>English</option>
                                    <option value="history" ${this.currentAssignment.subject === 'history' ? 'selected' : ''}>History</option>
                                    <option value="art" ${this.currentAssignment.subject === 'art' ? 'selected' : ''}>Art</option>
                                    <option value="pe" ${this.currentAssignment.subject === 'pe' ? 'selected' : ''}>Physical Education</option>
                                    <option value="music" ${this.currentAssignment.subject === 'music' ? 'selected' : ''}>Music</option>
                                    <option value="other" ${this.currentAssignment.subject === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="edit-course">Course Name</label>
                                <input type="text" id="edit-course" value="${this.currentAssignment.courseName || ''}">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>📅 Due Date & Time</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-date">Due Date *</label>
                                <input type="date" id="edit-date" value="${this.currentAssignment.dueDate}" required>
                            </div>

                            <div class="form-group">
                                <label for="edit-time">Due Time</label>
                                <input type="time" id="edit-time" value="${this.currentAssignment.dueTime || '23:59'}">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>🎨 Customization</h3>
                        
                        <div class="form-group">
                            <label for="edit-color">Color Theme</label>
                            <div class="color-picker-group">
                                <input type="color" id="edit-color" value="${this.currentAssignment.customColor || '#f59e0b'}">
                                <div class="color-preview" id="edit-color-preview" style="background: ${this.currentAssignment.customColor || '#f59e0b'};"></div>
                            </div>
                            <div class="color-presets">
                                <button type="button" class="color-preset" data-color="#ef4444" style="background: #ef4444;"></button>
                                <button type="button" class="color-preset" data-color="#f59e0b" style="background: #f59e0b;"></button>
                                <button type="button" class="color-preset" data-color="#10b981" style="background: #10b981;"></button>
                                <button type="button" class="color-preset" data-color="#3b82f6" style="background: #3b82f6;"></button>
                                <button type="button" class="color-preset" data-color="#8b5cf6" style="background: #8b5cf6;"></button>
                                <button type="button" class="color-preset" data-color="#f43f5e" style="background: #f43f5e;"></button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Priority Level</label>
                            <div class="priority-selector">
                                <div class="priority-option ${this.currentAssignment.priority === 'low' ? 'selected' : ''}" data-priority="low">
                                    📗 Low Priority
                                </div>
                                <div class="priority-option ${this.currentAssignment.priority === 'medium' || !this.currentAssignment.priority ? 'selected' : ''}" data-priority="medium">
                                    📙 Medium Priority
                                </div>
                                <div class="priority-option ${this.currentAssignment.priority === 'high' ? 'selected' : ''}" data-priority="high">
                                    📕 High Priority
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.edit-modal').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            💾 Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.initializeEditListeners();
    }

    initializeEditListeners() {
        const form = document.getElementById('edit-form');
        const colorInput = document.getElementById('edit-color');
        const colorPreview = document.getElementById('edit-color-preview');
        const colorPresets = document.querySelectorAll('.color-preset');
        const priorityOptions = document.querySelectorAll('.priority-option');

        // Color picker functionality
        colorInput.addEventListener('change', (e) => {
            colorPreview.style.background = e.target.value;
        });

        // Color preset functionality
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                colorInput.value = color;
                colorPreview.style.background = color;
            });
        });

        // Priority selection
        priorityOptions.forEach(option => {
            option.addEventListener('click', () => {
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveChanges();
        });
    }

    saveChanges() {
        const updatedData = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            subject: document.getElementById('edit-subject').value,
            courseName: document.getElementById('edit-course').value,
            dueDate: document.getElementById('edit-date').value,
            dueTime: document.getElementById('edit-time').value,
            customColor: document.getElementById('edit-color').value,
            priority: document.querySelector('.priority-option.selected').dataset.priority,
            lastModified: Date.now()
        };

        // Validate required fields
        if (!updatedData.title || !updatedData.dueDate) {
            this.tracker.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Update the assignment
        Object.assign(this.currentAssignment, updatedData);

        // Save to localStorage
        this.tracker.saveAssignments();
        this.tracker.renderAssignments();

        // Close modal
        this.modal.remove();

        this.tracker.showNotification('Assignment updated successfully! ✨', 'success');
    }
}

// Add styles for the edit modal
const editModalStyles = document.createElement('style');
editModalStyles.textContent = `
    .edit-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    }

    .edit-content {
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        margin: 1rem;
        padding: 2rem;
        animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .edit-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--glass-border);
    }

    .edit-header h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }

    .close-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        transition: var(--transition-smooth);
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @media (max-width: 768px) {
        .edit-content {
            margin: 0.5rem;
            padding: 1.5rem;
            max-height: 95vh;
        }
    }
`;

document.head.appendChild(editModalStyles);
