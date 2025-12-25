
import React, { useState, useEffect } from 'react';
import './landing.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

function BestieEntry({ onComplete, onContinue, stepIndex, totalSteps }) {
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!secretCode.trim()) {
      toast.error('Please enter your secret code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate the secret code
      console.log('Validating secret code:', secretCode);
      
      // Call the validation service
      const result = await bestieService.validateSecretCode(secretCode.trim());
      
      if (result.success) {
        console.log('Valid secret code, bestie data:', result.data);
        
        // Store the validated secret code in session storage
        sessionStorage.setItem('bestieSecretCode', secretCode.trim());
        
        // Store bestie data for the next page
        sessionStorage.setItem('bestieData', JSON.stringify(result.data));
        
        toast.success("Access granted! Opening your space... 💖");
        
        // Mark component as complete
        setIsComponentComplete(true);
        
        // If onContinue is provided (for multi-step), use it
        if (onContinue) {
          onContinue();
        } 
        // Otherwise navigate directly to the bestie page
        else {
          // Small delay for toast to show
          setTimeout(() => {
            navigate(`/bestie/${secretCode.trim()}`);
          }, 1000);
        }
        
      } else {
        // Invalid code
        toast.error(result.message || "Invalid secret code. Please check and try again.");
        setSecretCode(''); // Clear the input
      }
      
    } catch (error) {
      console.error('Error validating secret code:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add keyboard shortcut for Enter key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && secretCode.trim() && !isLoading) {
        handleSubmit(e);
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [secretCode, isLoading]);

  return (
    <div className="bestie-entry-page">
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="gradient-bg"></div>
        <div className="floating-heart heart-1">💗</div>
        <div className="floating-heart heart-2">💗</div>
        <div className="floating-heart heart-3">💗</div>
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">✨</div>
        <div className="sparkle sparkle-3">✨</div>
        <div className="sparkle sparkle-4">✨</div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      {/* Decorative Animated Text */}
      <div className="decorative-text">
        <div className="floating-text text-1">Made with love 💝</div>
        <div className="floating-text text-2">Just for you 🌸</div>
        <div className="floating-text text-3">Love lives here ✨</div>
        <div className="floating-text text-4">A gift from the heart 💗</div>
      </div>

      {/* Main Content Card */}
      <main className="main-content">
        <div className="content-card">
          {/* Optional Visual Element */}
          <div className="visual-element">
            <img 
              src="https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Two people holding hands in silhouette against a beautiful sunset"
              className="friendship-image"
            />
            <div className="image-overlay"></div>
          </div>

          {/* Main Text Content */}
          <div className="text-content">
            <h1 className="glowing-title">
              Someone made something special for you 💖
            </h1>
            
            <p className="warm-subtext">
              This space holds messages, memories, and moments created just for you.
              Every word, every photo, every song was chosen with you in mind.
            </p>

            <div className="instruction-text">
              <p>✨ Enter the secret code shared with you to discover your personalized space ✨</p>
            </div>

            {/* Secret Code Form */}
            <form className="secret-form" onSubmit={handleSubmit}>
              <div className="input-container">
                <input
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Enter your secret code"
                  className={`secret-input ${isInputFocused ? 'focused' : ''} ${isLoading ? 'loading' : ''}`}
                  required
                  disabled={isLoading}
                />
                <div className="input-decoration">
                  <span className="lock-icon">🔒</span>
                </div>
                {isLoading && (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="continue-button"
                disabled={!secretCode.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="button-text">Validating...</span>
                    <span className="button-icon">⏳</span>
                  </>
                ) : (
                  <>
                    <span className="button-text">Open My Space</span>
                    <span className="button-icon">✨</span>
                  </>
                )}
              </button>
            </form>

            {/* Authentication Status Message */}
            {isLoading && (
              <div className="auth-status">
                <p className="status-text">Checking your access... ⏳</p>
              </div>
            )}

            {/* Additional Emotional Message */}
            <div className="emotional-message">
              <div className="message-line">
                <span className="heart-emoji">💕</span>
                <p>You are loved more than you know</p>
              </div>
              <div className="message-line">
                <span className="heart-emoji">🌸</span>
                <p>This moment was made for you</p>
              </div>
            </div>

            {/* Decorative Footer */}
            <div className="decorative-footer">
              <span className="footer-text"><strong>KoriDevifys </strong>• BestieSpace • special dedication to: All lovers </span>
              <div className="footer-emojis">
                <span className="footer-emoji">💫</span>
                <span className="footer-emoji">🕊️</span>
                <span className="footer-emoji">💝</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BestieEntry;