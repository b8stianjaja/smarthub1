import { useEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { Hands } from '@mediapipe/hands';

const getDistance3D = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
};

export const useSpatialEngine = (onAction) => {
  const videoRef = useRef(null);
  
  const cursorX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const cursorY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  
  const [isReady, setIsReady] = useState(false);
  
  const isPinchingRef = useRef(false);
  const pinchFramesRef = useRef(0); 
  const lastPinchTime = useRef(0);
  const onActionRef = useRef(onAction);

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    let isRunning = true;
    const hands = new Hands({ locateFile: (f) => `/mediapipe/${f}` });
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1, 
      minDetectionConfidence: 0.7, 
      minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
      if (isRunning && !isReady) setIsReady(true);

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        const activeHover = document.querySelector('.spatial-hover');
        if (activeHover) activeHover.classList.remove('spatial-hover');
        document.getElementById('spatial-cursor')?.classList.remove('is-pinching');
        pinchFramesRef.current = 0;
        return;
      }
      
      const hand = results.multiHandLandmarks[0];
      const index = hand[8];
      const thumb = hand[4];
      const wrist = hand[0];
      const middleBase = hand[9];

      // Coordenadas exactas mapeadas a la pantalla
      const targetX = (1 - index.x) * window.innerWidth;
      const targetY = index.y * window.innerHeight;
      
      cursorX.set(targetX);
      cursorY.set(targetY);

      // Detección de Pinch
      const pinchDistance = getDistance3D(thumb, index);
      const handSize = getDistance3D(wrist, middleBase);
      const isCurrentlyPinchingRaw = (pinchDistance / handSize) < 0.22;

      // Sistema Anti-Flicker para evitar clicks fantasmas
      pinchFramesRef.current = isCurrentlyPinchingRaw ? pinchFramesRef.current + 1 : 0;
      const isPinchingConfirmed = pinchFramesRef.current >= 3;

      const cursorDOM = document.getElementById('spatial-cursor');
      if (isPinchingConfirmed && !cursorDOM?.classList.contains('is-pinching')) {
        cursorDOM?.classList.add('is-pinching');
      } else if (!isPinchingConfirmed && cursorDOM?.classList.contains('is-pinching')) {
        cursorDOM?.classList.remove('is-pinching');
      }

      // Colisión ultra rápida (el !important en CSS pointer-events evita que choque consigo mismo)
      const hitElement = document.elementFromPoint(targetX, targetY);
      const interactable = hitElement?.closest('.spatial-interactable');
      const currentHover = document.querySelector('.spatial-interactable.spatial-hover');

      if (currentHover && currentHover !== interactable) {
        currentHover.classList.remove('spatial-hover');
      }
      
      if (interactable && !isPinchingConfirmed && currentHover !== interactable) {
        interactable.classList.add('spatial-hover');
      }

      // Ejecución del Click
      const now = Date.now();
      if (isPinchingConfirmed && !isPinchingRef.current && (now - lastPinchTime.current > 500)) {
        if (interactable) {
          const action = interactable.dataset.spatialAction;
          const targetId = interactable.dataset.spatialId;
          
          interactable.classList.add('spatial-active');
          setTimeout(() => interactable.classList.remove('spatial-active'), 150);
          
          if (onActionRef.current) onActionRef.current(action, targetId);
          lastPinchTime.current = now;
        }
      }
      
      isPinchingRef.current = isPinchingConfirmed;
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
        console.error("Error de cámara:", err);
      }
    };

    startCamera();

    return () => {
      isRunning = false;
      hands.close();
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, [cursorX, cursorY, isReady]);

  return { videoRef, cursorX, cursorY, isReady };
};