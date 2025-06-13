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

    // Add event listener for video ended
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleEnded = () => {
        socket.emit('video-ended');
      };
      videoElement.addEventListener('ended', handleEnded);

      // Cleanup
      return () => {
        videoElement.removeEventListener('ended', handleEnded);
        socket.disconnect();
      };
    }

    // Cleanup socket if video element is not present
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      Hello User!
      <video
        id="videoPlayer"
        style={{ width: "800px" }}
        src="42.mp4"
        ref={videoRef}
      ></video>
    </div>
  );
}

export default UserPage;