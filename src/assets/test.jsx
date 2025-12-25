// In each component file, add:
const MyComponent = ({ onComplete, onContinue, stepIndex, totalSteps }) => {
  // When the component is done (e.g., all photos viewed, jokes completed):
  useEffect(() => {
    // Signal completion when appropriate
    onComplete();
  }, [/* completion condition */]);

  // Then call onContinue when user clicks continue button
  // This is already handled by your existing continue buttons
};