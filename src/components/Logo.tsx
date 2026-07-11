// Brand mark: the silhouette of New Mexico with a "$" set inside the state —
// "tax, inside New Mexico." Colors are hard-coded so the mark renders anywhere
// (header, favicon, print).

export function Logo({
  size = 30,
  className,
  title = "NM Tax Appeals",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
    >
      {/* Simplified New Mexico outline (square body + southwest bootheel). */}
      <path
        d="M12,12 H88 V78 H32 V90 H16 V78 H12 Z"
        fill="#a2543a"
        stroke="#83422d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* The "tax" inside the state. */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="46"
        fill="#faf7f2"
      >
        $
      </text>
    </svg>
  );
}
