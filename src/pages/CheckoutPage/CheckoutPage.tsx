import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ordersApi } from '@/api/orders';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/Button/Button';
import type { DeliveryMethod, OrderItem } from '@/types';

export function CheckoutPage() {
  const { items, getProduct, clear } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [delivery, setDelivery] = useState<DeliveryMethod>('pickup');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const validate = (): { email?: string; phone?: string } => {
    const next: { email?: string; phone?: string } = {};
    if (!email.trim()) {
      next.email = 'Поле обязательно для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Некорректный адрес';
    }
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      next.phone = 'Введите телефон';
    } else if (digits.length < 10) {
      next.phone = 'Телефон должен содержать минимум 10 цифр';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.email || errs.phone) return;

    const orderItems: OrderItem[] = items.map(it => {
      const p = getProduct(it.productId);
      return {
        productId: it.productId,
        name: p?.name ?? it.productId,
        price: p?.price ?? 0,
        qty: it.qty,
      };
    });

    setSubmitting(true);
    try {
      const created = await ordersApi.create({
        customer: { email, phone, comment: comment || undefined },
        deliveryMethod: delivery,
        items: orderItems,
      });
      clear();
      navigate('/order-success', { state: { orderId: created.id } });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="checkout-form" noValidate>
        <div className="form-row">
          <label htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {errors.email ? (
            <span role="alert" className="form-error">
              {errors.email}
            </span>
          ) : null}
        </div>

        <div className="form-row">
          <label htmlFor="checkout-phone">Телефон</label>
          <input
            id="checkout-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          {errors.phone ? (
            <span role="alert" className="form-error">
              {errors.phone}
            </span>
          ) : null}
        </div>

        <div className="form-row">
          <label htmlFor="checkout-comment">Комментарий</label>
          <textarea
            id="checkout-comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <fieldset className="form-row">
          <legend>Доставка</legend>
          <label>
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={delivery === 'pickup'}
              onChange={() => setDelivery('pickup')}
            />
            Самовывоз
          </label>
          <label>
            <input
              type="radio"
              name="delivery"
              value="courier"
              checked={delivery === 'courier'}
              onChange={() => setDelivery('courier')}
            />
            Курьер
          </label>
          <label>
            <input
              type="radio"
              name="delivery"
              value="transport"
              checked={delivery === 'transport'}
              onChange={() => setDelivery('transport')}
            />
            Транспортная компания
          </label>
        </fieldset>

        <Button type="submit" loading={submitting}>
          Оформить заказ
        </Button>
      </form>
    </div>
  );
}
