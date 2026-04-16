import type { RefObject } from 'react';

type CameraCaptureProps = {
  isCameraOpen: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onCapturePhoto: () => void;
  onCancelCamera: () => void;
};

export default function CameraCapture({
  isCameraOpen,
  videoRef,
  onStartCamera,
  onCapturePhoto,
  onCancelCamera,
}: CameraCaptureProps) {
  if (!isCameraOpen) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={onStartCamera}
        style={{ marginTop: '20px', width: '100%', padding: '1rem', fontSize: '1.25rem' }}
      >
        Use Camera
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          minHeight: '320px',
          borderRadius: '8px',
          backgroundColor: '#000',
          aspectRatio: '1',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={onCapturePhoto}
          style={{ flex: 1 }}
        >
          Capture
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancelCamera}
          style={{ flex: 1 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
