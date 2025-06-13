import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket;
function UserPage() {
  const videoRef = useRef(null);

  useEffect(() => {
    socket = io('http://localhost:3001');
    socket.on('play-video', () => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      Hello User!
      <video
        id="videoPlayer"
        style={{ width: "300px" }}
        src="42.mp4"
        muted
        ref={videoRef}
      ></video>
    </div>
  );
}

export default UserPage;