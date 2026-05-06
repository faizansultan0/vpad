/**
 * BorderShineDots
 *
 * Implements the FrontendHero "shine border" technique:
 *  - A mask div covers the entire card with mask-composite: exclude
 *    to show only a 1px border strip.
 *  - Inside it, a large rotating div with conic-gradient creates
 *    the travelling shine. Because the rotating element is INSIDE the
 *    masked border strip, nothing bleeds onto the card content.
 *  - Two diametrically-opposite shine spots at 0° and 180°.
 *
 * Props:
 *  radius   – border-radius of the card in px  (default 24)
 *  duration – seconds for one full rotation     (default 20)
 */
export default function BorderShineDots({ radius = 24, duration = 20 }) {
  return (
    <div
      className="border-shine-mask"
      style={{ borderRadius: radius }}
    >
      <div
        className="border-shine-glow"
        style={{
          animation: `borderShineRotate ${duration}s linear infinite`,
        }}
      />
    </div>
  );
}
