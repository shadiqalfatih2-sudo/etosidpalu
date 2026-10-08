import './BrandLockup.css';

/** A single official ETOS brand lockup throughout the portal.
 * The existing original etos+ID artwork remains unchanged;
 * only the separate PALU label moves beneath the 'etos' wordmark. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`etos-brand-lockup etos-signature-lockup${compact ? ' is-compact' : ''}`}>
      <img src="/assets/etos-id.png" alt="Etos ID" width={112} height={38} />
      <span className="etos-brand-location etos-signature-location">PALU</span>
    </span>
  );
}
