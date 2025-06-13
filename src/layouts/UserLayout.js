// src/layouts/UserLayout.js
import React from 'react';

function UserLayout({ children }) {
  return (
    <div>
      <header>User Header</header>
      <main>{children}</main>
    </div>
  );
}

export default UserLayout;