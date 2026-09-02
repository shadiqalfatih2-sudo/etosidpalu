export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`etos-brand-lockup${compact ? ' is-compact' : ''}`}>
      <img src="/assets/etos-id.png" alt="Etos ID" width={108} height={36} />
      <span className="etos-brand-location">PALU</span>
    </span>
  );
}
