import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Use a small timeout to ensure page content has rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50); // Small delay to ensure DOM updates first

    return () => clearTimeout(timeoutId); // Clean up timeout
  }, [pathname, search]); // Watch both pathname and search params

  return null;
};

export default ScrollToTop;
