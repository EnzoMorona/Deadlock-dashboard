import type { Hero } from "../types/deadlock";
import "./HeroCard.css";

interface HeroCardProps {
  hero: Hero;
}

function HeroCard({ hero }: HeroCardProps) {
  return (
    <div className="hero-card">

      <img
        className="hero-card-image"
        src={hero.images.icon_hero_card}
        alt={hero.name}
      />

      <div className="hero-card-content">

        <h2 className="hero-card-name">
          {hero.name}
        </h2>

        <p className="hero-card-role">
          {hero.description.role}
        </p>

        <div className="hero-card-info">
          <p>Tipo: {hero.hero_type}</p>
          <p>Dificuldade: {hero.complexity}</p>
        </div>

      </div>

    </div>
  );
}

export default HeroCard;