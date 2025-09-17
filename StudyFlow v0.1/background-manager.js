// Background Manager - Pattern and Image Upload Functionality

class BackgroundManager {
    constructor(tracker) {
        this.tracker = tracker;
        this.patterns = {
            dots: this.generateDotsPattern,
            grid: this.generateGridPattern,
            waves: this.generateWavesPattern,
            hexagon: this.generateHexagonPattern
        };
    }

    applyBackground(type) {
        const body = document.body;
        
        // Remove existing background classes
        body.classList.remove('pattern-bg', 'image-bg', 'solid-bg');
        
        // Remove existing pattern elements
        const existingPattern = document.querySelector('.background-pattern');
        if (existingPattern) {
            existingPattern.remove();
        }

        switch (type) {
            case 'gradient':
                this.applyGradientBackground();
                break;
            case 'pattern':
                this.applyPatternBackground();
                break;
            case 'image':
                this.applyImageBackground();
                break;
            case 'solid':
                this.applySolidBackground();
                break;
        }
    }

    applyGradientBackground() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
        
        document.body.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    }

    applyPatternBackground() {
        const savedPattern = localStorage.getItem('background-pattern') || 'dots';
        this.applyPattern(savedPattern);
    }

    applyPattern(patternName) {
        if (!this.patterns[patternName]) return;

        const patternElement = document.createElement('div');
        patternElement.className = 'background-pattern';
        patternElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
            opacity: 0.1;
        `;

        this.patterns[patternName](patternElement);
        document.body.appendChild(patternElement);
        document.body.classList.add('pattern-bg');

        localStorage.setItem('background-pattern', patternName);
    }

    generateDotsPattern(element) {
        element.style.background = `
            radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, white 2px, transparent 2px)
        `;
        element.style.backgroundSize = '50px 50px';
        element.style.backgroundPosition = '0 0, 25px 25px';
    }

    generateGridPattern(element) {
        element.style.background = `
            linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px)
        `;
        element.style.backgroundSize = '30px 30px';
    }

    generateWavesPattern(element) {
        const svg = `
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30c15 0 15-30 30-30s15 30 30 30v30H0V30z" fill="white" opacity="0.3"/>
            </svg>
        `;
        const encodedSvg = encodeURIComponent(svg);
        element.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
        element.style.backgroundSize = '60px 60px';
    }

    generateHexagonPattern(element) {
        const svg = `
            <svg width="56" height="100" viewBox="0 0 56 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 66L0 50V16l28-16 28 16v34L28 66z" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
                <path d="M28 0L0 16v34l28 16 28-16V16L28 0z" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
            </svg>
        `;
        const encodedSvg = encodeURIComponent(svg);
        element.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
        element.style.backgroundSize = '56px 100px';
    }

    applyImageBackground() {
        const savedImage = localStorage.getItem('background-image');
        if (savedImage) {
            document.body.style.background = `url(${savedImage}) center/cover no-repeat`;
            document.body.classList.add('image-bg');
        }
    }

    applySolidBackground() {
        const savedColor = localStorage.getItem('background-solid-color') || '#0f172a';
        document.body.style.background = savedColor;
        document.body.classList.add('solid-bg');
    }

    handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.tracker.showNotification('Please select a valid image file', 'error');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.tracker.showNotification('Image file too large. Please choose a file under 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            localStorage.setItem('background-image', imageData);
            localStorage.setItem('background-type', 'image');
            
            this.applyImageBackground();
            this.tracker.showNotification('Background image updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    updateSolidColor(color) {
        localStorage.setItem('background-solid-color', color);
        localStorage.setItem('background-type', 'solid');
        this.applySolidBackground();
    }

    // Initialize background on app load
    initializeBackground() {
        const backgroundType = localStorage.getItem('background-type') || 'gradient';
        this.applyBackground(backgroundType);
    }

    // Create background preview for settings
    createPatternPreview(patternName) {
        const preview = document.createElement('div');
        preview.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 8px;
            border: 2px solid var(--glass-border);
            overflow: hidden;
            position: relative;
            background: var(--glass-bg);
        `;

        const patternDiv = document.createElement('div');
        patternDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.5;
        `;

        if (this.patterns[patternName]) {
            this.patterns[patternName](patternDiv);
        }

        preview.appendChild(patternDiv);
        return preview;
    }

    // Export/Import background settings
    exportBackgroundSettings() {
        return {
            type: localStorage.getItem('background-type'),
            pattern: localStorage.getItem('background-pattern'),
            image: localStorage.getItem('background-image'),
            solidColor: localStorage.getItem('background-solid-color')
        };
    }

    importBackgroundSettings(settings) {
        if (settings.type) localStorage.setItem('background-type', settings.type);
        if (settings.pattern) localStorage.setItem('background-pattern', settings.pattern);
        if (settings.image) localStorage.setItem('background-image', settings.image);
        if (settings.solidColor) localStorage.setItem('background-solid-color', settings.solidColor);
        
        this.initializeBackground();
    }
}

// Add CSS for background patterns
const backgroundStyles = document.createElement('style');
backgroundStyles.textContent = `
    body.pattern-bg {
        position: relative;
    }

    body.image-bg::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: -1;
        pointer-events: none;
    }

    body.solid-bg {
        background-attachment: fixed;
    }

    .background-pattern {
        animation: patternFloat 20s ease-in-out infinite;
    }

    @keyframes patternFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
    }

    /* Pattern options in settings */
    .pattern-option {
        position: relative;
        overflow: hidden;
    }

    .pattern-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.2;
        pointer-events: none;
    }

    .pattern-option[data-pattern="dots"]::before {
        background: radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px),
                   radial-gradient(circle at 75% 75%, currentColor 2px, transparent 2px);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
    }

    .pattern-option[data-pattern="grid"]::before {
        background: linear-gradient(currentColor 1px, transparent 1px),
                   linear-gradient(90deg, currentColor 1px, transparent 1px);
        background-size: 15px 15px;
    }

    .pattern-option[data-pattern="waves"]::before {
        background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20c10 0 10-20 20-20s10 20 20 20v20H0V20z' fill='%23ffffff' opacity='0.3'/%3E%3C/svg%3E");
        background-size: 40px 40px;
    }

    .pattern-option[data-pattern="hexagon"]::before {
        background-image: url("data:image/svg+xml,%3Csvg width='28' height='50' viewBox='0 0 28 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 33L0 25V8l14-8 14 8v17L14 33z' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.3'/%3E%3C/svg%3E");
        background-size: 28px 50px;
    }
`;

document.head.appendChild(backgroundStyles);
