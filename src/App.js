import React, { useState, useRef } from 'react';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [role, setRole] = useState(null);
  const videoRef = useRef(null);

  // Function to trigger video playback
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setRole('user')}>User</button>
        <button onClick={() => setRole('admin')}>Admin</button>
      </div>
      {!role && <div>Please select a role above.</div>}
      {role === 'user' && (
        <UserLayout>
          <UserPage videoRef={videoRef} />
        </UserLayout>
      )}
      {role === 'admin' && (
        <AdminLayout>
          <AdminPage onPlayVideo={handlePlayVideo} />
        </AdminLayout>
      )}
    </div>
  );
}

export default App;