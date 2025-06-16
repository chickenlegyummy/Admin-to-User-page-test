import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { videoList, videoIndex, setVideoIndex } from '../utils'; 

let socket;
function UserPage() {
  const videoRef = useRef(null);
  const [video, setVideo] = useState(videoList[0]);

  useEffect(() => {
    socket = io(process.env.REACT_APP_SERVER_IP);
    socket.on('play-video', () => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    });
    socket.on('next-video', () => {
      if(videoIndex < videoList.length - 1) {
        setVideoIndex(videoIndex + 1);
        setVideo(videoList[videoIndex]);
      } else {
        setVideoIndex(0);
        setVideo(videoList[videoIndex]);
      }
      socket.emit('video-playing', videoIndex);
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
        src={video}
        ref={videoRef}
      ></video>
    </div>
  );
}

export default UserPage;