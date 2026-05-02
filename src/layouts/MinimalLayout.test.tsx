import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { MinimalLayout } from '@/layouts/MinimalLayout';

const ChildStub = () => <div data-testid="minimal-child-stub">child</div>;

function buildRouter() {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <MinimalLayout />,
        children: [{ index: true, element: <ChildStub /> }],
      },
    ],
    { initialEntries: ['/'] }
  );
}

describe('<MinimalLayout>', () => {
  it('renders the <Outlet /> child content', () => {
    render(<RouterProvider router={buildRouter()} />);
    expect(screen.getByTestId('minimal-child-stub')).toBeInTheDocument();
  });

  it('does not render the admin sidebar or the public footer', () => {
    render(<RouterProvider router={buildRouter()} />);
    expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('public-footer')).not.toBeInTheDocument();
  });
});
