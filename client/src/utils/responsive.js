// Mobile optimization utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

export const getSafeAreaPadding = () => {
  if (typeof window === 'undefined') return {};
  const env = window.CSS?.env;
  if (!env) return {};
  
  return {
    paddingTop: `max(12px, env(safe-area-inset-top))`,
    paddingLeft: `max(12px, env(safe-area-inset-left))`,
    paddingRight: `max(12px, env(safe-area-inset-right))`,
    paddingBottom: `max(12px, env(safe-area-inset-bottom))`,
  };
};

export const getResponsiveClass = (mobile = '', tablet = '', desktop = '') => {
  return `${mobile} md:${tablet} lg:${desktop}`;
};

export const getResponsiveSpacing = () => {
  return {
    px: isMobile() ? 'px-3' : isTablet() ? 'px-4' : 'px-6',
    py: isMobile() ? 'py-3' : isTablet() ? 'py-4' : 'py-6',
  };
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = React.useState(
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1024, height: 768 }
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    width: windowSize.width,
    height: windowSize.height,
  };
};

export const touchProps = {
  onTouchStart: (e) => e.preventDefault,
  onTouchEnd: (e) => e.preventDefault,
};

export const tapFeedback = {
  whileTap: { scale: 0.95, opacity: 0.8 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};
