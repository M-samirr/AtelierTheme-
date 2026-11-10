import { CardSkeleton } from '../common';
import { cn } from '../../lib/cn';

/** Holds the listing's shape while its loader runs, so a sort or filter change does not jump. */
export function ProductListSkeleton({ hideFilters = false }: { hideFilters?: boolean }) {
  return (
    <div aria-hidden="true">
      <div className="at-container">
        <div className="at-breadcrumb-space" />
        <div className="at-listing-hero">
          <div className="at-listing-hero__copy">
            <span className="at-skeleton at-listing-hero__placeholder" />
          </div>
        </div>
      </div>
      <div className="at-container at-listing">
        <div className="at-toolbar" />
        <div className={cn('at-listing__layout', !hideFilters && 'at-listing__layout--sidebar')}>
          {!hideFilters && <span className="at-skeleton at-listing__filters-placeholder" />}
          <div className="at-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
