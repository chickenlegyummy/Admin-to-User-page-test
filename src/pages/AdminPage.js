import { useEffect, useState, useRef } from 'react';
import { videoList } from '../utils'; 

// Fix SERVER_URL construction
const getServerUrl = () => {
  const serverIp = process.env.REACT_APP_SERVER_IP || 'localhost:3001';
  // Check if it already includes protocol
  if (serverIp.startsWith('ws://') || serverIp.startsWith('wss://')) {
    return serverIp;
  }
  if (serverIp.startsWith('http://')) {
    return serverIp.replace('http://', 'ws://');
  }
  if (serverIp.startsWith('https://')) {
    return serverIp.replace('https://', 'wss://');
  }
  // Add ws:// if missing
  return `ws://${serverIp}`;
};

const WS_URL = getServerUrl();

function AdminPage() {
  const [status, setStatus] = useState('Idle');
  const [videoPlaying, setWhichVideoPlaying] = useState(videoList[0]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('Connected');
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.command) {
            case 'video-ended':
              setStatus('Video has ended');
              break;
            case 'video-playing':
              setWhichVideoPlaying(videoList[data.currentVideoIndex]);
              break;
            case 'play-video':
              setStatus('Playing');
              break;
            case 'next-video':
              setStatus('Idle');
              break;
            default:
              setStatus(data.status);
              if (data.currentVideoIndex !== undefined) {
                setWhichVideoPlaying(videoList[data.currentVideoIndex]);
              }
          }
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('Disconnected');
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('Error');
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('Error');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handlePlayVideo = () => {
    sendMessage({ type: 'admin-play-video' });
  };

  const handleNextVideo = () => {
    sendMessage({ type: 'admin-next-video' });
  };

  return (
    <div>
      Hello Admin!
      <button onClick={handlePlayVideo} style={{ marginLeft: 10 }}>
        Play User Video
      </button>
      <button onClick={handleNextVideo} style={{ marginLeft: 10 }}>
        Next Video
      </button>
      <h1>Status: {status}</h1>
      <h1>Current Video: {videoPlaying}</h1>
      <p>WebSocket: {connectionStatus}</p>
      <p>WebSocket URL: {WS_URL}</p>
    </div>
  );
}

export default AdminPage;