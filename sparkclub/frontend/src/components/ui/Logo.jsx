export default function Logo({ variant = 'white', className = '' }) {
  const src = variant === 'black' ? '/logos/logo-black.png' : '/logos/logo-white.png';
  return (
    <img
      src={src}
      alt="SparkClub"
      className={className}
    />
  );
}