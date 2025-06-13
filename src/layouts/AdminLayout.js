// src/layouts/AdminLayout.js

function AdminLayout({ children }) {
  return (
    <div>
      <header>Admin Header</header>
      <main>{children}</main>
    </div>
  );
}

export default AdminLayout;