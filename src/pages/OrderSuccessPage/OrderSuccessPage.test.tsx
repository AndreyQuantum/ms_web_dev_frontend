import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage/OrderSuccessPage';
import { routes } from '@/router';

describe('OrderSuccessPage', () => {
  it('renders the order id when state.orderId is provided', () => {
    const router = createMemoryRouter(
      [
        { path: '/order-success', element: <OrderSuccessPage /> },
        { path: '/', element: <div data-testid="route-stub-home">home</div> },
      ],
      {
        initialEntries: [
          { pathname: '/order-success', state: { orderId: 'ord-test-1' } },
        ],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/ord-test-1/)).toBeInTheDocument();
  });

  it('redirects to "/" when no router state is provided', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [{ pathname: '/order-success' }],
    });

    render(<RouterProvider router={router} />);

    expect(screen.queryByText(/Спасибо за заказ/i)).not.toBeInTheDocument();
  });
});
