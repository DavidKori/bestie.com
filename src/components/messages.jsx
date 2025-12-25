
import React, { useState, useEffect } from 'react';
import './messages.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

function MessagesExperience({ onComplete, onContinue, stepIndex, totalSteps }) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [inkBleed, setInkBleed] = useState([]);
  const [fadingIn, setFadingIn] = useState(false);
  const [showPaperTexture, setShowPaperTexture] = useState(true);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMessages, setHasMessages] = useState(false);
  const [error, setError] = useState(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
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

        // Extract messages from bestie data
        if (bestieInfo && bestieInfo.messages) {
          const loadedMessages = bestieInfo.messages
            .filter(msg => msg && msg.trim() !== '') // Filter out empty messages
            .map((msg, index) => ({
              text: msg,
              delay: index === 0 ? 0 : 4000, // 4 second delay between messages
              originalIndex: index
            }));

          if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
            setHasMessages(true);
            console.log('Loaded messages:', loadedMessages);
            
            // Start message sequence
            setFadingIn(true);
          } else {
            // No messages from admin
            setMessages([
              {
                text: "Your friend hasn't added any messages yet, but I'm sure they're thinking of you.",
                delay: 0
              },
              {
                text: "Sometimes the most meaningful things are left unsaid, waiting for the right moment.",
                delay: 4000
              }
            ]);
            setHasMessages(false);
          }
        } else {
          // No messages in data
          setMessages([
            {
              text: "Your space is being prepared with love...",
              delay: 0
            },
            {
              text: "Special words are coming your way soon.",
              delay: 4000
            }
          ]);
          setHasMessages(false);
        }

      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(error.message);
        
        // Set fallback messages
        setMessages([
          {
            text: "Having trouble loading the messages...",
            delay: 0
          },
          {
            text: "But know that you are thought of and cherished.",
            delay: 4000
          }
        ]);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [secretCode, storedBestieData]);

  // Create ink bleed effects
  useEffect(() => {
    const bleeds = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      top: 20 + Math.random() * 60,
      size: 30 + Math.random() * 50,
      opacity: 0.03 + Math.random() * 0.07,
      delay: i * 0.5
    }));
    setInkBleed(bleeds);
  }, []);

  // Message sequence
  useEffect(() => {
    if (!isLoading && messages.length > 0 && currentMessage < messages.length) {
      const message = messages[currentMessage];
      
      const timer = setTimeout(() => {
        setFadingIn(true);
        
        // Show next message or continue button
        const nextTimer = setTimeout(() => {
          if (currentMessage < messages.length - 1) {
            setFadingIn(false);
            setTimeout(() => {
              setCurrentMessage(prev => prev + 1);
            }, 500); // Short delay before next message
          } else {
            setShowContinue(true);
          }
        }, 5000); // Show each message for 5 seconds

        return () => clearTimeout(nextTimer);
      }, message.delay);

      return () => clearTimeout(timer);
    }
  }, [currentMessage, messages, isLoading]);

  const handleContinue = () => {
    setIsComponentComplete(true);
    if (onComplete) onComplete();
    toast.success("Moving forward with love... 💖");
  };

  // Refresh messages function
  const refreshMessages = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.messages) {
        const newMessages = result.data.messages
          .filter(msg => msg && msg.trim() !== '')
          .map((msg, index) => ({
            text: msg,
            delay: index === 0 ? 0 : 4000,
            originalIndex: index
          }));

        if (newMessages.length > 0) {
          setMessages(newMessages);
          setCurrentMessage(0);
          setFadingIn(true);
          setShowContinue(false);
          toast.success('Messages refreshed!');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh messages');
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageOpacity = (index) => {
    if (index === currentMessage && fadingIn) {
      return 1;
    }
    return 0;
  };

  const getMessageTransform = (index) => {
    if (index === currentMessage && fadingIn) {
      return 'translateY(0)';
    }
    return 'translateY(20px)';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="messages-v2 loading">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="quill-loader">
              <div className="quill">✍️</div>
              <div className="ink-drop"></div>
            </div>
            <p className="loading-text">Preparing your messages...</p>
            <p className="loading-subtext">Gathering words written just for you</p>
          </div>
        </div>
      </div>
    );
  }

  // Error/empty state
  if (error && messages.length === 0) {
    return (
      <div className="messages-v2 error">
        <div className="error-overlay">
          <div className="error-content">
            <div className="error-icon">📝</div>
            <h2 className="error-title">Messages Unavailable</h2>
            <p className="error-message">
              {error || "Couldn't load messages at this time."}
            </p>
            {secretCode && (
              <button 
                className="refresh-btn"
                onClick={refreshMessages}
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
    <div className="messages-v2">
      {/* Floating refresh button */}
      {secretCode && !isLoading && (
        <button 
          className="floating-refresh-messages"
          onClick={refreshMessages}
          title="Refresh messages"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '↻'}
        </button>
      )}
      
      {/* Source indicator */}
      {!hasMessages && !isLoading && (
        <div className="message-source-indicator">
          <span className="source-icon">💭</span>
          <span className="source-text">Placeholder messages</span>
        </div>
      )}
      
      {/* Paper Texture Background */}
      <div className="paper-texture"></div>
      
      {/* Ink Bleed Effects */}
      <div className="ink-bleeds">
        {inkBleed.map(bleed => (
          <div
            key={bleed.id}
            className="ink-bleed"
            style={{
              left: `${bleed.left}%`,
              top: `${bleed.top}%`,
              width: `${bleed.size}px`,
              height: `${bleed.size}px`,
              opacity: bleed.opacity,
              animationDelay: `${bleed.delay}s`
            }}
          />
        ))}
      </div>

      {/* Subtle Light Particles */}
      <div className="light-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="light-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <main className="messages-content-v2">
        {/* Page Decoration */}
        <div className="page-decoration">
          <div className="page-corner corner-tl">
            <div className="corner-line"></div>
            <div className="corner-flower">🌸</div>
          </div>
          <div className="page-corner corner-tr">
            <div className="corner-line"></div>
            <div className="corner-flower">🌿</div>
          </div>
          <div className="page-corner corner-bl">
            <div className="corner-line"></div>
            <div className="corner-flower">🌼</div>
          </div>
          <div className="page-corner corner-br">
            <div className="corner-line"></div>
            <div className="corner-flower">🌷</div>
          </div>
        </div>

        {/* Message Counter */}
        {messages.length > 0 && (
          <div className="message-counter">
            <span className="counter-text">
              Message {currentMessage + 1} of {messages.length}
            </span>
          </div>
        )}

        {/* Messages Container */}
        <div className="messages-wrapper">
          {messages.map((message, index) => (
            <div
              key={index}
              className="message-card-v2"
              style={{
                opacity: getMessageOpacity(index),
                transform: getMessageTransform(index),
                transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Message source indicator */}
              {hasMessages && (
                <div className="message-source-tag">
                  <span className="source-dot"></span>
                  <span className="source-label">From your friend</span>
                </div>
              )}
              
              {/* Handwritten Underline */}
              <div className="handwritten-line"></div>
              
              {/* Message Text */}
              <div className="message-content-v2">
                <p className="message-text-v2">
                  {message.text}
                </p>
                
                {/* Character count */}
                <div className="character-count">
                  <span className="count-number">{message.text.length}</span>
                  <span className="count-label">characters</span>
                </div>
                
                {/* Decorative Quote */}
                <div className="quote-decoration">
                  <span className="quote-mark start">"</span>
                  <span className="quote-mark end">"</span>
                </div>
              </div>
              
              {/* Page Fold Effect */}
              <div className="page-fold"></div>
              
              {/* Ink Splatter */}
              <div className="ink-splatter"></div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="message-progress-indicator">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index <= currentMessage ? 'active' : ''}`}
              onClick={() => {
                if (index <= messages.length - 1) {
                  setFadingIn(false);
                  setTimeout(() => {
                    setCurrentMessage(index);
                    setFadingIn(true);
                  }, 300);
                }
              }}
            >
              {index <= currentMessage && (
                <div className="dot-pulse"></div>
              )}
            </div>
          ))}
          <div className="progress-line"></div>
        </div>

        {/* Breathing Prompt */}
        {fadingIn && currentMessage === 0 && (
          <div className="breathing-prompt">
            <div className="breath-circle"></div>
            <p className="breath-text">Breathe in these words...</p>
          </div>
        )}

        {/* Microcopy */}
        <div className="microcopy-v2">
          <p className="microcopy-text-v2">
            {hasMessages ? 'Real messages from your friend' : 'Read slowly. Feel deeply.'}
          </p>
          <div className="microcopy-dots-v2">
            <div className="microdot"></div>
            <div className="microdot"></div>
            <div className="microdot"></div>
          </div>
        </div>

        {/* Continue Button */}
        {showContinue && (
          <div className="continue-wrapper-v2">
            <button
              className="continue-btn-v2"
              onClick={handleContinue}
            >
              <span className="btn-text">Hold these words close</span>
              <span className="btn-icon">💝</span>
              <div className="btn-ripple"></div>
              <div className="btn-glow"></div>
            </button>
            <p className="continue-note">
              {hasMessages ? 'Your friend\'s words are now with you' : 'When you\'re ready to continue...'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Petals */}
      <div className="floating-petals">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['🌸', '💮', '🏵️', '🌺'][i % 4]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessagesExperience;