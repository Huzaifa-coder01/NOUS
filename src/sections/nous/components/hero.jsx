import { Hero as HeroRoot, HeroStats } from '../styles';

// ----------------------------------------------------------------------

export function Hero({ title, subtitle, stats = [] }) {
  return (
    <HeroRoot>
      <h1>{title}</h1>
      <p>{subtitle}</p>

      {!!stats.length && (
        <HeroStats>
          {stats.map((stat) => (
            <span key={stat}>{stat}</span>
          ))}
        </HeroStats>
      )}
    </HeroRoot>
  );
}
