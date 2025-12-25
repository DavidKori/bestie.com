
import React, { useState, useEffect, useRef } from 'react';
import './question.css';
import toast from 'react-hot-toast';
import bestieService from '../config/bestieService';

const InteractiveQuestions = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  // Array of placeholders for questions (likely to make sense for all)
  const questionPlaceholders = [
    "Share whatever comes to mind first... 💭",
    "Just type what feels right in this moment ✨",
    "No pressure, just honest thoughts 🌸",
    "Whatever you're thinking, it's perfect 💖",
    "Speak from the heart, I'm listening 🌟",
    "Your perspective matters most here 💫",
    "Take your time, there's no rush 🕊️",
    "I'd love to hear your thoughts on this 💌",
    "Just be yourself, that's more than enough 😊",
    "Your words are safe with me 💛"
  ];

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isComponentComplete, setIsComponentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const textareaRef = useRef(null);

  // Get secret code and bestie data
  const secretCode = sessionStorage.getItem('bestieSecretCode');
  const storedBestieData = sessionStorage.getItem('bestieData');

  const currentQuestion = questions[currentQuestionIndex] || {};

  useEffect(() => {
    if (isComponentComplete && onComplete) {
      onComplete();
    }
  }, [isComponentComplete, onComplete]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
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

        // Extract questions from bestie data
        if (bestieInfo && bestieInfo.questions && bestieInfo.questions.length > 0) {
          // Filter out empty questions and map with placeholders
          const loadedQuestions = bestieInfo.questions
            .filter(q => q && q.question && q.question.trim() !== '')
            .map((q, index) => ({
              id: q._id || `question-${index}`,
              text: q.question,
              placeholder: questionPlaceholders[index % questionPlaceholders.length],
              originalAnswer: q.answer || "",
              isFromBackend: true,
              questionIndex: index
            }));

          if (loadedQuestions.length > 0) {
            setQuestions(loadedQuestions);
            console.log('Loaded questions:', loadedQuestions.length, 'questions');
            
            // Pre-populate answers from backend
            const preloadedAnswers = {};
            loadedQuestions.forEach((q, index) => {
              if (q.originalAnswer && q.originalAnswer.trim() !== '') {
                preloadedAnswers[q.questionIndex] = q.originalAnswer;
              }
            });
            setAnswers(preloadedAnswers);
            
          } else {
            // No valid questions - use fallback
            useFallbackQuestions();
          }
        } else {
          // No questions in data - use fallback
          useFallbackQuestions();
        }

      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
        useFallbackQuestions();
        
      } finally {
        setIsLoading(false);
      }
    };

    const useFallbackQuestions = () => {
      const fallbackQuestions = [
        {
          id: 1,
          text: "What's one moment with me that always makes you smile?",
          placeholder: questionPlaceholders[0],
          isFromBackend: false
        },
        {
          id: 2,
          text: "If you could describe our friendship in one word, what would it be?",
          placeholder: questionPlaceholders[1],
          isFromBackend: false
        }
      ];
      
      setQuestions(fallbackQuestions);
      console.log('Using fallback questions');
    };

    fetchQuestions();
  }, [secretCode, storedBestieData]);

  // Submit answer to backend
  const submitAnswerToBackend = async (questionIndex, answer) => {
    if (!secretCode || !currentQuestion.isFromBackend) return;
    
    try {
      setIsSubmitting(true);
      const result = await bestieService.submitAnswer(secretCode, questionIndex, answer);
      
      if (result.success) {
        console.log('Answer submitted:', result.data);
        toast.success('Answer saved! 💖');
        return true;
      } else {
        toast.error('Failed to save answer');
        return false;
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Network error - saving locally');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh questions function
  const refreshQuestions = async () => {
    try {
      setIsLoading(true);
      const result = await bestieService.getBestieByCode(secretCode);
      if (result.success && result.data.questions) {
        const newQuestions = result.data.questions
          .filter(q => q && q.question && q.question.trim() !== '')
          .map((q, index) => ({
            id: q._id || `question-${index}`,
            text: q.question,
            placeholder: questionPlaceholders[index % questionPlaceholders.length],
            originalAnswer: q.answer || "",
            isFromBackend: true,
            questionIndex: index
          }));

        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          setCurrentQuestionIndex(0);
          setCurrentAnswer('');
          setIsSubmitted(false);
          toast.success('Questions refreshed!');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e) => {
    if (!isSubmitted && !isSubmitting) {
      setCurrentAnswer(e.target.value);
    }
  };

  const handleSubmit = async () => {
    if (currentAnswer.trim() === '' || isSubmitting) return;
    
    setIsSubmitted(true);
    setShowConfirmation(true);
    
    // Save answer locally
    const questionIndex = currentQuestion.questionIndex || currentQuestionIndex;
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: currentAnswer
    }));
    
    // Submit to backend if it's from backend
    if (currentQuestion.isFromBackend && secretCode) {
      await submitAnswerToBackend(questionIndex, currentAnswer);
      toast.success('Answer saved ! 💌');
    } else {
      toast.success('Answer saved locally! 💌');
    }
    
    // Auto-hide confirmation after delay
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
    
    // Focus management for mobile
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleNextQuestion = () => {
    if (isAnimating || isSubmitting) return;
    
    setIsAnimating(true);
    setIsSubmitted(false);
    setCurrentAnswer('');
    setShowConfirmation(false);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setHasCompleted(true);
        setIsComponentComplete(true);
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const handleContinue = () => {
    if (onComplete) onComplete();
    toast.success("That's why I love you! 😋");
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
    toast.error("🙌😂 You don't want to answer? I still love you! ✨");
  };

  const handleRestart = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setIsSubmitted(false);
      setShowConfirmation(false);
      setHasCompleted(false);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  // Auto-focus textarea on question change
  useEffect(() => {
    if (textareaRef.current && !isSubmitted && !isLoading && questions.length > 0) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 500);
    }
  }, [currentQuestionIndex, isSubmitted, isLoading, questions.length]);

  // Load existing answer for current question
  useEffect(() => {
    if (currentQuestion.isFromBackend && currentQuestion.originalAnswer) {
      setCurrentAnswer(currentQuestion.originalAnswer);
      setIsSubmitted(true);
    } else if (answers[currentQuestion.questionIndex || currentQuestionIndex]) {
      setCurrentAnswer(answers[currentQuestion.questionIndex || currentQuestionIndex]);
      setIsSubmitted(true);
    } else {
      setCurrentAnswer('');
      setIsSubmitted(false);
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

  // Handle Enter key for submission (Shift+Enter for new line)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && currentAnswer.trim() && !isSubmitted && !isSubmitting) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [currentAnswer, isSubmitted, isSubmitting]);

  // Loading state
  if (isLoading) {
    return (
      <div className="questions-experience loading">
        <div className="loading-container">
          <div className="question-loader">
            <div className="question-icon">❓</div>
            <div className="question-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
          <p className="loading-text">Loading your questions...</p>
          <p className="loading-subtext">Preparing thoughtful prompts just for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <div className="questions-experience error">
        <div className="error-container">
          <div className="error-icon">❓</div>
          <h2 className="error-title">Questions Unavailable</h2>
          <p className="error-message">
            {error || "Couldn't load questions at this time."}
          </p>
          {secretCode && (
            <button 
              className="refresh-questions-btn"
              onClick={refreshQuestions}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Try Again'}
            </button>
          )}
          <button 
            className="continue-anyway-btn"
            onClick={handleSkip}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  // Empty questions state
  if (questions.length === 0) {
    return (
      <div className="questions-experience empty">
        <div className="empty-container">
          <div className="empty-icon">💭</div>
          <h2 className="empty-title">No Questions Yet</h2>
          <p className="empty-message">
            Your friend hasn't added any questions yet, but they're thinking of you!
          </p>
          {secretCode && (
            <button 
              className="refresh-empty-btn"
              onClick={refreshQuestions}
              disabled={isLoading}
            >
              Check for questions
            </button>
          )}
          <button 
            className="continue-empty-btn"
            onClick={handleSkip}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-experience">
      {/* Floating refresh button */}
      {secretCode && !isLoading && questions[0]?.isFromBackend && (
        <button 
          className="floating-refresh-questions"
          onClick={refreshQuestions}
          title="Refresh questions"
          disabled={isLoading}
        >
          {isLoading ? '🔄' : '❓'}
        </button>
      )}
      
      {/* Questions source indicator */}
      {questions.length > 0 && questions[0]?.isFromBackend && (
        <div className="questions-source-indicator">
          <span className="source-icon">💭</span>
          <span className="source-text">Questions from your friend</span>
        </div>
      )}
      
      {/* Answer status indicator */}
      {currentQuestion.originalAnswer && (
        <div className="answer-status-indicator">
          <span className="status-icon">💌</span>
          <span className="status-text">You already answered this</span>
        </div>
      )}
      
      {/* Animated Background */}
      <div className="animated-background">
        <div className="bg-icon icon-1">❓</div>
        <div className="bg-icon icon-2">💭</div>
        <div className="bg-icon icon-3">✨</div>
        <div className="bg-icon icon-4">🌸</div>
        <div className="bg-icon icon-5">💖</div>
        <div className="bg-icon icon-6">❓</div>
        <div className="bg-icon icon-7">💭</div>
        <div className="bg-icon icon-8">✨</div>
        
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
      </div>

      <div className="experience-container">
        <header className="experience-header">
          <h1 className="experience-title">Let's Share Some Thoughts</h1>
          <p className="experience-subtitle">
            {questions[0]?.isFromBackend 
              ? `${questions.length} questions just for you 💭` 
              : "Just curious about your beautiful mind 💭"}
          </p>
        </header>

        <main className="questions-stage">
          <div className={`question-card ${isAnimating ? 'card-exit' : ''}`}>
            <div className="card-content">
              {/* Question Number */}
              <div className="question-meta">
                <span className="question-count">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="question-dots">
                  {questions.map((_, index) => (
                    <div 
                      key={index}
                      className={`question-dot ${index === currentQuestionIndex ? 'active' : ''} ${index < currentQuestionIndex ? 'answered' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Question source indicator */}
              {currentQuestion.isFromBackend && (
                <div className="question-source-tag">
                  <span className="source-dot"></span>
                  <span className="source-label">From your friend</span>
                </div>
              )}

              {/* Question Text */}
              <div className="question-text-container">
                <div className="question-icon">💭</div>
                <h2 className="question-text">{currentQuestion.text}</h2>
                <div className="question-line"></div>
              </div>

              {/* Answer Input */}
              <div className="answer-section">
                <div className="answer-input-container">
                  <textarea
                    ref={textareaRef}
                    className={`answer-textarea ${isSubmitted ? 'submitted' : ''} ${isSubmitting ? 'submitting' : ''}`}
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    placeholder={currentQuestion.placeholder}
                    disabled={isSubmitted || isSubmitting}
                    rows="4"
                    maxLength="500"
                  />
                  <div className="textarea-decoration"></div>
                  
                  {!isSubmitted && !isSubmitting && (
                    <div className="input-hint">
                      <span className="hint-icon">✨</span>
                      <span className="hint-text">Share whatever feels right, no pressure</span>
                    </div>
                  )}
                  
                  {/* Answer loading indicator */}
                  {isSubmitting && (
                    <div className="submitting-indicator">
                      <div className="submitting-spinner"></div>
                      <span className="submitting-text">Saving your answer...</span>
                    </div>
                  )}
                </div>

                {/* Character counter */}
                <div className="character-counter">
                  {currentAnswer.length}/500
                </div>
              </div>

              {/* Submit/Next Buttons */}
              <div className="action-section">
                {!isSubmitted ? (
                  <button
                    className={`submit-button ${currentAnswer.trim() ? 'active' : ''}`}
                    onClick={handleSubmit}
                    disabled={!currentAnswer.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="button-icon">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">💌</span>
                        Send my answer
                        <span className="button-sparkle">✨</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="next-button"
                    onClick={handleNextQuestion}
                    disabled={isSubmitting}
                  >
                    <span className="button-icon">➡️</span>
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                    <span className="button-sparkle">✨</span>
                  </button>
                )}
              </div>

              {/* Confirmation Message */}
              {showConfirmation && (
                <div className="confirmation-message">
                  <div className="confirmation-content">
                    <span className="confirmation-icon">💖</span>
                    <p className="confirmation-text">
                      {currentQuestion.isFromBackend 
                        ? 'Answer saved to your friend!' 
                        : 'Your answer has been saved'}
                    </p>
                    <div className="confirmation-sparkle">✨</div>
                  </div>
                </div>
              )}
            </div>

            {/* Card decorations */}
            <div className="card-corner top-left">🌸</div>
            <div className="card-corner top-right">✨</div>
            <div className="card-corner bottom-left">💭</div>
            <div className="card-corner bottom-right">💖</div>
          </div>

          {/* Completion Section */}
          {hasCompleted && (
            <div className="completion-section">
              <div className="completion-card">
                <div className="completion-icon">💗</div>
                <h3 className="completion-title">Thank you for sharing a piece of yourself</h3>
                <p className="completion-text">
                  {questions[0]?.isFromBackend
                    ? 'Every answer helps your friend know you better. These thoughts will be treasured.'
                    : 'Every answer is a beautiful glimpse into your wonderful mind. I\'ll treasure these thoughts always.'}
                </p>
                <div className="completion-sparkles">
                  <span>✨</span>
                  <span>💖</span>
                  <span>🌸</span>
                  <span>💭</span>
                  <span>✨</span>
                </div>
              </div>

              <div className="completion-actions">
                <button
                  className="continue-button"
                  onClick={handleContinue}
                >
                  Continue 💖
                </button>
                <button
                  className="review-button"
                  onClick={handleRestart}
                >
                  Review answers? 🔄
                </button>
              </div>
            </div>
          )}

          {/* Skip Section (Always visible) */}
          <div className="skip-section">
            <button
              className="skip-button"
              onClick={handleSkip}
            >
              Skip ✨
            </button>
            <p className="skip-hint">Come back to answer anytime</p>
          </div>

          {/* Progress summary */}
          <div className="progress-summary">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${((currentQuestionIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100}%` 
                }}
              ></div>
            </div>
            <p className="progress-text">
              {Object.keys(answers).length} of {questions.length} questions answered
            </p>
          </div>
        </main>

        <footer className="experience-footer">
          <p className="footer-note">
            {questions[0]?.isFromBackend 
              ? 'Your answers help your friend know you better 💫' 
              : 'Your thoughts are safe here 💫'}
          </p>
          <div className="footer-icons">
            <span>💭</span>
            <span>💖</span>
            <span>✨</span>
            <span>🌸</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default InteractiveQuestions;