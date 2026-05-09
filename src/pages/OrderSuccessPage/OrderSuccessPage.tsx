import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/Button/Button';
import { useAppSelector } from '@/store/hooks';

interface OrderSuccessState {
  orderId?: string;
}

export function OrderSuccessPage() {
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;
  const lastOrder = useAppSelector((s) => s.orders.lastOrder);

  if (!lastOrder && (!state || !state.orderId)) {
    return (
      <div className="order-success-page">
        <h1>Заказ не найден</h1>
        <p>Информация о заказе отсутствует или была сброшена.</p>
        <Link to="/">
          <Button>Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  if (lastOrder) {
    return (
      <div className="order-success-page">
        <h1>Спасибо за заказ!</h1>
        <p>
          Номер вашего заказа: <strong>{lastOrder.id}</strong>
        </p>
        <p>
          Сумма заказа: <strong>{lastOrder.total}</strong>
        </p>
        <p>Мы свяжемся с вами в ближайшее время для подтверждения.</p>
        <Link to="/">
          <Button>Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  // Fallback: orderId came from router state (legacy path)
  return (
    <div className="order-success-page">
      <h1>Спасибо за заказ!</h1>
      <p>
        Номер вашего заказа: <strong>{state!.orderId}</strong>
      </p>
      <p>Мы свяжемся с вами в ближайшее время для подтверждения.</p>
      <Link to="/">
        <Button>Вернуться в каталог</Button>
      </Link>
    </div>
  );
}
