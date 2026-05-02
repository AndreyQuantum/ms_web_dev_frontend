import { Outlet } from 'react-router-dom';

export function MinimalLayout() {
  return (
    <main className="minimal-layout">
      <div className="minimal-layout-card">
        <Outlet />
      </div>
    </main>
  );
}
