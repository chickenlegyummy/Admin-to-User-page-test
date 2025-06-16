import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { videoList, videoIndex } from '../utils'; 

let socket;

function AdminPage() {
  const [status, setStatus] = useState('Idle');
  const [videoPlaying, setWhichVideoPlaying] = useState(videoList[videoIndex]);

  useEffect(() => {
    socket = io(process.env.REACT_APP_SERVER_IP);
    socket.on('video-ended', () => {
      setStatus('Video has ended');
    });
    socket.on('video-playing', (data) => {
      setWhichVideoPlaying(videoList[data]);
    });
    socket.on('play-video', () => {
      setStatus('Playing');
    });
    socket.on('next-video', () => {
      setStatus('Idle');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePlayVideo = () => {
    socket.emit('play-video');
  };

  const handleNextVideo = () => {
    socket.emit('next-video');
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
    </div>
  );
}

export default AdminPage;