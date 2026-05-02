import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/Button/Button';

interface OrderSuccessState {
  orderId?: string;
}

export function OrderSuccessPage() {
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;

  if (!state || !state.orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="order-success-page">
      <h1>Спасибо за заказ!</h1>
      <p>Номер вашего заказа: <strong>{state.orderId}</strong></p>
      <p>Мы свяжемся с вами в ближайшее время для подтверждения.</p>
      <Link to="/catalog">
        <Button>Продолжить покупки</Button>
      </Link>
    </div>
  );
}
