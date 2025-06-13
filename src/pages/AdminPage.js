import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let socket;
function AdminPage() {
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    socket = io('http://localhost:3001');
    socket.on('video-ended', () => {
      setStatus('Video has ended');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePlayVideo = () => {
    socket.emit('play-video');
    setStatus('Playing');
  };

  return (
    <div>
      Hello Admin!
      <button onClick={handlePlayVideo} style={{ marginLeft: 10 }}>
        Play User Video
      </button>
      <h1>Status: {status}</h1>
    </div>
  );
}

export default AdminPage;