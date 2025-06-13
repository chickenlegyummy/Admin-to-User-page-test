import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;
function AdminPage() {
  useEffect(() => {
    socket = io('http://localhost:3001');
    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePlayVideo = () => {
    socket.emit('play-video');
  };

  return (
    <div>
      Hello Admin!
      <button onClick={handlePlayVideo} style={{ marginLeft: 10 }}>
        Play User Video
      </button>
    </div>
  );
}

export default AdminPage;