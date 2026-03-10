import { motion, useSpring } from 'framer-motion';

const SpatialCursor = ({ x, y }) => {
  // Configuración física para el cursor
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  return (
    <motion.div
      className="spatial-cursor-wrapper"
      style={{ x: smoothX, y: smoothY }}
    >
      <div className="spatial-cursor-core" />
      <div className="spatial-cursor-ring" />
    </motion.div>
  );
};

export default SpatialCursor;