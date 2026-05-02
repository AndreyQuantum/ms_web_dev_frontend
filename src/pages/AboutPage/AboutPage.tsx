export function AboutPage() {
  return (
    <div className="about-page">
      <h1>О компании</h1>

      <section className="about-hero">
        <p>
          ЛампоМаркет — крупный поставщик ламп и светильников по всей России.
          Мы работаем с проверенными производителями и предлагаем большой
          ассортимент по выгодным ценам.
        </p>
      </section>

      <section className="about-production">
        <h2>Производство</h2>
        <p>
          Наши партнёры — заводы Европы и Азии. Все товары проходят
          сертификацию и отвечают требованиям безопасности.
        </p>
      </section>

      <section className="about-delivery">
        <h2>Доставка</h2>
        <div className="about-delivery-cards">
          <div data-testid="delivery-card" className="delivery-card">
            <h3>Самовывоз</h3>
            <p>Из ближайшего пункта выдачи бесплатно.</p>
          </div>
          <div data-testid="delivery-card" className="delivery-card">
            <h3>Курьер</h3>
            <p>Доставка по городу в день заказа.</p>
          </div>
          <div data-testid="delivery-card" className="delivery-card">
            <h3>Транспортная компания</h3>
            <p>Доставка по всей России надёжными перевозчиками.</p>
          </div>
        </div>
      </section>

      <section className="about-contacts">
        <h2>Контакты</h2>
        <p>
          Телефон: <a href="tel:+78001234567">+7 (800) 123-45-67</a>
        </p>
        <p>
          E-mail: <a href="mailto:info@lampomarket.ru">info@lampomarket.ru</a>
        </p>
        <div data-testid="map-placeholder" className="about-map-placeholder">
          Карта (плейсхолдер)
        </div>
      </section>
    </div>
  );
}
