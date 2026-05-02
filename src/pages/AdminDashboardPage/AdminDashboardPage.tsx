import { useEffect, useMemo, useState } from 'react';
import { ordersApi } from '@/api/orders';
import { productsApi } from '@/api/products';
import { formatPrice } from '@/utils/format';
import type { Order } from '@/types';

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeProducts, setActiveProducts] = useState(0);

  useEffect(() => {
    ordersApi.list().then(setOrders).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    productsApi
      .list({ size: 1000, page: 1 })
      .then(res => setActiveProducts(res.total))
      .catch(() => setActiveProducts(0));
  }, []);

  const kpis = useMemo(() => {
    const revenue = orders.reduce((acc, o) => acc + o.total, 0);
    const ordersThisMonth = orders.length;
    const avgCheck = ordersThisMonth > 0 ? Math.round(revenue / ordersThisMonth) : 0;
    return {
      revenue,
      ordersThisMonth,
      avgCheck,
      activeProducts,
    };
  }, [orders, activeProducts]);

  const last7Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const total = orders
        .filter(o => {
          const ts = new Date(o.createdAt).getTime();
          return ts >= d.getTime() && ts < next.getTime();
        })
        .reduce((acc, o) => acc + o.total, 0);
      days.push({
        label: `${d.getDate()}.${d.getMonth() + 1}`,
        total,
      });
    }
    return days;
  }, [orders]);

  const maxBar = Math.max(1, ...last7Days.map(d => d.total));

  const topProducts = useMemo(() => {
    const counter = new Map<string, { name: string; qty: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const prev = counter.get(item.productId);
        if (prev) {
          prev.qty += item.qty;
        } else {
          counter.set(item.productId, { name: item.name, qty: item.qty });
        }
      }
    }
    const all = Array.from(counter.entries()).map(([productId, v]) => ({
      productId,
      name: v.name,
      qty: v.qty,
    }));
    all.sort((a, b) => b.qty - a.qty);
    while (all.length < 5) {
      all.push({ productId: `placeholder-${all.length}`, name: '—', qty: 0 });
    }
    return all.slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);
  }, [orders]);

  return (
    <div className="admin-dashboard-page">
      <h1>Дашборд</h1>

      <section className="dashboard-kpis">
        <div data-testid="kpi-card" className="kpi-card">
          <div className="kpi-title">Выручка</div>
          <div className="kpi-value">{formatPrice(kpis.revenue)}</div>
        </div>
        <div data-testid="kpi-card" className="kpi-card">
          <div className="kpi-title">Заказы за месяц</div>
          <div className="kpi-value">{kpis.ordersThisMonth}</div>
        </div>
        <div data-testid="kpi-card" className="kpi-card">
          <div className="kpi-title">Средний чек</div>
          <div className="kpi-value">{formatPrice(kpis.avgCheck)}</div>
        </div>
        <div data-testid="kpi-card" className="kpi-card">
          <div className="kpi-title">Активных товаров</div>
          <div className="kpi-value">{kpis.activeProducts}</div>
        </div>
      </section>

      <section className="dashboard-chart">
        <h2>Продажи за 7 дней</h2>
        <svg
          viewBox="0 0 350 120"
          className="dashboard-bars"
          aria-label="Продажи по дням"
        >
          {last7Days.map((d, i) => {
            const height = Math.max(2, (d.total / maxBar) * 100);
            const x = i * 50 + 5;
            const y = 110 - height;
            return (
              <rect
                key={i}
                data-testid="sales-bar"
                x={x}
                y={y}
                width={40}
                height={height}
                fill="#4f8cff"
              >
                <title>{`${d.label}: ${formatPrice(d.total)}`}</title>
              </rect>
            );
          })}
        </svg>
      </section>

      <section className="dashboard-top-products">
        <h2>Топ-товары</h2>
        <ul className="top-products-list">
          {topProducts.map(p => (
            <li
              key={p.productId}
              data-testid="top-product"
              className="top-product"
            >
              <span className="top-product-name">{p.name}</span>
              <span className="top-product-qty">{p.qty}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-orders">
        <h2>Последние заказы</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Email</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer.email}</td>
                <td>{formatPrice(o.total)}</td>
                <td>{o.status}</td>
                <td>{new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
