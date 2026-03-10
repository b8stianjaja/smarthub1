import { motion, useSpring } from 'framer-motion';

const SpatialCursor = ({ x, y }) => {
  // Ajuste premium: Mucha rigidez (stiffness) para que responda rápido, 
  // pero buena amortiguación (damping) para evitar que rebote.
  const springConfig = { damping: 25, stiffness: 450, mass: 0.1, restDelta: 0.001 };
  
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  return (
    <motion.div
      id="spatial-cursor"
      className="spatial-cursor-wrapper"
      style={{ x: smoothX, y: smoothY }}
    >
      <div className="spatial-cursor-core" />
      <div className="spatial-cursor-ring" />
    </motion.div>
  );
};

export default SpatialCursor;