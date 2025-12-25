import React, { useState, useEffect } from 'react';
import './mainController.css';

// Import all your existing components (update paths as needed)
import BestieEntry from '../pages/landing';


import BestieWelcome from '../pages/home';


import SongDedication from '../components/songDedication';


import MessagesExperience from '../components/messages';


import PhotoGallery from '../components/gallery';


import JokesExperience from '../components/jokes';


import InteractiveQuestions from '../components/question';


import ReasonsWhyILoveYou from '../components/reason';


import PlaylistExperience from '../components/playlist';


const ExperienceController = () => {
  // Define the exact flow order
  const FLOW_ORDER = [
    { id: 'entry', component: BestieEntry, title: "Welcome" },
    { id: 'welcome', component: BestieWelcome, title: "Welcome" },
    { id: 'song', component: SongDedication, title: "Song Dedication" },
    { id: 'messages', component: MessagesExperience, title: "Messages" },
    { id: 'gallery', component: PhotoGallery, title: "Photo Gallery" },
    { id: 'jokes', component: JokesExperience, title: "Jokes" },
    { id: 'questions', component: InteractiveQuestions, title: "Questions" },
    { id: 'reasons', component: ReasonsWhyILoveYou, title: "Reasons" },
    { id: 'playlist', component: PlaylistExperience, title: "Playlist" }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward');
  const [transitionTheme, setTransitionTheme] = useState('hearts');
  const [hasCompletedStep, setHasCompletedStep] = useState(false);

  const CurrentComponent = FLOW_ORDER[currentStep].component;
  const nextStepTitle = currentStep < FLOW_ORDER.length - 1 
    ? FLOW_ORDER[currentStep + 1].title 
    : "The End";

  // Determine transition theme based on flow
  const getTransitionTheme = (fromIndex, toIndex) => {
    const transitions = {
      '0→1': 'sparkles', // Entry → Welcome
      '1→2': 'hearts',   // Welcome → Song (emotional start)
      '2→3': 'soft-glow', // Song → Messages (emotional → calm)
      '3→4': 'particles', // Messages → Gallery (calm → nostalgic)
      '4→5': 'emojis',    // Gallery → Jokes (nostalgic → fun)
      '5→6': 'questions', // Jokes → Questions (fun → curious)
      '6→7': 'hearts',    // Questions → Reasons (curious → emotional peak)
      '7→8': 'music'      // Reasons → Playlist (emotional peak → closure)
    };
    
    const key = `${fromIndex}→${toIndex}`;
    return transitions[key] || 'sparkles';
  };

  const handleContinue = () => {
    if (currentStep >= FLOW_ORDER.length - 1) {
      // Final completion
      alert("You've completed the entire journey! 💖");
      return;
    }

    if (!isTransitioning && hasCompletedStep) {
      setTransitionDirection('forward');
      setTransitionTheme(getTransitionTheme(currentStep, currentStep + 1));
      setIsTransitioning(true);
    }
  };

  // Handle step completion from child components
  const handleStepComplete = () => {
    setHasCompletedStep(true);
  };

  // Handle navigation to next step after transition
  useEffect(() => {
    if (isTransitioning) {
      const transitionTimer = setTimeout(() => {
        if (transitionDirection === 'forward') {
          setCurrentStep(prev => prev + 1);
        } else {
          setCurrentStep(prev => prev - 1);
        }
        
        setHasCompletedStep(false);
        setIsTransitioning(false);
      }, 1200); // Match transition duration

      return () => clearTimeout(transitionTimer);
    }
  }, [isTransitioning, transitionDirection]);

  // Progress indicator data
  const progressPercentage = ((currentStep + 1) / FLOW_ORDER.length) * 100;
  const progressText = `${currentStep + 1} of ${FLOW_ORDER.length}`;

  return (
    <div className="experience-controller">
      {/* Global background that transitions between sections */}
      <div className={`global-background step-${FLOW_ORDER[currentStep].id} ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Dynamic background elements that morph */}
        <div className="bg-hearts"></div>
        <div className="bg-sparkles"></div>
        <div className="bg-music-notes"></div>
        <div className="bg-emojis"></div>
        <div className="bg-questions"></div>
        <div className="bg-particles"></div>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className={`transition-overlay theme-${transitionTheme}`}>
          {/* Theme-specific transition elements */}
          {transitionTheme === 'hearts' && (
            <>
              <div className="transition-heart heart-1">💖</div>
              <div className="transition-heart heart-2">💕</div>
              <div className="transition-heart heart-3">💗</div>
              <div className="transition-heart heart-4">💓</div>
              <div className="transition-heart heart-5">💞</div>
              <div className="transition-text">More love awaits...</div>
            </>
          )}
          
          {transitionTheme === 'sparkles' && (
            <>
              <div className="transition-sparkle sparkle-1">✨</div>
              <div className="transition-sparkle sparkle-2">✨</div>
              <div className="transition-sparkle sparkle-3">✨</div>
              <div className="transition-sparkle sparkle-4">✨</div>
              <div className="transition-sparkle sparkle-5">✨</div>
              <div className="transition-text">Something wonderful is coming...</div>
            </>
          )}
          
          {transitionTheme === 'music' && (
            <>
              <div className="transition-note note-1">♫</div>
              <div className="transition-note note-2">♪</div>
              <div className="transition-note note-3">♬</div>
              <div className="transition-note note-4">🎵</div>
              <div className="transition-text">Your special soundtrack...</div>
            </>
          )}
          
          {transitionTheme === 'emojis' && (
            <>
              <div className="transition-emoji emoji-1">😂</div>
              <div className="transition-emoji emoji-2">😄</div>
              <div className="transition-emoji emoji-3">🤭</div>
              <div className="transition-emoji emoji-4">✨</div>
              <div className="transition-text">Get ready for some fun...</div>
            </>
          )}
          
          {transitionTheme === 'questions' && (
            <>
              <div className="transition-question q-1">❓</div>
              <div className="transition-question q-2">💭</div>
              <div className="transition-question q-3">✨</div>
              <div className="transition-text">Let's share some thoughts...</div>
            </>
          )}
          
          {transitionTheme === 'particles' && (
            <>
              <div className="transition-particle particle-1"></div>
              <div className="transition-particle particle-2"></div>
              <div className="transition-particle particle-3"></div>
              <div className="transition-particle particle-4"></div>
              <div className="transition-particle particle-5"></div>
              <div className="transition-text">Traveling through memories...</div>
            </>
          )}
          
          {transitionTheme === 'soft-glow' && (
            <>
              <div className="transition-glow glow-1"></div>
              <div className="transition-glow glow-2"></div>
              <div className="transition-glow glow-3"></div>
              <div className="transition-text">Warm feelings ahead...</div>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={`content-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
        <CurrentComponent 
          onComplete={handleStepComplete}
          onContinue={handleContinue}
          stepIndex={currentStep}
          totalSteps={FLOW_ORDER.length}
        />
      </div>

      {/* Global Progress Indicator */}
      {!isTransitioning && currentStep > 0 && currentStep < FLOW_ORDER.length && (
        <div className="global-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {progressText} • {FLOW_ORDER[currentStep].title}
            {currentStep < FLOW_ORDER.length - 1 && (
              <span className="next-step-hint"> → Next: {nextStepTitle}</span>
            )}
          </div>
        </div>
      )}

      {/* Global Navigation Hint */}
      {hasCompletedStep && !isTransitioning && currentStep < FLOW_ORDER.length - 1 && (
        handleContinue()
      )}

      {/* Final Journey Completion */}
      {currentStep === FLOW_ORDER.length - 1 && hasCompletedStep && !isTransitioning && (
        <div className="journey-completion">
          <div className="completion-card">
            <div className="completion-icon">🎉</div>
            <h3 className="completion-title">You've completed the entire journey!</h3>
            <p className="completion-text">
              Every moment, every memory, every feeling shared here is precious.
              Thank you for walking through this with me. 💖
            </p>
            <div className="completion-sparkles">
              <span>✨</span>
              <span>💖</span>
              <span>🎉</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceController;