import { motion } from 'framer-motion';

/**
 * EmptyState — A reusable empty/no-result placeholder.
 *
 * Usage:
 *   <EmptyState icon="🔍" title="No homes found" subtitle="Try adjusting your filters" />
 *   <EmptyState icon="🔍" title="No homes found" action={{ label: 'Clear filters', onClick: fn }} />
 */
export default function EmptyState({ icon = '🔍', title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-[#222222] mb-2">{title}</h3>
      {subtitle && (
        <p className="text-[#717171] text-sm max-w-xs mb-4">{subtitle}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold text-[#FF385C] hover:underline transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
