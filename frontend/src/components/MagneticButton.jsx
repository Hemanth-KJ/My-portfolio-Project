import { useRef } from "react";
import "./MagneticButton.css";

// ========================================
// MAGNETIC BUTTON COMPONENT
// ========================================

function MagneticButton({
  children,
  className = "",
  ...props
}) {
  // ========================================
  // BUTTON REF
  // ========================================

  const buttonRef = useRef(null);

  // ========================================
  // MOUSE MOVE HANDLER
  // ========================================

  const handleMouseMove = (e) => {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const x =
      e.clientX -
      rect.left -
      rect.width / 2;

    const y =
      e.clientY -
      rect.top -
      rect.height / 2;

    button.style.transform = `
      translate(${x * 0.15}px, ${y * 0.15}px)
    `;
  };

  // ========================================
  // MOUSE LEAVE HANDLER
  // ========================================

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;

    buttonRef.current.style.transform =
      "translate(0, 0)";
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <button
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}

// ========================================
// EXPORT
// ========================================

export default MagneticButton;