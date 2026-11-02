// ========================================
// GLASS PANEL COMPONENT
// ========================================

function GlassPanel({
  children,
  className = "",
}) {
  return (
    <div className={`glass-panel ${className}`}>
      {children}
    </div>
  );
}

// ========================================
// EXPORT
// ========================================

export default GlassPanel;