import { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const SpatialCursor = ({ point, isPinching }) => {
  // Configuración de resortes para inercia orgánica [cite: 33]
  const springConfig = { stiffness: 250, damping: 30 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    if (point) {
      x.set(point.x * window.innerWidth);
      y.set(point.y * window.innerHeight);
    }
  }, [point, x, y]);

  return (
    <motion.div 
      className={`spatial-cursor ${isPinching ? 'active' : ''}`}
      style={{ x, y, position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999 }}
    >
      <div className="cursor-visual" />
    </motion.div>
  );
};

export default SpatialCursor;