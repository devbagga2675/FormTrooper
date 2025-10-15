import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      {/* Placeholder for a future Navbar */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;