import { useId } from "react";

interface Props {
  size?: number;
  className?: string;
}

/** Brand mark: a pakhi filled with the pink -> violet gradient (no background). Keep in sync with app/icon.svg. */
export default function Logo({ size = 32, className }: Props) {
  const gradientId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="4 3 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="5" y1="5" x2="27" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff5fa2" />
          <stop offset="0.55" stopColor="#d47cf2" />
          <stop offset="1" stopColor="#8b9cff" />
        </linearGradient>
      </defs>
      {/* the second sub-path is the eye, cut out with evenodd */}
      <path
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
        d="M27 9.5 23.5 8.2C22.6 6.4 20.4 5.6 18.6 6.3 16.4 7.1 15.6 9.4 16.1 11.4 12.4 11.2 8.6 9.6 6 7 6.6 12.6 10 16.4 14.6 17.4 11.6 19.2 8.2 19.8 5 19.2 8.4 23.6 14.4 25.2 19.2 22.6 23 20.6 24.6 16.4 24 12.2ZM21.2 9a1 1 0 1 1-2 0 1 1 0 1 1 2 0Z"
      />
    </svg>
  );
}
