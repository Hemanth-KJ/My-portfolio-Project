import { useEffect, useState } from "react";
import "./Cursor.css";

// ========================================
// CUSTOM CURSOR COMPONENT
// ========================================

function Cursor() {
  // ========================================
  // CURSOR POSITION STATE
  // ========================================

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  // ========================================
  // HOVER STATE
  // ========================================

  const [hovering, setHovering] = useState(false);

  // ========================================
  // MOUSE EVENT HANDLERS
  // ========================================

  useEffect(() => {
    // Update cursor position
    const moveCursor = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    // Detect hoverable elements
    const handleMouseOver = (event) => {
      if (
        event.target.closest(
          "a, button, .visual-frame"
        )
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    // ========================================
    // ADD EVENT LISTENERS
    // ========================================

    window.addEventListener(
      "mousemove",
      moveCursor
    );

    document.addEventListener(
      "mouseover",
      handleMouseOver
    );

    // ========================================
    // CLEANUP EVENT LISTENERS
    // ========================================

    return () => {
      window.removeEventListener(
        "mousemove",
        moveCursor
      );

      document.removeEventListener(
        "mouseover",
        handleMouseOver
      );
    };
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`custom-cursor ${
        hovering ? "cursor-hover" : ""
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    />
  );
}

// ========================================
// EXPORT
// ========================================

export default Cursor;