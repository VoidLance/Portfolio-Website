// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
import Image from 'next/image';
import { useTheme } from '../context/ThemeContext';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  name: Movie['name'];
  img: Movie['img'];
  alt: Movie['alt'];
  description: Movie['description'];
  rating: Movie['rating'];
  genres: Movie['genres'];
  onRate?: (rating: number) => void;
}

const formatGenre = (genre: string) => genre.charAt(0).toUpperCase() + genre.slice(1);

const MovieCard: React.FC<MovieCardProps> = ({
  name,
  img,
  alt,
  description,
  rating,
  genres,
  onRate,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderStars = () => {
    const normalizedRating = Math.max(0, Math.min(5, rating));
    const roundedRating = Math.round(normalizedRating);

    return (
      <div className="flex items-center" role="radiogroup" aria-label="Rate this movie">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= roundedRating;
          const label = `Rate ${starValue} star${starValue === 1 ? '' : 's'}`;
          return (
            <button
              key={`star-${starValue}`}
              type="button"
              onClick={onRate ? () => onRate(starValue) : undefined}
              className={`text-lg ${onRate ? 'cursor-pointer hover:text-amber-600' : 'cursor-default'}`}
              aria-pressed={isFilled}
              aria-label={label}
              disabled={!onRate}
            >
              {isFilled ? '★' : '☆'}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <section className={`movie-card m-1 items-center flex flex-col max-w-md max-h-full min-h-full overflow-hidden wrap p-2 rounded-lg shadow-lg ${
      isDark 
        ? 'bg-[#3a3a3a] text-amber-100' 
        : 'bg-[#d4c5b8] text-[#2d2d2d]'
    }`}>
      <h2 className="text-xl p-3">{name}</h2>
      {img && <Image width={200} height={250} src={img} alt={alt} />}
      <div className="flex flex-wrap justify-center gap-2 pt-3 text-xs">
        {genres.map((genre) => (
          <span key={genre} className={`rounded px-2 py-1 ${
            isDark 
              ? 'bg-rose-400 text-[#1a1a1a]' 
              : 'bg-rose-400 text-[#2d2d2d]'
          }`}>
            {formatGenre(genre)}
          </span>
        ))}
      </div>
      <p className="p-3 text-md">{description}</p>
      <div className="rating">
        <span>Rating: </span>
        {renderStars()}
      </div>
    </section>
  );
};

export default MovieCard;

