import { money } from '../utils/helpers';

export default function StatCard({ title, value, subtitle, tone = 'default', currency = true }) {
  return (
    <section className={`card stat-card ${tone}`}>
      <span className="stat-title">{title}</span>
      <strong>{currency ? money(value) : value}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </section>
  );
}
