import { useEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { Hands } from '@mediapipe/hands';

// Función auxiliar para calcular distancia 3D real
const getDistance3D = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
};

export const useSpatialEngine = (onAction) => {
  const videoRef = useRef(null);
  const cursorX = useMotionValue(window.innerWidth / 2);
  const cursorY = useMotionValue(window.innerHeight / 2);
  
  // Estado de carga para la UI
  const [isReady, setIsReady] = useState(false);
  
  const isPinchingRef = useRef(false);
  const pinchFramesRef = useRef(0); // Para evitar pinches accidentales (Anti-flicker)
  const lastPinchTime = useRef(0);
  const onActionRef = useRef(onAction);
  
  // EMA Filter más rápido (menos latencia)
  const smoothedX = useRef(window.innerWidth / 2);
  const smoothedY = useRef(window.innerHeight / 2);

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    let isRunning = true;
    const hands = new Hands({ locateFile: (f) => `/mediapipe/${f}` });
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1, // 1 es el balance perfecto entre velocidad y precisión
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65
    });

    hands.onResults((results) => {
      // Si llegamos aquí y hay resultados, la IA ya está lista
      if (isRunning) setIsReady(true);

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        document.querySelectorAll('.spatial-hover').forEach(el => el.classList.remove('spatial-hover'));
        document.getElementById('spatial-cursor')?.classList.remove('is-pinching');
        pinchFramesRef.current = 0; // Reiniciar contador de pinch
        return;
      }
      
      const hand = results.multiHandLandmarks[0];
      const index = hand[8]; // Punta del índice
      const thumb = hand[4]; // Punta del pulgar
      const wrist = hand[0]; // Muñeca
      const middleBase = hand[9]; // Base del dedo medio

      // 1. Movimiento del Cursor (Filtro EMA super rápido: 60% nuevo, 40% viejo)
      const rawX = (1 - index.x) * window.innerWidth;
      const rawY = index.y * window.innerHeight;

      smoothedX.current = smoothedX.current + (rawX - smoothedX.current) * 0.6;
      smoothedY.current = smoothedY.current + (rawY - smoothedY.current) * 0.6;
      
      cursorX.set(smoothedX.current);
      cursorY.set(smoothedY.current);

      // 2. Pellizco Dinámico Inteligente (Independiente de la distancia a la cámara)
      const pinchDistance = getDistance3D(thumb, index);
      const handSize = getDistance3D(wrist, middleBase); // Usamos la palma como referencia de escala
      
      // Proporción: Si la distancia de los dedos es menor al 22% del tamaño de la mano, es un pinch
      const pinchRatio = pinchDistance / handSize;
      const isCurrentlyPinchingRaw = pinchRatio < 0.22;

      // 3. Sistema Anti-Flicker (Exigir 3 fotogramas consecutivos de pinch para validarlo)
      if (isCurrentlyPinchingRaw) {
        pinchFramesRef.current += 1;
      } else {
        pinchFramesRef.current = 0;
      }

      const isPinchingConfirmed = pinchFramesRef.current >= 3;

      // Actualizar UI del cursor
      const cursorDOM = document.getElementById('spatial-cursor');
      if (isPinchingConfirmed) {
        cursorDOM?.classList.add('is-pinching');
      } else {
        cursorDOM?.classList.remove('is-pinching');
      }

      // 4. Detección de colisión (ElementFromPoint)
      const hitElement = document.elementFromPoint(smoothedX.current, smoothedY.current);
      const interactable = hitElement?.closest('.spatial-interactable');

      document.querySelectorAll('.spatial-interactable.spatial-hover').forEach(el => {
        if (el !== interactable) el.classList.remove('spatial-hover');
      });

      if (interactable && !isPinchingConfirmed) {
        interactable.classList.add('spatial-hover');
      }

      // 5. Ejecución del Click con cooldown
      const now = Date.now();
      if (isPinchingConfirmed && !isPinchingRef.current && (now - lastPinchTime.current > 600)) {
        if (interactable) {
          const action = interactable.dataset.spatialAction;
          const targetId = interactable.dataset.spatialId;
          
          interactable.classList.add('spatial-active');
          setTimeout(() => interactable.classList.remove('spatial-active'), 250);
          
          if (onActionRef.current) onActionRef.current(action, targetId);
          lastPinchTime.current = now;
        }
      }
      
      isPinchingRef.current = isPinchingConfirmed;
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play(); 
          
          const tick = async () => {
            if (!isRunning) return;
            if (videoRef.current && videoRef.current.readyState >= 2) {
              try { await hands.send({ image: videoRef.current }); } catch (e) {}
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
  }, []);

  return { videoRef, cursorX, cursorY, isReady };
};