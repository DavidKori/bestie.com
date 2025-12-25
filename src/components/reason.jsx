
import React, { useState, useEffect, useCallback } from 'react';
import './reason.css';
import toast from 'react-hot-toast';
import { bestieService } from '../config/mainExport'; // Adjust path as needed

const ReasonsWhyILoveYou = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  const [reasons, setReasons] = useState([]);
  const [currentReasonIndex, setCurrentReasonIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  const currentReason = reasons[currentReasonIndex] || "";

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch reasons from backend
  useEffect(() => {
    const fetchReasons = async () => {
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

        // Extract reasons from bestie data
        if (bestieInfo && bestieInfo.reasons && Array.isArray(bestieInfo.reasons)) {
          const loadedReasons = bestieInfo.reasons
            .filter(reason => reason && reason.trim() !== '') // Filter out empty reasons
            .map((reason, index) => reason.trim());

          if (loadedReasons.length > 0) {
            setReasons(loadedReasons);
            console.log('Loaded reasons:', loadedReasons);
          } else {
            // No reasons from admin - use fallback
            setReasons(getFallbackReasons());
          }
        } else {
          // No reasons in data - use fallback
          setReasons(getFallbackReasons());
        }

      } catch (error) {
        console.error('Error fetching reasons:', error);
        setError(error.message);
        setReasons(getFallbackReasons());
      } finally {
        setIsLoading(false);
        // Start with first reason visible
        setIsVisible(true);
      }
    };

    fetchReasons();
  }, [secretCode, storedBestieData]);

  // Fallback reasons if API fails or no data
  const getFallbackReasons = () => [
    "I love the way your laughter fills a room and makes everything feel brighter",
    "I love how deeply you care, even when you think no one is watching",
    "I love your quiet strength that shows up exactly when it's needed",
    "I love the thoughtful way you notice the small things that matter",
    "I love how you make the ordinary moments feel special and significant",
    "I love the unique way your mind sees beauty where others might not",
    "I love how your presence alone makes any space feel safer and warmer",
    "I love your courage to be vulnerable, which makes you incredibly brave",
    "I love the gentle way you nurture growth in everything around you",
    "I love that simply being with you feels like coming home"
  ];

  const handleNextReason = useCallback(() => {
    if (isTransitioning || reasons.length === 0) return;
    
    setIsTransitioning(true);
    setIsVisible(false);
    
    setTimeout(() => {
      if (currentReasonIndex < reasons.length - 1) {
        setCurrentReasonIndex(prev => prev + 1);
        setShowButton(false);
      } else {
        setHasCompleted(true);
      }
      
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 300);
    }, 600);
  }, [currentReasonIndex, isTransitioning, reasons.length]);

  const handlePreviousReason = useCallback(() => {
    if (isTransitioning || currentReasonIndex === 0) return;
    
    setIsTransitioning(true);
    setIsVisible(false);
    
    setTimeout(() => {
      setCurrentReasonIndex(prev => prev - 1);
      setShowButton(false);
      setHasCompleted(false);
      
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 300);
    }, 600);
  }, [currentReasonIndex, isTransitioning]);

  const handleContinue = () => {
    setIsComponentComplete(true);
    toast.success("That Kafeeling !");
  };

  const handleRestart = () => {
    if (isTransitioning || reasons.length === 0) return;
    
    setIsTransitioning(true);
    setIsVisible(false);
    
    setTimeout(() => {
      setCurrentReasonIndex(0);
      setShowButton(false);
      setHasCompleted(false);
      
      setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 300);
    }, 600);
  };

  // Show button after reason is fully visible
  useEffect(() => {
    if (isVisible && !isTransitioning && !isLoading && reasons.length > 0) {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isTransitioning, isLoading, reasons.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (!hasCompleted) {
          handleNextReason();
        } else {
          handleContinue();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!hasCompleted && currentReasonIndex > 0) {
          handlePreviousReason();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextReason, handlePreviousReason, hasCompleted, currentReasonIndex]);

  // Refresh reasons function
  const refreshReasons = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.reasons) {
        const newReasons = result.data.reasons
          .filter(reason => reason && reason.trim() !== '')
          .map(reason => reason.trim());

        if (newReasons.length > 0) {
          setReasons(newReasons);
          setCurrentReasonIndex(0);
          setHasCompleted(false);
          setShowButton(false);
          setIsVisible(true);
          toast.success('Reasons refreshed!');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh reasons');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="reasons-experience loading">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="heart-loader">
              <div className="heart">💖</div>
              <div className="heart-glow"></div>
            </div>
            <p className="loading-text">Gathering reasons why you're loved...</p>
            <p className="loading-subtext">Each one chosen with special care</p>
          </div>
        </div>
      </div>
    );
  }

  // Error/empty state
  if (error && reasons.length === 0) {
    return (
      <div className="reasons-experience error">
        <div className="error-overlay">
          <div className="error-content">
            <div className="error-icon">💔</div>
            <h2 className="error-title">Reasons Unavailable</h2>
            <p className="error-message">
              {error || "Couldn't load reasons at this time."}
            </p>
            {secretCode && (
              <button 
                className="refresh-btn"
                onClick={refreshReasons}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Try Again'}
              </button>
            )}
            <button 
              className="continue-anyway-btn"
              onClick={handleContinue}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reasons-experience">
      {/* Floating refresh button */}
      {secretCode && !isLoading && (
        <button 
          className="floating-refresh-reasons"
          onClick={refreshReasons}
          title="Refresh reasons"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '↻'}
        </button>
      )}

      {/* Navigation buttons */}
      {!isLoading && reasons.length > 0 && !hasCompleted && (
        <div className="reason-navigation">
          <button
            className="nav-button prev-button"
            onClick={handlePreviousReason}
            disabled={currentReasonIndex === 0 || isTransitioning}
            title="Previous reason"
          >
            ←
          </button>
          <button
            className="nav-button next-button-nav"
            onClick={handleNextReason}
            disabled={isTransitioning}
            title="Next reason"
          >
            →
          </button>
        </div>
      )}

      {/* Warm Animated Background */}
      <div className="animated-background">
        {/* Floating Hearts */}
        <div className="bg-heart heart-1">💖</div>
        <div className="bg-heart heart-2">💗</div>
        <div className="bg-heart heart-3">💕</div>
        <div className="bg-heart heart-4">💓</div>
        <div className="bg-heart heart-5">💞</div>
        <div className="bg-heart heart-6">💝</div>
        
        {/* Glowing Particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
        
        {/* Soft Light Rays */}
        <div className="light-ray ray-1"></div>
        <div className="light-ray ray-2"></div>
        <div className="light-ray ray-3"></div>
      </div>

      {/* Subtle Grain Overlay */}
      <div className="grain-overlay"></div>

      <div className="experience-container">
        <header className="experience-header">
          <h1 className="experience-title">Reasons Why I Love You</h1>
          <p className="experience-subtitle">
            {reasons.length > 0 
              ? `Each one chosen with care, just for you (${reasons.length} reasons)` 
              : 'Special words coming your way...'}
          </p>
        </header>

        <main className="reasons-stage">
          {/* Main Content Area */}
          <div className="reasons-content">
            {/* Heart Icon */}
            <div className="heart-container">
              <div className="heart-icon">💖</div>
              <div className="heart-glow"></div>
            </div>

            {/* Reason Display */}
            <div 
              className={`reason-display ${isVisible ? 'visible' : 'hidden'} ${isTransitioning ? 'transitioning' : ''}`}
              onClick={handleNextReason}
            >
              <div className="reason-text-container">
                <div className="quote-mark opening">"</div>
                
                <p className="reason-text">
                  {currentReason || "Loading reasons..."}
                </p>
                
                <div className="quote-mark closing">"</div>
              </div>

              {/* Emotional Microcopy */}
              <div className="emotional-microcopy">
                <div className="microcopy-line"></div>
                <p className="microcopy-text">Take this in. It's all true.</p>
                <div className="microcopy-line"></div>
              </div>
            </div>

            {/* Progress Indicator */}
            {reasons.length > 0 && (
              <div className="progress-indicator">
                <span className="progress-text">
                  Reason <span className="current-number">{currentReasonIndex + 1}</span> of <span className="total-number">{reasons.length}</span>
                </span>
                <div className="progress-dots">
                  {reasons.map((_, index) => (
                    <div 
                      key={index}
                      className={`progress-dot ${index === currentReasonIndex ? 'active' : ''} ${index < currentReasonIndex ? 'viewed' : ''}`}
                      onClick={() => {
                        if (index !== currentReasonIndex && !isTransitioning) {
                          setIsTransitioning(true);
                          setIsVisible(false);
                          setTimeout(() => {
                            setCurrentReasonIndex(index);
                            setShowButton(false);
                            setHasCompleted(index === reasons.length - 1);
                            setTimeout(() => {
                              setIsVisible(true);
                              setIsTransitioning(false);
                            }, 300);
                          }, 300);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Next Button */}
            {showButton && !hasCompleted && reasons.length > 0 && (
              <button
                className={`next-button ${isTransitioning ? 'hidden' : ''}`}
                onClick={handleNextReason}
                disabled={isTransitioning}
              >
                <span className="button-heart">❤️</span>
                Next
                <span className="button-sparkle">✨</span>
              </button>
            )}

            {/* Interaction Hint */}
            {!showButton && !hasCompleted && reasons.length > 0 && (
              <div className="interaction-hint">
                <span className="hint-icon">💭</span>
                <span className="hint-text">Let this sink in for a moment...</span>
              </div>
            )}
          </div>

          {/* Completion Section */}
          {hasCompleted && reasons.length > 0 && (
            <div className="completion-section">
              <div className="completion-card">
                <div className="completion-icon">💖</div>
                <h2 className="completion-title">
                  That's all the reasons I could fit here...
                </h2>
                <p className="completion-text">
                  But there are so many more, woven into every moment we share.
                  Each day with you reveals new reasons to love you.
                </p>
                
                <div className="completion-hearts">
                  <span>💖</span>
                  <span>💕</span>
                  <span>💗</span>
                  <span>💓</span>
                  <span>💞</span>
                </div>
              </div>

              <div className="completion-actions">
                <button
                  className="continue-button"
                  onClick={handleContinue}
                >
                  Continue ✨
                </button>
                <button
                  className="restart-button"
                  onClick={handleRestart}
                >
                  Read them again? 💫
                </button>
              </div>
            </div>
          )}

          {/* Skip Section */}
          <div className="skip-section">
            <button
              className="skip-button"
              onClick={handleContinue}
            >
              Skip 💫
            </button>
            <p className="skip-hint">You can always come back to this</p>
          </div>
        </main>

        <footer className="experience-footer">
          <p className="footer-note">Every word here is meant just for you</p>
          <div className="footer-hearts">
            <span>💖</span>
            <span>💕</span>
            <span>💗</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReasonsWhyILoveYou;