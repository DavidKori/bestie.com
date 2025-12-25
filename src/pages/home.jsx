
import React, { useState, useEffect } from 'react';
import './home.css';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

function BestieWelcome({ onComplete, onContinue, stepIndex, totalSteps }) {
  // State management
  const [pageState, setPageState] = useState('welcome'); // 'welcome' or 'heartbroken'
  const [noButtonClicks, setNoButtonClicks] = useState(0);
  const [isBestieNameVisible, setIsBestieNameVisible] = useState(false);
  const [fallingHearts, setFallingHearts] = useState([]);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [bestieData, setBestieData] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get secret code from session storage
  const secretCode = sessionStorage.getItem('bestieSecretCode');

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch bestie data on component mount
  useEffect(() => {
    const fetchBestieData = async () => {
      try {
        setIsLoading(true);
        
        if (!secretCode) {
          toast.error('No secret code found. Please enter it again.');
          // Optionally redirect to entry page
          // window.location.href = '/';
          return;
        }

        console.log('Fetching bestie data with code:', secretCode);
        
        const result = await bestieService.getBestieByCode(secretCode);
        
        if (result.success) {
          console.log('Bestie data loaded:', result.data);
          setBestieData(result.data);
          
          // Extract creator info from bestie data
          if (result.data.creator) {
            setCreatorData(result.data.creator);
          }
          
          // Start animation after data is loaded
          setTimeout(() => {
            setIsBestieNameVisible(true);
          }, 500);
          
        } else {
          toast.error(result.message || 'Failed to load your data');
          // Clear invalid session data
          sessionStorage.removeItem('bestieSecretCode');
          sessionStorage.removeItem('bestieData');
        }
      } catch (error) {
        console.error('Error fetching bestie data:', error);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestieData();

    // Generate falling hearts for heartbroken state
    if (pageState === 'heartbroken') {
      const hearts = [];
      for (let i = 0; i < 15; i++) {
        hearts.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4
        });
      }
      setFallingHearts(hearts);
    }

    return () => {
      // Cleanup if needed
    };
  }, [pageState, secretCode]);

  const handleClick = () => {
    if (clickCount >= 3) {
      setTimeout(() => {
        toast.error("Thought you were kidding! 😪");             
        setClickCount(0);
        setPageState('heartbroken');
      }, 500);
    } else {
      setClickCount(prev => prev + 1);
    }
  };

  // Show different toasts based on click count
  useEffect(() => {
    switch (clickCount) {
      case 1: {
        toast.success("Oh, you're shy? 🥺");
        break;
      }
      case 2: {
        toast.error("Please don't run away! 💘");
        break;
      }
      case 3: {
        toast.error("Didn't know I was simping! 🥵");
        break;
      }
      default: {
        break;
      }
    }
  }, [clickCount]);

  // Handle Yes button click
  const handleYesClick = () => {
    // Store bestie data for next page
    if (bestieData) {
      sessionStorage.setItem('bestieData', JSON.stringify(bestieData));
    }
    
    setIsComponentComplete(true);
    if (onComplete) onComplete();
    
    toast.success(`Welcome, ${bestieData?.nickname || bestieData?.name}! 💖`);
  };

  // Handle Try Again button click
  const handleTryAgain = () => {
    setPageState('welcome');
    setNoButtonClicks(0);
    setIsBestieNameVisible(false);
    
    setTimeout(() => {
      setIsBestieNameVisible(true);
    }, 300);
  };

  // Generate bestie name letters for animation
  const bestieName = bestieData?.nickname || bestieData?.name || 'Bestie';
  const nameLetters = bestieName.split('');

  if (isLoading) {
    return (
      <div className="bestie-welcome loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="heart-spinner">💖</div>
          </div>
          <p className="loading-text">Loading your special space...</p>
          <p className="loading-subtext">Preparing something beautiful just for you ✨</p>
        </div>
      </div>
    );
  }

  if (!bestieData) {
    return (
      <div className="bestie-welcome error">
        <div className="error-container">
          <div className="error-icon">💔</div>
          <h2>Couldn't load your space</h2>
          <p>The link might have expired or there's an issue.</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bestie-welcome ${pageState}`}>
      {/* Animated Background Elements */}
      <div className="background-container">
        {/* Floating Hearts */}
        <div className="heart heart-1">💕</div>
        <div className="heart heart-2">💖</div>
        <div className="heart heart-3">💗</div>
        <div className="heart heart-4">💓</div>
        <div className="heart heart-5">💘</div>
        <div className="heart heart-6">💝</div>

        {/* Flying Butterflies */}
        <div className="butterfly butterfly-1">🦋</div>
        <div className="butterfly butterfly-2">🦋</div>
        <div className="butterfly butterfly-3">🦋</div>
        <div className="butterfly butterfly-4">🦋</div>

        {/* Glowing Particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>

        {/* Falling Hearts for Heartbroken State */}
        {pageState === 'heartbroken' && fallingHearts.map(heart => (
          <div 
            key={heart.id}
            className="falling-heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`
            }}
          >
            💔
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">
        {pageState === 'welcome' ? (
          /* WELCOME STATE */
          <div className="welcome-state">
            {/* Admin/Creator Section */}
            <div className="admin-section fade-in">
              <div className="admin-profile">
                <img 
                  src={creatorData?.profilePhoto || 'https://res.cloudinary.com/dxritu7i3/image/upload/v1753698926/80c78e06-2118-44c6-8821-55a8f65e3f41_awrjvy.png'} 
                  alt={creatorData?.name || 'Creator'}
                  className="admin-photo"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/dxritu7i3/image/upload/v1753698926/80c78e06-2118-44c6-8821-55a8f65e3f41_awrjvy.png';
                  }}
                />
                <div className="admin-glow"></div>
              </div>
              <div className="admin-intro">
                <p className="admin-message">
                  This space was lovingly created by
                </p>
                <h2 className="admin-name">
                  {creatorData?.name || 'Your Friend'} 💖
                </h2>
              </div>
            </div>

            {/* Bestie Name Display */}
            <div className="bestie-section">
              <div className="bestie-label">
                <span className="for-you">For my dearest</span>
              </div>
              <div className="bestie-name-container">
                <div className={`bestie-name ${isBestieNameVisible ? 'visible' : ''}`}>
                  {nameLetters.map((letter, index) => (
                    <span 
                      key={index}
                      className="name-letter"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <div className="name-glow"></div>
              </div>
            </div>

            {/* Welcome Messages */}
            <div className="messages-section fade-in-delay">
              <div className="message-line">
                <span className="message-emoji">✨</span>
                <p className="message-text">
                  There are words, memories, and moments waiting just for you here.
                </p>
                <span className="message-emoji">🌸</span>
              </div>
              <div className="message-line">
                <span className="message-emoji">💖</span>
                <p className="message-text">
                  Every part of this space was made with love, just for you.
                </p>
                <span className="message-emoji">💖</span>
              </div>
            </div>

            {/* Stats Preview */}
            {bestieData && (
              <div className="stats-preview fade-in-delay">
                <div className="stat-item">
                  <span className="stat-number">{bestieData.messages?.length || 0}</span>
                  <span className="stat-label">Messages</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{bestieData.questions?.length || 0}</span>
                  <span className="stat-label">Questions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{bestieData.playlist?.length || 0}</span>
                  <span className="stat-label">Songs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{bestieData.galleryImages?.length || 0}</span>
                  <span className="stat-label">Photos</span>
                </div>
              </div>
            )}

            {/* Continue Question */}
            <div className="question-section fade-in-delay">
              <p className="question">
                Do you want to continue and see what was made for you? 💕
              </p>
            </div>

            {/* Buttons */}
            <div className="buttons-section fade-in-delay">
              <button 
                className="yes-button"
                onClick={handleYesClick}
              >
                <span className="button-text">Yes, take me in</span>
                <span className="button-emoji">💖</span>
              </button>

              <div className="button-two-container">
                <motion.button
                  className={`button-two ${clickCount >= 3 ? 'ready' : ''}`}
                  onClick={handleClick}
                  whileHover={clickCount >= 3 ? { scale: 1.1 } : {}}
                >
                  <span className="button-text">
                    {clickCount < 3 ? `No Thanks` : 'So bad!'}
                  </span>
                </motion.button>
                
                <div className="counter">
                  Attempts: {clickCount}/4
                </div>
              </div>          
            </div>
          </div>
        ) : (
          /* HEARTBROKEN STATE */
          <div className="heartbroken-state">
            {/* Broken Hearts */}
            <div className="broken-hearts">
              <div className="broken-heart broken-heart-1">💔</div>
              <div className="broken-heart broken-heart-2">💔</div>
              <div className="broken-heart broken-heart-3">💔</div>
            </div>

            {/* Heartbroken Messages */}
            <div className="heartbroken-messages">
              <div className="sad-message">
                <p className="sad-text">
                  That hurt a little... 💔
                </p>
              </div>
              
              <div className="love-message">
                <p className="love-text">
                  This space was made with so much love.
                </p>
                <p className="love-text">
                  Every detail was chosen thinking of you.
                </p>
              </div>

              <div className="plea-message">
                <p className="plea-text">
                  Maybe you'll give it a chance?
                </p>
                <div className="plea-emoji">🥺❤️</div>
              </div>
            </div>

            {/* Try Again Button */}
            <div className="heartbroken-buttons">
              <button 
                className="try-again-button"
                onClick={handleTryAgain}
              >
                <span className="button-text">Okay... let me try again</span>
                <span className="button-emoji">❤️</span>
              </button>
            </div>
          </div>
        )}

        {/* Decorative Footer */}
        <footer className="welcome-footer">
          <div className="footer-content">
            <p className="footer-text">BestieSpace • Where love becomes digital memories</p>
            <div className="footer-emojis">
              <span className="footer-emoji">💫</span>
              <span className="footer-emoji">🕊️</span>
              <span className="footer-emoji">💌</span>
              <span className="footer-emoji">🌹</span>
              <span className="footer-emoji">💫</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default BestieWelcome;