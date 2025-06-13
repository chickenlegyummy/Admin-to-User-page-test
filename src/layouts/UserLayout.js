// src/layouts/UserLayout.js

function UserLayout({ children }) {
  return (
    <div>
      <header>User Header</header>
      <main>{children}</main>
    </div>
  );
}

export default UserLayout;