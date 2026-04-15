import { useCallback, useEffect, useRef, useState } from 'react';

type CameraErrorHandler = (message: string) => void;

async function createImageFileFromVideo(video: HTMLVideoElement): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  context.drawImage(video, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.85);
  });

  if (!blob) {
    return null;
  }

  return new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
}

export function useCameraCapture(onError?: CameraErrorHandler) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopCamera = useCallback(() => {
    setStream((activeStream) => {
      activeStream?.getTracks().forEach((track) => track.stop());
      return null;
    });

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.('Your browser does not support camera access.');
      return;
    }

    try {
      stopCamera();
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });
      setStream(nextStream);
      setIsCameraOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not access camera.';
      onError?.(message);
    }
  }, [onError, stopCamera]);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current) {
      return null;
    }

    const file = await createImageFileFromVideo(videoRef.current);

    if (file) {
      stopCamera();
    }

    return file;
  }, [stopCamera]);

  useEffect(() => {
    if (!isCameraOpen || !stream || !videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
    void videoRef.current.play();
  }, [isCameraOpen, stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isCameraOpen,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}
