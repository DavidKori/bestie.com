
import React, { useState, useRef, useEffect } from 'react';
import './songDedication.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

function SongDedication({ onComplete, onContinue, stepIndex, totalSteps }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [songData, setSongData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');
  
  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch song dedication data
  useEffect(() => {
    const fetchSongDedication = async () => {
      try {
        setIsLoading(true);
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
        
        // Extract song dedication data
        if (bestieInfo && bestieInfo.songDedicationData) {
          const song = {
            url: bestieInfo.songDedicationData.url,
            publicId: bestieInfo.songDedicationData.publicId,
            title: "A Song Just For You",
            description: bestieInfo.songDedication || "Every frame, every note, was chosen with you in my heart",
            resourceType: bestieInfo.songDedicationData.resourceType || 'video',
            duration: bestieInfo.songDedicationData.duration || 0,
            filename: bestieInfo.songDedicationData.filename || 'song-dedication',
            thumbnail: bestieInfo.songDedicationData.url // Cloudinary URL can be used directly
          };
          
          setSongData(song);
          console.log('Song dedication data loaded:', song);
          
          // Auto-create floating elements after data is loaded
          setTimeout(() => {
            createFloatingElements();
          }, 500);
          
        } else {
          // No song dedication set by admin
          setSongData({
            url: null,
            title: "No Song Dedication Yet",
            description: "Your friend hasn't added a song dedication yet.",
            resourceType: 'none'
          });
        }
        
      } catch (error) {
        console.error('Error fetching song dedication:', error);
        setError(error.message);
        toast.error('Failed to load song dedication');
        
        // Set fallback data
        setSongData({
          url: null,
          title: "Connection Issue",
          description: "Having trouble loading your special song. Please try again.",
          resourceType: 'none'
        });
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongDedication();
  }, [secretCode, storedBestieData]);

  // Function to create floating elements
  const createFloatingElements = () => {
    const container = document.querySelector('.floating-elements');
    if (!container) return;

    // Clear existing elements
    container.innerHTML = '';

    // Create hearts
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.innerHTML = '💗';
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.top = `${Math.random() * 100}%`;
      heart.style.fontSize = `${1 + Math.random() * 2}rem`;
      heart.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(heart);
    }

    // Create music notes
    for (let i = 0; i < 8; i++) {
      const note = document.createElement('div');
      note.className = 'floating-note';
      note.innerHTML = i % 2 === 0 ? '🎵' : '🎶';
      note.style.left = `${Math.random() * 100}%`;
      note.style.top = `${Math.random() * 100}%`;
      note.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      note.style.animationDelay = `${Math.random() * 7}s`;
      container.appendChild(note);
    }
  };

  // Auto-hide controls after delay
  useEffect(() => {
    let controlsTimeout;
    if (isPlaying && showControls) {
      controlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [isPlaying, showControls]);

  const handlePlayPause = () => {
    if (!videoRef.current || !songData?.url) {
      if (!songData?.url) {
        toast.error("No song dedication available yet");
      }
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        toast.error('Could not play the video');
      });
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleVideoClick = () => {
    if (!songData?.url) return;
    setShowControls(!showControls);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const buffered = videoRef.current.buffered;
      if (buffered.length > 0) {
        setIsBuffering(buffered.end(0) < videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !songData?.url) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
    setShowControls(true);
  };

  const handleContinue = () => {
    setIsComponentComplete(true);
    if (onComplete) onComplete();
    toast.success("slow but sure 😉");
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle refresh of song data
  const handleRefreshSong = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.songDedicationData) {
        const newSong = {
          url: result.data.songDedicationData.url,
          title: "A Song Just For You",
          description: result.data.songDedication || "Every frame, every note, was chosen with you in my heart",
          resourceType: result.data.songDedicationData.resourceType || 'video'
        };
        
        setSongData(newSong);
        toast.success('Song dedication refreshed!');
      }
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="video-dedication-container loading">
        <div className="loading-overlay">
          <div className="music-loader">
            <div className="music-note note-1">🎵</div>
            <div className="music-note note-2">🎶</div>
            <div className="music-note note-3">🎵</div>
          </div>
          <p className="loading-text">Loading your special song...</p>
          <p className="loading-subtext">Preparing a moment made just for you</p>
        </div>
      </div>
    );
  }

  // Show error/empty state
  if (error || !songData?.url) {
    return (
      <div className="video-dedication-container error">
        <div className="error-overlay">
          <div className="error-icon">🎵</div>
          <h2 className="error-title">
            {songData?.url ? 'Connection Issue' : 'No Song Yet'}
          </h2>
          <p className="error-message">
            {songData?.description || 'Your friend will add a song dedication soon!'}
          </p>
          {secretCode && (
            <button 
              className="refresh-button"
              onClick={handleRefreshSong}
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Check for Updates'}
            </button>
          )}
          <button 
            className="continue-anyway-button"
            onClick={handleContinue}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-dedication-container" ref={containerRef}>
      {/* Refresh button (floating) */}
      {secretCode && (
        <button 
          className="floating-refresh-btn"
          onClick={handleRefreshSong}
          title="Refresh song data"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '↻'}
        </button>
      )}
      
      {/* Cinematic Background Layers */}
      <div className="cinematic-background"></div>
      <div className="gradient-overlay"></div>
      <div className="light-leak"></div>
      
      {/* Floating Elements */}
      <div className="floating-elements"></div>
      
      {/* Light Particles */}
      <div className="light-particle light-1"></div>
      <div className="light-particle light-2"></div>
      <div className="light-particle light-3"></div>

      <main className="dedication-content">
        {/* Title Section - Only shows before playing */}
        {!hasStarted && (
          <div className="title-section">
            <div className="title-wrapper">
              <h1 className="cinematic-title">
                <span className="title-line title-line-1">This Moment</span>
                <span className="title-line title-line-2">Was Made</span>
                <span className="title-line title-line-3">For You</span>
              </h1>
              <div className="title-glow"></div>
            </div>
            
            <div className="invitation-text">
              <p className="invitation-line">
                I chose this song for you with every memory of you in mind
              </p>
              <p className="invitation-line">
                Press play when you're ready to begin
              </p>
              <div className="play-prompt">
                <span className="prompt-icon">👇</span>
                <span className="prompt-text">Press play below</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="video-container">
          {/* Video Glow Effect */}
          <div 
            className="video-glow"
            style={{ 
              opacity: isPlaying ? 0.8 : 0.3,
              filter: `blur(${isPlaying ? '40px' : '20px'})`
            }}
          ></div>
          
          {/* Video Wrapper */}
          <div 
            className="video-wrapper"
            onClick={handleVideoClick}
            data-playing={isPlaying}
          >
            {/* Video/audio Element */}
            {songData.resourceType === 'video' || songData.resourceType === 'audio' ? (
              songData.resourceType === 'video' ? (
                <video
                  ref={videoRef}
                  key={songData.url} // This forces re-render when URL changes
                  className="dedication-video"
                  src={songData.url}
                  poster={songData.thumbnail}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onProgress={handleProgress}
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Video error:', e);
                    toast.error('Error playing video');
                  }}
                  playsInline
                  preload="metadata"
                >
                  <source src={songData.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio
                  ref={videoRef}
                  key={songData.url}
                  className="dedication-audio"
                  src={songData.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onProgress={handleProgress}
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Audio error:', e);
                    toast.error('Error playing audio');
                  }}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
              )
            ) : (
              <div className="no-media-placeholder">
                <div className="placeholder-icon">🎵</div>
                <p className="placeholder-text">Media format not supported</p>
              </div>
            )}
            
            {/* Buffering Indicator */}
            {isBuffering && !isPlaying && (
              <div className="buffering-indicator">
                <div className="buffering-spinner"></div>
                <span className="buffering-text">Loading your moment...</span>
              </div>
            )}

            {/* Overlay Controls */}
            <div 
              className={`video-controls ${showControls ? 'visible' : 'hidden'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="controls-top">
                <div className="video-title">
                  <span className="video-title-icon">
                    {songData.resourceType === 'audio' ? '🎵' : '🎬'}
                  </span>
                  <span className="video-title-text">{songData.title}</span>
                </div>
                <div className="video-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Center Play Button */}
              <div className="controls-center">
                <button 
                  className="cinematic-play-button"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={!songData?.url}
                >
                  <div className="play-button-inner">
                    {isPlaying ? (
                      <span className="pause-icon">⏸</span>
                    ) : (
                      <>
                        <span className="play-icon">▶</span>
                        <div className="play-ripple"></div>
                      </>
                    )}
                  </div>
                  <div className="play-pulse"></div>
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="controls-bottom">
                {/* Progress Bar */}
                <div 
                  className="progress-container" 
                  onClick={handleSeek}
                >
                  <div 
                    className="progress-bar"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  >
                    <div className="progress-handle"></div>
                  </div>
                  <div className="progress-background"></div>
                </div>

                {/* Control Buttons */}
                <div className="control-buttons">
                  <button 
                    className="control-button play-pause-btn"
                    onClick={handlePlayPause}
                    disabled={!songData?.url}
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  {songData.resourceType === 'video' && (
                    <div className="volume-controls">
                      <span className="volume-icon">🔊</span>
                      <input 
                        type="range" 
                        className="volume-slider"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="1"
                        onChange={(e) => {
                          if (videoRef.current) {
                            videoRef.current.volume = e.target.value;
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Play Overlay - Shows when paused */}
            {!isPlaying && hasStarted && (
              <div className="play-overlay" onClick={handlePlayPause}>
                <div className="play-overlay-content">
                  <span className="overlay-icon">▶</span>
                  <span className="overlay-text">Continue watching</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Description */}
          <div className="video-description">
            <p className="description-text">
              {songData.description}
            </p>
            {songData.duration > 0 && (
              <div className="song-duration">
                <span className="duration-icon">⏱️</span>
                <span className="duration-text">{Math.round(songData.duration)} seconds</span>
              </div>
            )}
            <div className="description-hearts">
              <span className="description-heart">💖</span>
              <span className="description-heart">💕</span>
              <span className="description-heart">💗</span>
            </div>
          </div>
        </div>

        {/* Emotional Message */}
        <div className="emotional-section">
          <div className="message-container">
            <p className="emotional-message">
              "Some moments are too special for words. 
              This is one of them."
            </p>
            <div className="message-signature">
              <span className="signature-line"></span>
              <span className="signature-text">Made with love</span>
              <span className="signature-line"></span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {hasStarted && (
          <div className={`continue-section ${isPlaying ? 'minimized' : ''}`}>
            <button
              className="continue-button"
              onClick={handleContinue}
            >
              <span className="continue-text">Continue </span>
              <span className="continue-arrow">→</span>
              <div className="continue-glow"></div>
            </button>
            <p className="continue-note">
              Take a breath. This moment will stay with you.
            </p>
          </div>
        )}
      </main>

      {/* Cinematic Effects */}
      <div className="film-grain"></div>
      <div className="vignette"></div>
      
      {/* Corner Accents */}
      <div className="corner-accent corner-tl"></div>
      <div className="corner-accent corner-tr"></div>
      <div className="corner-accent corner-bl"></div>
      <div className="corner-accent corner-br"></div>
    </div>
  );
}

export default SongDedication;