// Premium Themes - Paid Feature

class PremiumThemes {
    constructor(tracker) {
        this.tracker = tracker;
        this.isPro = localStorage.getItem('isPro') === 'true';
        this.premiumThemes = {
            neon: {
                name: 'Neon Glow',
                primary: '#ff0080',
                secondary: '#00ff80',
                accent: '#8000ff',
                background: 'radial-gradient(circle at 20% 80%, #ff0080 0%, #8000ff 50%, #00ff80 100%)',
                glowEffect: true
            },
            cyberpunk: {
                name: 'Cyberpunk',
                primary: '#00ffff',
                secondary: '#ff00ff',
                accent: '#ffff00',
                background: 'linear-gradient(45deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%)',
                scanlines: true
            },
            aurora: {
                name: 'Aurora Borealis',
                primary: '#00ff88',
                secondary: '#0088ff',
                accent: '#ff8800',
                background: 'radial-gradient(ellipse at top, #00ff88 0%, #0088ff 50%, #8800ff 100%)',
                animated: true
            },
            sunset: {
                name: 'Tropical Sunset',
                primary: '#ff6b35',
                secondary: '#f7931e',
                accent: '#ffcd3c',
                background: 'linear-gradient(180deg, #ff6b35 0%, #f7931e 50%, #ffcd3c 100%)',
                particles: true
            },
            galaxy: {
                name: 'Deep Space',
                primary: '#4c1d95',
                secondary: '#7c3aed',
                accent: '#a855f7',
                background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f0f23 100%)',
                stars: true
            }
        };
    }

    showPremiumThemes() {
        if (!this.isPro) {
            this.showUpgradePrompt();
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'themes-modal';
        modal.innerHTML = `
            <div class="themes-content glass-card">
                <div class="themes-header">
                    <h2>🎨 Premium Themes</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="themes-grid">
                    ${Object.entries(this.premiumThemes).map(([key, theme]) => `
                        <div class="theme-card" data-theme="${key}">
                            <div class="theme-preview" style="background: ${theme.background}">
                                <div class="preview-card" style="border-left-color: ${theme.accent}">
                                    <div class="preview-title" style="color: ${theme.primary}">Sample Assignment</div>
                                    <div class="preview-date" style="color: ${theme.secondary}">Due in 2 days</div>
                                </div>
                            </div>
                            <div class="theme-info">
                                <h3>${theme.name}</h3>
                                <button class="btn btn-primary apply-theme-btn">Apply Theme</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeThemeListeners();
    }

    initializeThemeListeners() {
        document.querySelectorAll('.apply-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeCard = e.target.closest('.theme-card');
                const themeKey = themeCard.dataset.theme;
                this.applyPremiumTheme(themeKey);
            });
        });
    }

    applyPremiumTheme(themeKey) {
        const theme = this.premiumThemes[themeKey];
        if (!theme) return;

        // Apply colors
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--accent-color', theme.accent);

        // Apply background
        document.body.style.background = theme.background;

        // Apply special effects
        this.applySpecialEffects(theme);

        // Save theme
        localStorage.setItem('premium-theme', themeKey);
        localStorage.setItem('primary-color', theme.primary);
        localStorage.setItem('secondary-color', theme.secondary);
        localStorage.setItem('accent-color', theme.accent);

        this.tracker.showNotification(`${theme.name} theme applied!`, 'success');
        
        // Close modal
        const modal = document.querySelector('.themes-modal');
        if (modal) modal.remove();
    }

    applySpecialEffects(theme) {
        // Remove existing effects
        this.removeSpecialEffects();

        if (theme.glowEffect) {
            this.addGlowEffect();
        }

        if (theme.scanlines) {
            this.addScanlines();
        }

        if (theme.animated) {
            this.addAnimatedBackground();
        }

        if (theme.particles) {
            this.addParticleEffect();
        }

        if (theme.stars) {
            this.addStarField();
        }
    }

    removeSpecialEffects() {
        const effects = document.querySelectorAll('.special-effect');
        effects.forEach(effect => effect.remove());
        
        document.body.classList.remove('glow-effect', 'scanlines', 'animated-bg', 'particles', 'stars');
    }

    addGlowEffect() {
        document.body.classList.add('glow-effect');
        
        const style = document.createElement('style');
        style.className = 'special-effect';
        style.textContent = `
            .glow-effect .glass-card {
                box-shadow: 0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(128, 0, 255, 0.2);
            }
            .glow-effect .assignment-card:hover {
                box-shadow: 0 0 30px rgba(255, 0, 128, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    addScanlines() {
        document.body.classList.add('scanlines');
        
        const scanlines = document.createElement('div');
        scanlines.className = 'special-effect scanlines-overlay';
        scanlines.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.03) 2px,
                rgba(0, 255, 255, 0.03) 4px
            );
            animation: scanlines 0.1s linear infinite;
        `;
        
        const style = document.createElement('style');
        style.className = 'special-effect';
        style.textContent = `
            @keyframes scanlines {
                0% { transform: translateY(0); }
                100% { transform: translateY(4px); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(scanlines);
    }

    addAnimatedBackground() {
        document.body.classList.add('animated-bg');
        
        const style = document.createElement('style');
        style.className = 'special-effect';
        style.textContent = `
            .animated-bg {
                animation: aurora 10s ease-in-out infinite;
            }
            @keyframes aurora {
                0%, 100% { filter: hue-rotate(0deg); }
                50% { filter: hue-rotate(90deg); }
            }
        `;
        document.head.appendChild(style);
    }

    addParticleEffect() {
        const particles = document.createElement('div');
        particles.className = 'special-effect particles-container';
        particles.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 2}s;
            `;
            particles.appendChild(particle);
        }

        const style = document.createElement('style');
        style.className = 'special-effect';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(particles);
    }

    addStarField() {
        const stars = document.createElement('div');
        stars.className = 'special-effect stars-container';
        stars.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            stars.appendChild(star);
        }

        const style = document.createElement('style');
        style.className = 'special-effect';
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(stars);
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('premium-theme');
        if (savedTheme && this.isPro && this.premiumThemes[savedTheme]) {
            this.applyPremiumTheme(savedTheme);
        }
    }

    showUpgradePrompt() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="upgrade-content glass-card">
                <h2>🎨 Premium Themes - Pro Feature</h2>
                <p>Unlock stunning visual themes with special effects!</p>
                <div class="theme-previews">
                    ${Object.entries(this.premiumThemes).slice(0, 3).map(([key, theme]) => `
                        <div class="mini-preview" style="background: ${theme.background}">
                            <span>${theme.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="feature-list">
                    <div class="feature-item">✨ 5+ Premium Themes</div>
                    <div class="feature-item">🌟 Special Visual Effects</div>
                    <div class="feature-item">🎭 Animated Backgrounds</div>
                    <div class="feature-item">⚡ Particle Systems</div>
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
