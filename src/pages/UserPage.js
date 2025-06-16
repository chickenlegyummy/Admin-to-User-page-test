import { useEffect, useRef, useState } from 'react';
import { videoList, videoIndex, setVideoIndex, getVideoIndex } from '../utils'; 

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

function UserPage() {
  const videoRef = useRef(null);
  const [video, setVideo] = useState(videoList[0]);

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource(`${SERVER_URL}/events`);
    
    eventSource.onmessage = (event) => {
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
          
          // Notify server about current video
          fetch(`${SERVER_URL}/user/video-playing`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoIndex: getVideoIndex() })
          }).catch(error => console.error('Error updating video index:', error));
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      console.log('Trying to connect to:', `${SERVER_URL}/events`);
    };

    // Add event listener for video ended
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleEnded = async () => {
        try {
          await fetch(`${SERVER_URL}/user/video-ended`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error reporting video ended:', error);
        }
      };
      videoElement.addEventListener('ended', handleEnded);

      // Cleanup
      return () => {
        videoElement.removeEventListener('ended', handleEnded);
        eventSource.close();
      };
    }

    // Cleanup if video element is not present
    return () => {
      eventSource.close();
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
      <p>Connecting to: {SERVER_URL}</p>
    </div>
  );
}

export default UserPage;