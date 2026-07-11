export default function CelestialBackdrop() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="stars-layer stars-layer-fine" />
      <div className="stars-layer stars-layer-coarse" />

      {/* Sacred geometry mandala, upper right */}
      <svg
        className="absolute -top-24 -right-24 w-[520px] h-[520px] opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="90" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="100" cy="46" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="100" cy="154" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="53" cy="73" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="53" cy="127" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="147" cy="73" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="147" cy="127" r="40" stroke="#D6B56A" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="4" fill="#D6B56A" />
      </svg>

      {/* Crescent moon, lower left */}
      <svg
        className="absolute bottom-10 -left-16 w-[280px] h-[280px] opacity-[0.08]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M120 30a80 80 0 1 0 0 140 64 64 0 1 1 0-140Z"
          stroke="#D6B56A"
          strokeWidth="0.75"
        />
        <circle cx="60" cy="46" r="1.4" fill="#D6B56A" />
        <circle cx="40" cy="90" r="1" fill="#D6B56A" />
        <circle cx="52" cy="140" r="1.2" fill="#D6B56A" />
        <circle cx="90" cy="164" r="1" fill="#D6B56A" />
      </svg>

      {/* Constellation lines, center-right */}
      <svg
        className="absolute top-1/3 right-8 w-[220px] h-[220px] opacity-[0.09]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M20 40 L60 70 L58 120 L110 100 L150 140 L130 30"
          stroke="#B89BE7"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
        <circle cx="20" cy="40" r="1.5" fill="#F9F6EF" />
        <circle cx="60" cy="70" r="1.5" fill="#F9F6EF" />
        <circle cx="58" cy="120" r="1.5" fill="#F9F6EF" />
        <circle cx="110" cy="100" r="1.5" fill="#F9F6EF" />
        <circle cx="150" cy="140" r="1.5" fill="#F9F6EF" />
        <circle cx="130" cy="30" r="1.5" fill="#F9F6EF" />
      </svg>
    </div>
  );
}
