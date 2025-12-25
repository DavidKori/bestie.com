import React, { useState, useEffect, useRef } from 'react';
import './playlist.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

const PlaylistExperience = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  // Color palette for songs (if not provided)
  const colorPalette = [
    "#ff6b9d", "#4fc3f7", "#81c784", "#ba68c8", 
    "#ffb74d", "#e57373", "#7986cb", "#4db6ac",
    "#ff8a65", "#9575cd", "#64b5f6", "#f06292"
  ];

  const [playlist, setPlaylist] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(true);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(new Audio());
  const progressInterval = useRef(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  const currentSong = playlist[currentSongIndex] || {};

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch playlist from backend
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsFetchingPlaylist(true);
        setError(null);

        // Check if we have bestie data
        let bestieInfo;
        
        if (storedBestieData) {
          // Parse stored data
          bestieInfo = JSON.parse(storedBestieData);
        } else if (secretCode) {
          // Fetch fresh data if not stored
          const result = await bestieService.getBestieByCode(secretCode);
          if (result.success) {
            bestieInfo = result.data;
            // Store for future use
            sessionStorage.setItem('bestieData', JSON.stringify(bestieInfo));
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error('No access data found');
        }

        // Extract playlist from bestie data
        if (bestieInfo && bestieInfo.playlist && bestieInfo.playlist.length > 0) {
          // Filter out songs without audio URLs
          const loadedPlaylist = bestieInfo.playlist
            .filter(song => song && (song.audioUrl || song.url))
            .map((song, index) => ({
              id: song._id || `song-${index}`,
              title: song.title || `Song ${index + 1}`,
              artist: song.artist || "Unknown Artist",
              mood: getRandomMood(),
              color: colorPalette[index % colorPalette.length],
              audioUrl: song.audioUrl || song.url,
              publicId: song.publicId,
              duration: song.duration || 0,
              format: song.format || 'mp3',
              isFromBackend: true,
              uploadedAt: song.uploadedAt
            }));

          if (loadedPlaylist.length > 0) {
            setPlaylist(loadedPlaylist);
            console.log('Loaded playlist:', loadedPlaylist.length, 'songs');
          } else {
            // No valid songs - use fallback
            useFallbackPlaylist();
          }
        } else {
          // No playlist in data - use fallback
          useFallbackPlaylist();
        }

      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError(error.message);
        useFallbackPlaylist();
        
      } finally {
        setIsFetchingPlaylist(false);
      }
    };

    const useFallbackPlaylist = () => {
      const fallbackPlaylist = [
        {
          id: 1,
          title: "First Day of My Life",
          artist: "Bright Eyes",
          mood: "That feeling of new beginnings",
          color: "#ff6b9d",
          audioUrl: "https://assets.codepen.io/1468070/First+Day+Of+My+Life+-+Bright+Eyes.mp3",
          isFromBackend: false
        },
        {
          id: 2,
          title: "Sea of Love",
          artist: "Cat Power",
          mood: "Gentle waves of affection",
          color: "#4fc3f7",
          audioUrl: "https://assets.codepen.io/1468070/Sea+of+Love+-+Cat+Power.mp3",
          isFromBackend: false
        },
        {
          id: 3,
          title: "Bloom",
          artist: "The Paper Kites",
          mood: "Things slowly unfolding beautifully",
          color: "#81c784",
          audioUrl: "https://assets.codepen.io/1468070/Bloom+-+The+Paper+Kites.mp3",
          isFromBackend: false
        }
      ];
      
      setPlaylist(fallbackPlaylist);
      console.log('Using fallback playlist');
    };

    fetchPlaylist();
  }, [secretCode, storedBestieData]);

  // Function to generate random moods
  const getRandomMood = () => {
    const moods = [
      "That feeling of new beginnings",
      "Gentle waves of affection",
      "Things slowly unfolding beautifully",
      "Finding home in each other",
      "Quiet moments that feel infinite",
      "Gentle warmth on cold days",
      "A memory captured in sound",
      "Thoughts turned into melody",
      "Moments made musical",
      "Heartbeats in harmony",
      "Whispers set to music",
      "Dreams in digital form"
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  };

  // Refresh playlist function
  const refreshPlaylist = async () => {
    try {
      setIsFetchingPlaylist(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.playlist) {
        const newPlaylist = result.data.playlist
          .filter(song => song && (song.audioUrl || song.url))
          .map((song, index) => ({
            id: song._id || `song-${index}`,
            title: song.title || `Song ${index + 1}`,
            artist: song.artist || "Unknown Artist",
            mood: getRandomMood(),
            color: colorPalette[index % colorPalette.length],
            audioUrl: song.audioUrl || song.url,
            isFromBackend: true
          }));

        if (newPlaylist.length > 0) {
          setPlaylist(newPlaylist);
          setCurrentSongIndex(0);
          setProgress(0);
          setIsPlaying(false);
          toast.success('Playlist refreshed!');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh playlist');
    } finally {
      setIsFetchingPlaylist(false);
    }
  };

  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleLoadedData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleNextSong();
    };

    const handleError = () => {
      console.error("Error loading audio");
      setIsLoading(false);
      toast.error(`Couldn't load "${currentSong.title}"`);
      
      // Fallback to simulated playback
      if (isPlaying) {
        progressInterval.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              handleNextSong();
              return 0;
            }
            return prev + 0.5;
          });
        }, 100);
      }
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      clearInterval(progressInterval.current);
    };
  }, []);

  // Handle song changes
  useEffect(() => {
    if (playlist.length === 0) return;
    
    const audio = audioRef.current;
    
    if (currentSong.audioUrl) {
      setIsLoading(true);
      audio.src = currentSong.audioUrl;
      audio.volume = isMuted ? 0 : volume;
      
      if (isPlaying) {
        audio.play().catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
    
    return () => {
      audio.pause();
    };
  }, [currentSongIndex, currentSong.audioUrl, playlist.length]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    
    if (isPlaying && currentSong.audioUrl) {
      audio.play().catch(error => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong.audioUrl]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (playlist.length === 0) {
      toast.error("No songs in playlist");
      return;
    }
    
    setIsPlaying(!isPlaying);
    if (!hasStarted) setHasStarted(true);
  };

  const handleSongSelect = (index) => {
    if (playlist.length === 0) return;
    
    setCurrentSongIndex(index);
    setProgress(0);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const handleNextSong = () => {
    if (playlist.length === 0) return;
    
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevSong = () => {
    if (playlist.length === 0) return;
    
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const percentage = (clickPosition / progressBar.offsetWidth) * 100;
    
    if (audioRef.current.duration) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleRestartPlaylist = () => {
    if (playlist.length === 0) return;
    
    setCurrentSongIndex(0);
    setProgress(0);
    setIsPlaying(true);
    setHasStarted(true);
  };

  // Auto-start first song after a moment
  useEffect(() => {
    if (playlist.length > 0 && !hasStarted) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasStarted, playlist.length]);

  // Format time display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTime = (progress / 100) * duration;

  // Loading state
  if (isFetchingPlaylist) {
    return (
      <div className="playlist-experience loading">
        <div className="loading-container">
          <div className="music-loader">
            <div className="music-bar bar-1"></div>
            <div className="music-bar bar-2"></div>
            <div className="music-bar bar-3"></div>
            <div className="music-bar bar-4"></div>
            <div className="music-bar bar-5"></div>
          </div>
          <p className="loading-text">Loading your playlist...</p>
          <p className="loading-subtext">Curating songs just for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && playlist.length === 0) {
    return (
      <div className="playlist-experience error">
        <div className="error-container">
          <div className="error-icon">🎵</div>
          <h2 className="error-title">Playlist Unavailable</h2>
          <p className="error-message">
            {error || "Couldn't load playlist at this time."}
          </p>
          {secretCode && (
            <button 
              className="refresh-playlist-btn"
              onClick={refreshPlaylist}
              disabled={isFetchingPlaylist}
            >
              {isFetchingPlaylist ? 'Refreshing...' : 'Try Again'}
            </button>
          )}
          <button 
            className="continue-anyway-btn"
            onClick={() => {
              audioRef.current.pause();
              setIsComponentComplete(true);
              toast.success("Moving forward...");
            }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  // Empty playlist state
  if (playlist.length === 0) {
    return (
      <div className="playlist-experience empty">
        <div className="empty-container">
          <div className="empty-icon">🎧</div>
          <h2 className="empty-title">No Songs Yet</h2>
          <p className="empty-message">
            Your friend hasn't added any songs to the playlist yet.
          </p>
          {secretCode && (
            <button 
              className="refresh-empty-btn"
              onClick={refreshPlaylist}
              disabled={isFetchingPlaylist}
            >
              Check for songs
            </button>
          )}
          <button 
            className="continue-empty-btn"
            onClick={() => {
              audioRef.current.pause();
              setIsComponentComplete(true);
              toast.success("Moving forward...");
            }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-experience">
      {/* Floating refresh button */}
      {secretCode && !isFetchingPlaylist && playlist[0]?.isFromBackend && (
        <button 
          className="floating-refresh-playlist"
          onClick={refreshPlaylist}
          title="Refresh playlist"
          disabled={isFetchingPlaylist}
        >
          {isFetchingPlaylist ? '🔄' : '🎵'}
        </button>
      )}
      
      {/* Playlist source indicator */}
      {playlist.length > 0 && playlist[0]?.isFromBackend && (
        <div className="playlist-source-indicator">
          <span className="source-icon">🎼</span>
          <span className="source-text">Songs from your friend</span>
        </div>
      )}
      
      {/* Animated Background */}
      <div className="animated-background">
        {/* Floating Music Notes */}
        <div className="music-note note-1">♫</div>
        <div className="music-note note-2">♪</div>
        <div className="music-note note-3">♬</div>
        <div className="music-note note-4">♫</div>
        <div className="music-note note-5">♪</div>
        <div className="music-note note-6">♬</div>
        
        {/* Light Waves */}
        <div className="light-wave wave-1"></div>
        <div className="light-wave wave-2"></div>
        <div className="light-wave wave-3"></div>
        
        {/* Glowing Particles */}
        <div className="glow-particle particle-1"></div>
        <div className="glow-particle particle-2"></div>
        <div className="glow-particle particle-3"></div>
        <div className="glow-particle particle-4"></div>
        <div className="glow-particle particle-5"></div>
      </div>

      {/* Subtle Overlay */}
      <div className="background-overlay"></div>

      <div className="experience-container">
        <header className="experience-header">
          <h1 className="experience-title">A Playlist for You</h1>
          <p className="experience-subtitle">
            {playlist[0]?.isFromBackend 
              ? `${playlist.length} songs chosen just for you` 
              : "I picked these songs thinking of you"}
          </p>
        </header>

        <main className="playlist-stage">
          {/* Central Player Section */}
          <div className="player-section">
            {/* Now Playing Card */}
            <div className="now-playing-card">
              {/* Song source badge */}
              {currentSong.isFromBackend && (
                <div className="song-source-badge">
                  <span className="badge-icon">🎯</span>
                  <span className="badge-text">From your friend</span>
                </div>
              )}
              
              <div className="album-art">
                <div 
                  className="album-cover"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentSong.color}40, ${currentSong.color}80)`,
                    boxShadow: `0 15px 35px ${currentSong.color}40`
                  }}
                >
                  <div className="vinyl-ring"></div>
                  <div className="vinyl-center"></div>
                  <div className={`vinyl-arm ${isPlaying ? 'playing' : ''}`}></div>
                </div>
                <div className="album-glow"></div>
                {isLoading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>

              <div className="song-info">
                <div className="song-meta">
                  <span className="song-badge">Now Playing</span>
                  <div className="heart-icon">💖</div>
                  {isLoading && (
                    <span className="loading-badge">Loading...</span>
                  )}
                </div>
                
                <h2 className="song-title">{currentSong.title}</h2>
                <p className="song-artist">{currentSong.artist}</p>
                <p className="song-mood">{currentSong.mood}</p>
                
                {/* Song duration info */}
                {currentSong.duration > 0 && (
                  <div className="song-duration-info">
                    <span className="duration-icon">⏱️</span>
                    <span className="duration-text">{Math.round(currentSong.duration)} seconds</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar" onClick={handleProgressClick}>
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <div 
                    className="progress-thumb"
                    style={{ left: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-time">
                  <span className="time-current">{formatTime(currentTime)}</span>
                  <span className="time-total">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Controls */}
              <div className="volume-controls">
                <button 
                  className="volume-button"
                  onClick={handleMuteToggle}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <span className="volume-icon muted">🔇</span>
                  ) : volume > 0.5 ? (
                    <span className="volume-icon">🔊</span>
                  ) : volume > 0 ? (
                    <span className="volume-icon">🔉</span>
                  ) : (
                    <span className="volume-icon">🔈</span>
                  )}
                </button>
                
                <div className="volume-slider-container">
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                  />
                  <div className="volume-track">
                    <div 
                      className="volume-fill"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="volume-percentage">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </div>
              </div>

              {/* Player Controls */}
              <div className="player-controls">
                <button 
                  className="control-button prev-button"
                  onClick={handlePrevSong}
                  disabled={currentSongIndex === 0 || isLoading || playlist.length === 0}
                >
                  <span className="control-icon">⏮</span>
                </button>
                
                <button 
                  className="play-pause-button"
                  onClick={handlePlayPause}
                  disabled={isLoading || playlist.length === 0}
                >
                  {isPlaying ? (
                    <span className="control-icon pause-icon">⏸</span>
                  ) : (
                    <span className="control-icon play-icon">▶</span>
                  )}
                  <div className="button-glow"></div>
                </button>
                
                <button 
                  className="control-button next-button"
                  onClick={handleNextSong}
                  disabled={currentSongIndex === playlist.length - 1 || isLoading || playlist.length === 0}
                >
                  <span className="control-icon">⏭</span>
                </button>
              </div>
            </div>

            {/* Playlist */}
            <div className="playlist-card">
              <div className="playlist-header">
                <h3 className="playlist-title">
                  {playlist[0]?.isFromBackend ? 'Your Dedicated Playlist' : 'Our Curated Playlist'}
                </h3>
                <div className="playlist-count">
                  <span className="song-count">{playlist.length} songs</span>
                  <span className="playlist-heart">💕</span>
                </div>
              </div>

              <div className="playlist-tracks">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className={`playlist-track ${index === currentSongIndex ? 'active' : ''} ${isHovering === index ? 'hovering' : ''}`}
                    onClick={() => handleSongSelect(index)}
                    onMouseEnter={() => setIsHovering(index)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    {/* Song source indicator */}
                    {song.isFromBackend && (
                      <div className="track-source-indicator">
                        <span className="source-dot"></span>
                      </div>
                    )}
                    
                    <div className="track-number">
                      {index + 1}
                    </div>
                    
                    <div className="track-info">
                      <div className="track-title">{song.title}</div>
                      <div className="track-artist">{song.artist}</div>
                    </div>
                    
                    <div className="track-meta">
                      <div className="track-mood">{song.mood}</div>
                      <div className="track-heart">❤️</div>
                    </div>
                    
                    <div className="track-highlight"></div>
                    {index === currentSongIndex && (
                      <div className="playing-indicator">
                        <div className="playing-bar"></div>
                        <div className="playing-bar"></div>
                        <div className="playing-bar"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="playlist-footer">
                <p className="playlist-message">
                  {playlist[0]?.isFromBackend 
                    ? "These songs were chosen with you in mind." 
                    : "You can stay here as long as you like."}
                </p>
              </div>
            </div>
          </div>

          {/* Journey Completion */}
          <div className="completion-section">
            <div className="completion-message">
              <div className="completion-icon">💖</div>
              <h3 className="completion-title">
                {playlist[0]?.isFromBackend ? 'End of your playlist' : 'End of our little journey'}
              </h3>
              <p className="completion-text">
                {playlist[0]?.isFromBackend
                  ? 'Thank you for listening. Each song here was chosen thinking of you.'
                  : 'Thank you for sharing these moments with me. Each song here holds a memory, a feeling, a piece of us.'}
              </p>
              
              <div className="completion-notes">
                <span>♫</span>
                <span>💖</span>
                <span>♪</span>
                <span>✨</span>
                <span>♬</span>
              </div>
            </div>

            <div className="completion-actions">
              <button
                className="replay-button"
                onClick={handleRestartPlaylist}
                disabled={playlist.length === 0}
              >
                <span className="replay-icon">🔁</span>
                Replay from the beginning
              </button>
              
              <button
                className="continue-button"
                onClick={() => toast.success('Saving this playlist to our memories...')}
              >
                Save this playlist 💾
              </button>
            </div>
          </div>

          {/* Skip Controls */}
          <div className="skip-section">
            <button
              className="skip-button"
              onClick={() => {
                audioRef.current.pause();
                setIsComponentComplete(true);
                toast.success(" That's all for now! 😊 ");
              }}
            >
              I'm ready to close this 💫
            </button>
            <p className="one-skip-hint">Take your time, there's no rush</p>
          </div>
        </main>

        <footer className="experience-footer">
          <p className="footer-note">
            {playlist[0]?.isFromBackend 
              ? `${playlist.length} songs made with love` 
              : "Made with love, for quiet moments"}
          </p>
          <div className="footer-notes">
            <span>♫</span>
            <span>💖</span>
            <span>♪</span>
            <span>✨</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PlaylistExperience;

