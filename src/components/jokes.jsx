
import React, { useState, useEffect, useCallback } from 'react';
import './jokes.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

const JokesExperience = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  // Function to split joke at question mark
  const splitJoke = (jokeText) => {
    if (!jokeText || jokeText.trim() === '') {
      return {
        setup: "What's a joke without words?",
        punchline: "This one! 😂",
        isQuestion: false,
        emoji: "😂"
      };
    }

    const trimmedJoke = jokeText.trim();
    const questionMarkIndex = trimmedJoke.indexOf('?');
    const hasQuestionMark = questionMarkIndex !== -1;
    
    if (hasQuestionMark) {
      // Split at the first question mark
      const setup = trimmedJoke.substring(0, questionMarkIndex + 1).trim();
      const punchline = trimmedJoke.substring(questionMarkIndex + 1).trim();
      
      return {
        setup: setup || "Why...?",
        punchline: punchline || "Because you're awesome! 😊",
        isQuestion: true,
        emoji: getRandomEmoji()
      };
    } else {
      // No question mark - whole joke is the setup, punchline will be revealed fully
      return {
        setup: trimmedJoke,
        punchline: "", // Will be revealed as empty since it's all in setup
        isQuestion: false,
        emoji: getRandomEmoji()
      };
    }
  };

  // Function to get random emoji for jokes
  const getRandomEmoji = () => {
    const emojis = ['😂', '😊', '🤭', '🎭', '💛', '✨', '😄', '🤗', '🎉', '😆'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // Fetch jokes from backend
  useEffect(() => {
    const fetchJokes = async () => {
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

        // Extract jokes from bestie data
        if (bestieInfo && bestieInfo.jokes && bestieInfo.jokes.length > 0) {
          // Filter out empty jokes and split them
          const loadedJokes = bestieInfo.jokes
            .filter(joke => joke && joke.trim() !== '')
            .map((joke, index) => ({
              id: index,
              ...splitJoke(joke),
              originalJoke: joke,
              isFromBackend: true
            }));

          if (loadedJokes.length > 0) {
            setJokes(loadedJokes);
            console.log('Loaded jokes:', loadedJokes.length, 'jokes');
          } else {
            // No valid jokes - use fallback
            useFallbackJokes();
          }
        } else {
          // No jokes in data - use fallback
          useFallbackJokes();
        }

      } catch (error) {
        console.error('Error fetching jokes:', error);
        setError(error.message);
        useFallbackJokes();
        
      } finally {
        setIsLoading(false);
      }
    };

    const useFallbackJokes = () => {
      const fallbackJokes = [
        "Why did I become your bestie? Because you're my favorite punchline to life's jokes 😊",
        "What's the best thing about our friendship? The inside jokes that no one else understands 😂",
        "Why are we such good friends? Because we're like two peas in a pod... but funnier 🥦",
        "What do you call our friendship moments? A comedy show with unlimited free tickets! 🎭"
      ].map((joke, index) => ({
        id: index,
        ...splitJoke(joke),
        originalJoke: joke,
        isFromBackend: false
      }));
      
      setJokes(fallbackJokes);
      console.log('Using fallback jokes');
    };

    fetchJokes();
  }, [secretCode, storedBestieData]);

  const currentJoke = jokes[currentJokeIndex] || { setup: '', punchline: '', emoji: '😂' };

  const handleRevealPunchline = useCallback(() => {
    if (!showPunchline && currentJoke.punchline) {
      setShowPunchline(true);
    } else if (!currentJoke.punchline && currentJoke.isFromBackend) {
      // If joke has no punchline (all in setup), just show it's complete
      setShowPunchline(true);
    }
  }, [showPunchline, currentJoke]);

  const handleNextJoke = useCallback(() => {
    if (isAnimating || jokes.length === 0) return;
    
    setIsAnimating(true);
    setShowPunchline(false);
    
    setTimeout(() => {
      if (currentJokeIndex < jokes.length - 1) {
        setCurrentJokeIndex(prev => prev + 1);
      } else {
        // All jokes have been viewed
        setHasCompleted(true);
        setIsComponentComplete(true);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  }, [currentJokeIndex, isAnimating, jokes.length]);

  const handleStartOver = () => {
    if (jokes.length === 0) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentJokeIndex(0);
      setShowPunchline(false);
      setHasCompleted(false);
      setIsComponentComplete(false);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  const handleGlobalContinue = () => {
    if (onContinue) {
      onContinue();
      toast.success("Those were my funniest 😂");
    } else {
      toast.success("Just try and Laugh 😂");
    }
  };

  const handleSkipBtn = function () {
    if (onComplete) {
      onComplete();
      toast.success("I knew I wasn't that funny 🥱🤭");
    }
  };

  // Refresh jokes function
  const refreshJokes = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.jokes) {
        const newJokes = result.data.jokes
          .filter(joke => joke && joke.trim() !== '')
          .map((joke, index) => ({
            id: index,
            ...splitJoke(joke),
            originalJoke: joke,
            isFromBackend: true
          }));

        if (newJokes.length > 0) {
          setJokes(newJokes);
          setCurrentJokeIndex(0);
          setShowPunchline(false);
          setHasCompleted(false);
          toast.success('Jokes refreshed!');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh jokes');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-advance after punchline reveal
  useEffect(() => {
    if (showPunchline && currentJokeIndex < jokes.length - 1) {
      const timer = setTimeout(() => {
        handleNextJoke();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPunchline, currentJokeIndex, handleNextJoke, jokes.length]);

  // Notify parent component when this component is complete
  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!showPunchline) {
          handleRevealPunchline();
        } else {
          handleNextJoke();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRevealPunchline, handleNextJoke, showPunchline]);

  // Loading state
  if (isLoading) {
    return (
      <div className="jokes-experience loading">
        <div className="loading-container">
          <div className="laughing-loader">
            <div className="laughing-face">😂</div>
            <div className="laughing-tears">😂</div>
            <div className="laughing-face">🤭</div>
          </div>
          <p className="loading-text">Loading your laughs...</p>
          <p className="loading-subtext">Preparing jokes that will make you smile</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && jokes.length === 0) {
    return (
      <div className="jokes-experience error">
        <div className="error-container">
          <div className="error-icon">😂</div>
          <h2 className="error-title">Jokes Unavailable</h2>
          <p className="error-message">
            {error || "Couldn't load jokes at this time."}
          </p>
          {secretCode && (
            <button 
              className="refresh-jokes-btn"
              onClick={refreshJokes}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Try Again'}
            </button>
          )}
          <button 
            className="continue-anyway-btn"
            onClick={handleGlobalContinue}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  // If no jokes at all
  if (jokes.length === 0) {
    return (
      <div className="jokes-experience empty">
        <div className="empty-container">
          <div className="empty-icon">🤔</div>
          <h2 className="empty-title">No Jokes Yet</h2>
          <p className="empty-message">
            Your friend hasn't added any jokes yet, but we know they're funny!
          </p>
          <button 
            className="continue-from-empty-btn"
            onClick={handleGlobalContinue}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jokes-experience">
      {/* Floating refresh button */}
      {secretCode && !isLoading && jokes[0]?.isFromBackend && (
        <button 
          className="floating-refresh-jokes"
          onClick={refreshJokes}
          title="Refresh jokes"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '😂'}
        </button>
      )}
      
      {/* Joke source indicator */}
      {jokes.length > 0 && jokes[0]?.isFromBackend && (
        <div className="jokes-source-indicator">
          <span className="source-icon">🎭</span>
          <span className="source-text">Jokes from your friend</span>
        </div>
      )}
      
      {/* Question mark indicator */}
      {currentJoke.isQuestion && (
        <div className="question-mark-indicator">
          <span className="question-icon">❓</span>
          <span className="question-text">Question joke</span>
        </div>
      )}
      
      {/* Animated Background */}
      <div className="animated-background">
        <div className="emoji-bg emoji-1">😂</div>
        <div className="emoji-bg emoji-2">😆</div>
        <div className="emoji-bg emoji-3">🤭</div>
        <div className="emoji-bg emoji-4">💛</div>
        <div className="emoji-bg emoji-5">✨</div>
        <div className="emoji-bg emoji-6">🎉</div>
        <div className="emoji-bg emoji-7">😄</div>
        <div className="emoji-bg emoji-8">🤗</div>
        
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
      </div>

      <div className="experience-container">
        <header className="experience-header">
          <h1 className="experience-title">Time for a Smile Break!</h1>
          <p className="experience-subtitle">
            {jokes[0]?.isFromBackend 
              ? `${jokes.length} laughs just for you` 
              : "Little giggles, just for you"}
          </p>
        </header>

        <main className="jokes-stage">
          <div 
            className={`joke-card ${isAnimating ? 'card-exit' : ''} ${showPunchline ? 'revealed' : ''}`}
            onClick={handleRevealPunchline}
          >
            <div className="card-content">
              <div className="joke-emoji">{currentJoke.emoji}</div>
              
              {/* Question mark indicator on card */}
              {currentJoke.isQuestion && !showPunchline && (
                <div className="question-hint">
                  <span className="hint-question">?</span>
                </div>
              )}
              
              <div className="joke-text">
                <p className="joke-setup">{currentJoke.setup}</p>
                
                <div className={`punchline-container ${showPunchline ? 'show' : ''}`}>
                  <div className="punchline-line"></div>
                  <p className="joke-punchline">
                    {currentJoke.punchline || 
                      (currentJoke.isFromBackend 
                        ? "That's the whole joke! Hope it made you smile 😊" 
                        : "Hope that made you smile!")}
                  </p>
                  <div className="punchline-line"></div>
                </div>
              </div>
              
              <div className="tap-hint">
                {!showPunchline ? (
                  <>
                    <span className="hint-icon">👆</span>
                    <span className="hint-text">
                      {currentJoke.isQuestion 
                        ? "Tap to reveal the answer!" 
                        : "Tap to see the joke!"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hint-icon">😄</span>
                    <span className="hint-text">Hope that made you smile!</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Card corners decorations */}
            <div className="card-corner top-left">✨</div>
            <div className="card-corner top-right">✨</div>
            <div className="card-corner bottom-left">✨</div>
            <div className="card-corner bottom-right">✨</div>
          </div>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <span className="progress-text">
              Joke <span className="current-number">{currentJokeIndex + 1}</span> of <span className="total-number">{jokes.length}</span>
            </span>
            <div className="progress-dots">
              {jokes.map((_, index) => (
                <div 
                  key={index} 
                  className={`progress-dot ${index === currentJokeIndex ? 'active' : ''} ${index < currentJokeIndex ? 'completed' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          {!hasCompleted ? (
            <div className="navigation-section">
              <button 
                className={`next-button ${isAnimating ? 'animating' : ''}`}
                onClick={handleNextJoke}
                disabled={isAnimating || jokes.length === 0}
              >
                Next joke 😂
              </button>
              <p className="navigation-hint">
                {showPunchline ? "Ready for another?" : "Or click the card first!"}
              </p>
            </div>
          ) : (
            <div className="completion-section">
              <div className="completion-message">
                <p className="message-text">Okay... I hope that made you smile 💛</p>
                <div className="celebration-emojis">
                  <span>✨</span>
                  <span>😊</span>
                  <span>💛</span>
                  <span>😂</span>
                  <span>✨</span>
                </div>
              </div>
              
              <button 
                className="continue-button"
                onClick={handleGlobalContinue}
              >
                Continue ✨
              </button>
              
              <button 
                className="restart-button"
                onClick={handleStartOver}
              >
                Read jokes again? 🔄
              </button>
            </div>
          )}

          {/* Skip Section (Always visible) */}
          <div className="skip-section">
            <button
              className="skip-button"
              onClick={handleSkipBtn}
            >
              Skip ✨
            </button>
            <p className="skip-hint">Come back anytime</p>
          </div>

          {/* Quick navigation dots for mobile */}
          <div className="mobile-dots">
            {jokes.map((_, index) => (
              <button
                key={index}
                className={`one-mobile-dot ${index === currentJokeIndex ? 'active' : ''}`}
                onClick={() => {
                  if (!isAnimating && index !== currentJokeIndex) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentJokeIndex(index);
                      setShowPunchline(false);
                      setTimeout(() => setIsAnimating(false), 300);
                    }, 300);
                  }
                }}
                aria-label={`Go to joke ${index + 1}`}
              />
            ))}
          </div>
        </main>

        <footer className="experience-footer">
          <p className="footer-note">
            {jokes[0]?.isFromBackend 
              ? `${jokes.length} jokes to brighten your day!` 
              : "Made to brighten your day, bestie!"}
          </p>
          <div className="footer-emojis">
            <span>😊</span>
            <span>💛</span>
            <span>😂</span>
            <span>✨</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JokesExperience;