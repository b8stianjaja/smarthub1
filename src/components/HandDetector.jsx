import { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';

const HandDetector = ({ onFrame }) => {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const isReady = useRef(false);

  useEffect(() => {
    // Si ya está listo, no reinicializar (Blindaje de Memoria D.E.M. 3.15)
    if (isReady.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        // Aseguramos que la ruta sea absoluta desde la raíz de public (D.E.M. 3.14)
        return `/mediapipe/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks?.length > 0) {
        onFrame(results.multiHandLandmarks[0]);
      }
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, frameRate: 60 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          isReady.current = true;
          
          // Ciclo VSYNC (D.E.M. 3.11, 3.13)
          const runDetection = async () => {
            if (isReady.current && videoRef.current) {
              await hands.send({ image: videoRef.current });
              requestAnimationFrame(runDetection);
            }
          };
          runDetection();
        }
      } catch (err) {
        console.error("Error en cámara o motor IA:", err);
      }
    };

    startCamera();
    handsRef.current = hands;

    // Limpieza profunda para evitar el error de "Module.arguments"
    return () => {
      isReady.current = false;
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [onFrame]);

  return (
    <video 
      ref={videoRef} 
      style={{ display: 'none' }} 
      playsInline 
      muted 
    />
  );
};

export default HandDetector;