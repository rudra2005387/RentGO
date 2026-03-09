/**
 * SectionCard — Consistent bordered card wrapper for page sections.
 * Use for host info, reviews, calendar, amenities, etc.
 */
export default function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
