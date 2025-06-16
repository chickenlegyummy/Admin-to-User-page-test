import { useEffect, useState } from 'react';
import { videoList } from '../utils'; 

// Fix SERVER_URL construction
const getServerUrl = () => {
  const serverIp = process.env.REACT_APP_SERVER_IP || 'localhost:3001';
  // Check if it already includes protocol
  if (serverIp.startsWith('http://') || serverIp.startsWith('https://')) {
    return serverIp;
  }
  // Add http:// if missing
  return `http://${serverIp}`;
};

const SERVER_URL = getServerUrl();

function AdminPage() {
  const [status, setStatus] = useState('Idle');
  const [videoPlaying, setWhichVideoPlaying] = useState(videoList[0]);

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource(`${SERVER_URL}/events`);
    
    eventSource.onmessage = (event) => {
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
          setWhichVideoPlaying(videoList[data.currentVideoIndex]);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      console.log('Trying to connect to:', `${SERVER_URL}/events`);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handlePlayVideo = async () => {
    try {
      await fetch(`${SERVER_URL}/admin/play-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handleNextVideo = async () => {
    try {
      await fetch(`${SERVER_URL}/admin/next-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error going to next video:', error);
    }
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
      <p>Connecting to: {SERVER_URL}</p>
    </div>
  );
}

export default AdminPage;