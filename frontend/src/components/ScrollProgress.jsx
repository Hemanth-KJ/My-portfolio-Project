import { useEffect, useState } from "react";

// ========================================
// SCROLL PROGRESS COMPONENT
// ========================================

function ScrollProgress() {
  // ========================================
  // SCROLL PROGRESS STATE
  // ========================================

  const [progress, setProgress] = useState(0);

  // ========================================
  // SCROLL EVENT
  // ========================================

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setProgress(percentage);
    };

    // Add scroll event listener
    window.addEventListener(
      "scroll",
      updateProgress
    );

    // Set initial progress
    updateProgress();

    // Cleanup scroll event listener
    return () =>
      window.removeEventListener(
        "scroll",
        updateProgress
      );
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="scroll-progress">
      <div
        className="scroll-progress-bar"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

// ========================================
// EXPORT
// ========================================

export default ScrollProgress;