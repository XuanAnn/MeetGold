import { useEffect, useState, useCallback } from 'react';
import { signalingService } from '../services/signaling.service';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    signalingService
      .connect()
      .then(() => {
        if (mounted) {
          setIsConnected(true);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setIsConnected(false);
          setError(err.message || 'Failed to connect to signaling server');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const reconnect = useCallback(() => {
    setError(null);
    return signalingService.connect().then(() => setIsConnected(true));
  }, []);

  return { isConnected, error, reconnect, selfPeerId: signalingService.selfPeerId };
}
