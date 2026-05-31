import { useSound } from './SoundProvider';

/** Speaker icon button that mutes/unmutes UI sound and remembers the choice. */
export function SoundToggle() {
  const { enabled, toggle, play } = useSound();

  const handleClick = () => {
    toggle(); // updates mute state synchronously
    play('toggle'); // audible only if we just turned sound on
  };

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute sound' : 'Unmute sound'}
      title={enabled ? 'Mute sound' : 'Unmute sound'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {enabled ? (
          <path
            d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M17 9.5l4 5M21 9.5l-4 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
