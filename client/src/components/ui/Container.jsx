export default function Container({ children, className = '', narrow = false }) {
  return (
    <div className={`${narrow ? 'max-w-5xl' : 'max-w-7xl'} mx-auto px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
