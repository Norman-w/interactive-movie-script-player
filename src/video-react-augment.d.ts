import 'video-react';

declare module 'video-react' {
  interface PlayerProps {
    onPause?: () => void;
    onPlay?: () => void;
    onTimeUpdate?: (e: unknown) => void;
    onLoadedMetadata?: (e: unknown) => void;
    className?: string;
  }
}
