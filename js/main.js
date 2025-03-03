class App {
    constructor() {
        this.visualizer = new AudioVisualizer();
        this.tdConnector = new TouchDesignerConnector();
        this.globe = new Globe();
        this.isMenuOpen = false;
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.setupUploadHandler();
    }

    setupEventListeners() {
        const playButton = document.getElementById('playButton');
        const pauseButton = document.getElementById('pauseButton');
        const menuButton = document.getElementById('menuButton');
        const trackList = document.getElementById('trackList');

        playButton.addEventListener('click', () => {
            this.visualizer.play();
        });

        pauseButton.addEventListener('click', () => {
            this.visualizer.pause();
        });

        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !trackList.contains(e.target) && 
                !menuButton.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Prevent menu close when clicking inside tracklist
        trackList.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.visualizer.isPlaying) {
                        this.visualizer.pause();
                    } else {
                        this.visualizer.play();
                    }
                    break;
                case 'ArrowRight':
                    this.visualizer.nextTrack();
                    break;
                case 'ArrowLeft':
                    this.visualizer.previousTrack();
                    break;
                case 'Escape':
                    if (this.isMenuOpen) {
                        this.closeMenu();
                    }
                    break;
            }
        });
    }

    setupUploadHandler() {
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.querySelector('.upload-button');

        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => file.type === 'audio/mpeg');

            if (validFiles.length > 0) {
                // Add upload feedback animation
                uploadButton.classList.add('upload-success');
                setTimeout(() => uploadButton.classList.remove('upload-success'), 300);

                // Process each valid file
                for (const file of validFiles) {
                    await this.processUploadedFile(file);
                }
            }

            // Clear input for future uploads
            fileInput.value = '';
        });
    }

    async processUploadedFile(file) {
        try {
            // Create a new track object
            const track = {
                name: file.name.replace('.mp3', ''),
                path: URL.createObjectURL(file)
            };

            // Add to visualizer
            this.visualizer.addTrack(track);

        } catch (error) {
            console.error('Error processing uploaded file:', error);
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const menuButton = document.getElementById('menuButton');
        const trackList = document.getElementById('trackList');
        
        menuButton.classList.toggle('active', this.isMenuOpen);
        trackList.classList.toggle('open', this.isMenuOpen);
    }

    closeMenu() {
        this.isMenuOpen = false;
        const menuButton = document.getElementById('menuButton');
        const trackList = document.getElementById('trackList');
        
        menuButton.classList.remove('active');
        trackList.classList.remove('open');
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
}); 