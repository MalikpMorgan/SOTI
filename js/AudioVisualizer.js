class AudioVisualizer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.sound = null;
        this.isPlaying = false;
        this.tracks = [];
        this.currentTrackIndex = -1;
        this.currentTrackDisplay = document.querySelector('.current-track-info');

        this.initialize();
        this.loadMusicFolder();
    }

    initialize() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start animation loop
        this.animate();
    }

    loadMusicFolder() {
        this.asyncLoadMusicFolder().then(() => {
            this.updateTrackList();
        });
    }

    async asyncLoadMusicFolder() {
        try {
            const response = await fetch('music/tracks.json');
            const data = await response.json();
            
            data.tracks.forEach(track => {
                this.addTrack(track);
            });
        } catch (error) {
            console.error('Error loading music folder:', error);
        }
    }

    addTrack(trackInfo) {
        const track = {
            path: trackInfo.path,
            name: trackInfo.name,
            loaded: false,
            isUploaded: trackInfo.path.startsWith('blob:') // Check if it's an uploaded file
        };
        
        this.tracks.push(track);
        this.updateTrackList();
        
        if (this.tracks.length === 1) {
            this.loadTrack(0);
        }
    }

    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrackIndex = index;
            
            if (this.sound) {
                this.sound.unload();
            }
            
            // Update current track display
            this.updateCurrentTrackDisplay(this.tracks[index].name);
            this.updateActiveTrack(index);
            
            this.sound = new Howl({
                src: [this.tracks[index].path],
                format: ['mp3', 'm4a'],
                onload: () => {
                    this.updateDurationDisplay();
                },
                onplay: () => {
                    this.isPlaying = true;
                    document.getElementById('playButton').style.display = 'none';
                    document.getElementById('pauseButton').style.display = 'inline-flex';
                    this.currentTrackDisplay.classList.add('playing');
                    this.updateActiveTrack(index);
                    requestAnimationFrame(() => this.updateTimeDisplay());
                },
                onpause: () => {
                    this.isPlaying = false;
                    document.getElementById('playButton').style.display = 'inline-flex';
                    document.getElementById('pauseButton').style.display = 'none';
                    this.currentTrackDisplay.classList.remove('playing');
                },
                onstop: () => {
                    this.isPlaying = false;
                    document.getElementById('playButton').style.display = 'inline-flex';
                    document.getElementById('pauseButton').style.display = 'none';
                    this.currentTrackDisplay.classList.remove('playing');
                },
                onend: () => {
                    this.nextTrack();
                }
            });
        }
    }

    play() {
        if (this.sound) {
            this.sound.play();
        }
    }

    pause() {
        if (this.sound) {
            this.sound.pause();
        }
    }

    updateTimeDisplay() {
        if (this.sound && this.isPlaying) {
            const currentTime = this.sound.seek();
            document.getElementById('currentTime').textContent = this.formatTime(currentTime);
            requestAnimationFrame(() => this.updateTimeDisplay());
        }
    }

    updateDurationDisplay() {
        if (this.sound) {
            const duration = this.sound.duration();
            document.getElementById('duration').textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
    }

    previousTrack() {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(prevIndex);
    }

    updateTrackList() {
        const trackListContent = document.querySelector('.track-list-content');
        trackListContent.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = `track-item${index === this.currentTrackIndex ? ' active' : ''}`;
            
            const trackName = document.createElement('div');
            trackName.className = 'track-name';
            trackName.textContent = track.name;
            trackItem.appendChild(trackName);
            
            if (track.isUploaded) {
                const uploadedIcon = document.createElement('div');
                uploadedIcon.className = 'uploaded-icon';
                uploadedIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                    </svg>
                `;
                trackItem.appendChild(uploadedIcon);
            }
            
            trackItem.addEventListener('click', () => {
                this.loadTrack(index);
                this.play();
                
                // Add click feedback
                trackItem.style.transform = 'translateX(10px)';
                setTimeout(() => {
                    trackItem.style.transform = 'translateX(0)';
                }, 200);
            });
            
            trackListContent.appendChild(trackItem);
        });

        // Update active track highlighting
        if (this.currentTrackIndex >= 0) {
            this.updateActiveTrack(this.currentTrackIndex);
        }
    }

    updateCurrentTrackDisplay(trackName) {
        if (this.currentTrackDisplay) {
            this.currentTrackDisplay.textContent = trackName;
        }
    }

    updateActiveTrack(index) {
        // Remove active class from all tracks
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach(item => item.classList.remove('active'));

        // Add active class to current track
        if (index >= 0) {
            const activeTrack = trackItems[index];
            if (activeTrack) {
                activeTrack.classList.add('active');
                
                // Ensure the active track is visible in the scroll view
                const trackList = document.querySelector('.track-list-content');
                if (trackList) {
                    const trackTop = activeTrack.offsetTop;
                    const trackHeight = activeTrack.offsetHeight;
                    const listHeight = trackList.clientHeight;
                    const scrollTop = trackList.scrollTop;

                    // Check if track is outside visible area
                    if (trackTop < scrollTop || trackTop + trackHeight > scrollTop + listHeight) {
                        trackList.scrollTo({
                            top: trackTop - listHeight / 2 + trackHeight / 2,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
    }
} 