import { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import { Hands } from '@mediapipe/hands';
import { sendBridgeCommand } from '../core/bridge';

export const useSpatialEngine = () => {
  const videoRef = useRef(null);
  const cursorX = useMotionValue(window.innerWidth / 2);
  const cursorY = useMotionValue(window.innerHeight / 2);
  const isPinchingRef = useRef(false);
  const collisionMap = useRef([]);

  useEffect(() => {
    let isRunning = true; // Bandera de seguridad para detener el loop al cerrar

    const hands = new Hands({ locateFile: (f) => `/mediapipe/${f}` });
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6, // Bajé un poco la rigidez para probar
      minTrackingConfidence: 0.6
    });

    hands.onResults((results) => {
      // Si no hay manos, cancelamos
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
      
      const hand = results.multiHandLandmarks[0];
      const index = hand[8];
      const thumb = hand[4];

      // OJO AQUÍ: (1 - index.x) invierte el eje horizontal. 
      // Como volteamos la cámara en el CSS (espejo), necesitamos que el cursor también lo haga.
      const pxX = (1 - index.x) * window.innerWidth;
      const pxY = index.y * window.innerHeight;
      
      cursorX.set(pxX);
      cursorY.set(pxY);

      const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));
      const currentlyPinching = dist < 0.05;

      if (currentlyPinching && !isPinchingRef.current) {
        const hit = collisionMap.current.find(app => 
          pxX >= app.rect.left && pxX <= app.rect.right &&
          pxY >= app.rect.top && pxY <= app.rect.bottom
        );
        
        if (hit) {
          sendBridgeCommand('OPEN_APP', { id: hit.id });
          console.log(`Pinch detectado. Abriendo: ${hit.id}`);
        }
      }
      isPinchingRef.current = currentlyPinching;
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // FORZAMOS LA REPRODUCCIÓN DIRECTAMENTE
          await videoRef.current.play(); 
          
          const tick = async () => {
            if (!isRunning) return;
            if (videoRef.current && videoRef.current.readyState >= 2) {
              await hands.send({ image: videoRef.current });
            }
            requestAnimationFrame(tick);
          };
          tick();
        }
      } catch (err) {
        console.error("Error al iniciar la cámara:", err);
      }
    };

    startCamera();

    return () => {
      isRunning = false; // Matamos el loop
      hands.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [cursorX, cursorY]);

  const updateCollisionMap = (map) => { collisionMap.current = map; };

  return { videoRef, cursorX, cursorY, updateCollisionMap };
};