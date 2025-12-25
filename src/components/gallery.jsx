
import React, { useState, useEffect, useCallback } from 'react';
import './gallery.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

const PhotoJourney = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  // Array of 50 sweet phrases for captions
  const sweetPhrases = [
    "This moment was made just for us",
    "Remember when time stood still?",
    "Your smile made this moment perfect",
    "Forever etched in my heart",
    "Pure magic captured in time",
    "The day our stars aligned",
    "This memory warms my soul",
    "You made this ordinary moment extraordinary",
    "A piece of forever right here",
    "The beginning of something beautiful",
    "When laughter was our only language",
    "This memory feels like home",
    "Your light made everything brighter",
    "A moment too perfect for words",
    "The day we wrote our first chapter",
    "This memory dances in my dreams",
    "Your presence made this moment golden",
    "A snapshot of pure happiness",
    "This memory sings your name",
    "The day the universe smiled at us",
    "Your spirit captured in a moment",
    "This memory holds my favorite version of us",
    "A treasure from the heart's collection",
    "The day ordinary turned extraordinary",
    "This memory smells like joy",
    "Your energy painted this moment",
    "A secret whispered by time",
    "The moment I knew I'd remember forever",
    "This memory sparkles with your essence",
    "Your laughter echoing through time",
    "A heartbeat captured on camera",
    "The day colors were brighter",
    "This memory hugs my soul",
    "Your magic frozen in time",
    "A love note from the universe",
    "The moment everything made sense",
    "This memory glows with your light",
    "Your kindness captured forever",
    "A promise made without words",
    "The day we collected stardust",
    "This memory tastes like happiness",
    "Your warmth preserved in pixels",
    "A dream we lived together",
    "The moment we became a memory",
    "This memory holds infinite you",
    "Your grace immortalized here",
    "A blessing disguised as a moment",
    "The day we painted with emotions",
    "This memory beats with our rhythm",
    "Your beauty captured in a glance"
  ];

  const [galleryData, setGalleryData] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch gallery photos from backend
  useEffect(() => {
    const fetchGalleryPhotos = async () => {
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

        // Extract gallery photos from bestie data
        if (bestieInfo && bestieInfo.galleryImages && bestieInfo.galleryImages.length > 0) {
          const galleryPhotos = bestieInfo.galleryImages.map((image, index) => ({
            id: image._id || `gallery-${index}`,
            url: image.url,
            publicId: image.publicId,
            caption: getRandomSweetPhrase(),
            isRealPhoto: true,
            uploadedAt: image.uploadedAt
          }));

          setGalleryData(galleryPhotos);
          console.log('Gallery photos loaded:', galleryPhotos.length, 'photos');
          
          // Start with first photo
          setTimeout(() => {
            setNavVisible(true);
          }, 500);
          
        } else {
          // No gallery photos from admin - use fallback with sweet phrases
          const fallbackMemories = [
            {
              id: 1,
              url: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              caption: getRandomSweetPhrase(),
              isRealPhoto: false
            },
            {
              id: 2,
              url: "https://images.unsplash.com/photo-1529255484355-cb73c33c04bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              caption: getRandomSweetPhrase(),
              isRealPhoto: false
            },
            {
              id: 3,
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              caption: getRandomSweetPhrase(),
              isRealPhoto: false
            },
            {
              id: 4,
              url: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              caption: getRandomSweetPhrase(),
              isRealPhoto: false
            }
          ];
          
          setGalleryData(fallbackMemories);
          console.log('Using fallback gallery photos');
        }
        
      } catch (error) {
        console.error('Error fetching gallery photos:', error);
        setError(error.message);
        
        // Set fallback data with sweet phrases
        const fallbackData = [
          {
            id: 1,
            url: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            caption: getRandomSweetPhrase(),
            isRealPhoto: false
          },
          {
            id: 2,
            url: "https://images.unsplash.com/photo-1529255484355-cb73c33c04bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            caption: getRandomSweetPhrase(),
            isRealPhoto: false
          },
          {
            id: 3,
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            caption: getRandomSweetPhrase(),
            isRealPhoto: false
          }
        ];
        
        setGalleryData(fallbackData);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryPhotos();
  }, [secretCode, storedBestieData]);

  // Get random sweet phrase
  const getRandomSweetPhrase = () => {
    const randomIndex = Math.floor(Math.random() * sweetPhrases.length);
    return sweetPhrases[randomIndex];
  };

  // Refresh gallery function
  const refreshGallery = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.galleryImages) {
        const newGallery = result.data.galleryImages.map((image, index) => ({
          id: image._id || `gallery-${index}`,
          url: image.url,
          publicId: image.publicId,
          caption: getRandomSweetPhrase(),
          isRealPhoto: true,
          uploadedAt: image.uploadedAt
        }));

        if (newGallery.length > 0) {
          setGalleryData(newGallery);
          setCurrentMemory(0);
          setShowContinue(false);
          toast.success('Gallery refreshed! New photos loaded.');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const nextMemory = useCallback(() => {
    if (isTransitioning || currentMemory >= galleryData.length - 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const nextIndex = currentMemory + 1;
      setCurrentMemory(nextIndex);
      
      if (nextIndex === galleryData.length - 1) {
        setTimeout(() => setShowContinue(true), 800);
      }
      
      setTimeout(() => setIsTransitioning(false), 300);
    }, 400);
  }, [currentMemory, isTransitioning, galleryData.length]);

  const prevMemory = useCallback(() => {
    if (isTransitioning || currentMemory <= 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMemory(prev => prev - 1);
      setShowContinue(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 400);
  }, [currentMemory, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextMemory();
      if (e.key === 'ArrowLeft') prevMemory();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextMemory, prevMemory]);

  // Auto-hide navigation
  useEffect(() => {
    const timer = setTimeout(() => setNavVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [currentMemory]);

  const handleGlobalContinue = function ()  {
    setIsComponentComplete(true);
    if (onComplete) onComplete();
    toast.success("Wow it's like you like it already! 💖");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="photo-journey loading">
        <div className="loading-container">
          <div className="camera-loader">
            <div className="camera-body">📷</div>
            <div className="camera-flash"></div>
          </div>
          <p className="loading-text">Loading your photo memories...</p>
          <p className="loading-subtext">Capturing moments made just for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && galleryData.length === 0) {
    return (
      <div className="photo-journey error">
        <div className="error-container">
          <div className="error-icon">📸</div>
          <h2 className="error-title">Gallery Unavailable</h2>
          <p className="error-message">
            {error || "Couldn't load gallery photos at this time."}
          </p>
          {secretCode && (
            <button 
              className="refresh-gallery-btn"
              onClick={refreshGallery}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Try Again'}
            </button>
          )}
          <button 
            className="continue-anyway-gallery-btn"
            onClick={handleGlobalContinue}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = galleryData[currentMemory] || {};

  return (
    <div className="photo-journey">
      {/* Floating refresh button */}
      {secretCode && !isLoading && (
        <button 
          className="floating-refresh-gallery"
          onClick={refreshGallery}
          title="Refresh gallery"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '📸'}
        </button>
      )}
      
      {/* Photo source indicator */}
      {galleryData.length > 0 && galleryData[0]?.isRealPhoto && (
        <div className="gallery-source-indicator">
          <span className="source-icon">🎞️</span>
          <span className="source-text">Real photos from your friend</span>
        </div>
      )}
      
      {/* Animated Background Elements */}
      <div className="animated-background">
        {/* Floating Hearts */}
        <div className="bg-heart heart-1">💖</div>
        <div className="bg-heart heart-2">💕</div>
        <div className="bg-heart heart-3">💓</div>
        <div className="bg-heart heart-4">💗</div>
        <div className="bg-heart heart-5">💞</div>
        <div className="bg-heart heart-6">💝</div>
        <div className="bg-heart heart-7">💘</div>
        
        {/* Sparkles */}
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">✨</div>
        <div className="sparkle sparkle-3">✨</div>
        <div className="sparkle sparkle-4">✨</div>
        <div className="sparkle sparkle-5">✨</div>
        
        {/* Butterflies */}
        <div className="butterfly butterfly-1">
          <div className="butterfly-wing left-wing"></div>
          <div className="butterfly-wing right-wing"></div>
          <div className="butterfly-body"></div>
        </div>
        <div className="butterfly butterfly-2">
          <div className="butterfly-wing left-wing"></div>
          <div className="butterfly-wing right-wing"></div>
          <div className="butterfly-body"></div>
        </div>
        <div className="butterfly butterfly-3">
          <div className="butterfly-wing left-wing"></div>
          <div className="butterfly-wing right-wing"></div>
          <div className="butterfly-body"></div>
        </div>
        <div className="butterfly butterfly-4">
          <div className="butterfly-wing left-wing"></div>
          <div className="butterfly-wing right-wing"></div>
          <div className="butterfly-body"></div>
        </div>
        <div className="butterfly butterfly-5">
          <div className="butterfly-wing left-wing"></div>
          <div className="butterfly-wing right-wing"></div>
          <div className="butterfly-body"></div>
        </div>
        
        {/* Soft Clouds */}
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        
        {/* Floating love letters */}
        <div className="love-letter letter-1">L</div>
        <div className="love-letter letter-2">O</div>
        <div className="love-letter letter-3">V</div>
        <div className="love-letter letter-4">E</div>
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay"></div>

      <div className="journey-container">
        <header className="journey-header">
          <h1 className="journey-title">Our Memory Journey</h1>
          <p className="journey-subtitle">
            {galleryData[0]?.isRealPhoto 
              ? `${galleryData.length} carefully chosen moments, just for you` 
              : "Carefully chosen moments, just for you"}
          </p>
        </header>

        <main className="photo-stage">
          <div 
            className={`memory-display ${isTransitioning ? 'fading' : ''}`}
            onClick={nextMemory}
            onMouseEnter={() => setNavVisible(true)}
            onTouchStart={() => setNavVisible(true)}
          >
            {/* Navigation Arrows */}
            <button 
              className={`nav-arrow left-arrow ${navVisible ? 'visible' : ''} ${currentMemory === 0 ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                prevMemory();
              }}
              aria-label="Previous memory"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            {/* Memory Photo */}
            <div className="memory-photo-container">
              <div 
                className="memory-photo"
                style={{ backgroundImage: `url(${currentPhoto.url})` }}
              >
                <div className="photo-overlay"></div>
                {/* Photo info badge */}
                {currentPhoto.isRealPhoto && (
                  <div className="photo-info-badge">
                    <span className="badge-icon">📌</span>
                    <span className="badge-text">From your friend</span>
                  </div>
                )}
              </div>
              
              {/* Memory Caption */}
              <div className="memory-caption">
                <p className="caption-text">"{currentPhoto.caption}"</p>
                <div className="caption-heart">💖</div>
              </div>
            </div>

            <button 
              className={`nav-arrow right-arrow ${navVisible ? 'visible' : ''} ${currentMemory === galleryData.length - 1 ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                nextMemory();
              }}
              aria-label="Next memory"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            {/* Tap/Click Hint */}
            <div className="interaction-hint">
              <span className="hint-icon">👆</span>
              <span className="hint-text">Tap or click to continue</span>
            </div>
          </div>

          {/* Progress & Emotion */}
          <div className="journey-progress">
            <div className="progress-text">
              Memory <span className="current-number">{currentMemory + 1}</span> of <span className="total-number">{galleryData.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentMemory + 1) / galleryData.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="emotional-message">
            <p className="message-text">
              {galleryData[0]?.isRealPhoto
                ? "Every picture holds a piece of our story. Every moment, a beat in our heart's rhythm."
                : "Imagine the beautiful moments waiting to be captured. Every picture tells our story."}
            </p>
          </div>

          {/* Always visible continue button at bottom */}
          <div className="section-continue">
            <button 
              className="continue-button always-visible"
              onClick={handleGlobalContinue}
            >
              Next 💫
            </button>
            <p className="continue-hint">More beautiful memories await...</p>
          </div>

          {/* Completion continue button */}
          {showContinue && (
            <button 
              className="continue-button completion-button"
              onClick={handleGlobalContinue}
            >
              You've seen all memories! Continue 💖
            </button>
          )}
        </main>

        <footer className="journey-footer">
          <p className="footer-note">
            {galleryData[0]?.isRealPhoto 
              ? `${galleryData.length} memories made with love` 
              : "Made with love, just for you"}
          </p>
          <div className="footer-hearts">
            <span>💖</span>
            <span>💕</span>
            <span>💓</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PhotoJourney;