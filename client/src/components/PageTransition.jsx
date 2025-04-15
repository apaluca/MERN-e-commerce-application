import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that wraps page content and provides transition effects
 * when navigating between pages
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    // If the location changes
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
      
      // Wait until animation completes before updating the location
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 300); // Should match the duration of your CSS transition

      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`transition-opacity duration-300 ease-in-out ${
        transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;