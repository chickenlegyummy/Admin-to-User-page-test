import { useEffect, useRef, useState } from 'react';
import { videoList, videoIndex, setVideoIndex, getVideoIndex } from '../utils'; 

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

function UserPage() {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [video, setVideo] = useState(videoList[0]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
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
            case 'play-video':
              if (videoRef.current) {
                videoRef.current.play();
              }
              break;
            case 'next-video':
              const currentIndex = getVideoIndex();
              if (currentIndex < videoList.length - 1) {
                setVideoIndex(currentIndex + 1);
              } else {
                setVideoIndex(0);
              }
              setVideo(videoList[getVideoIndex()]);
              
              // Notify server about current video via WebSocket
              sendMessage({
                type: 'user-video-playing',
                videoIndex: getVideoIndex()
              });
              break;
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

    // Add event listener for video ended
    const videoElement = videoRef.current;
    const handleEnded = () => {
      sendMessage({ type: 'user-video-ended' });
    };

    if (videoElement) {
      videoElement.addEventListener('ended', handleEnded);
    }

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (videoElement) {
        videoElement.removeEventListener('ended', handleEnded);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      Hello User!
      <video
        id="videoPlayer"
        style={{ width: "800px" }}
        src={video}
        ref={videoRef}
      ></video>
      <p>WebSocket: {connectionStatus}</p>
      <p>WebSocket URL: {WS_URL}</p>
      <p>Current Video: {video}</p>
    </div>
  );
}

export default UserPage;