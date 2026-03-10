import { motion, useSpring } from 'framer-motion';

const SpatialCursor = ({ x, y }) => {
  // Física ajustada: Alta rigidez (respuesta rápida) + Alta amortiguación (cero temblor)
  const springConfig = { damping: 35, stiffness: 700, mass: 0.05, restDelta: 0.001 };
  
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