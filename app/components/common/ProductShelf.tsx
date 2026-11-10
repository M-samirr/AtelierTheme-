import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Rail } from './Rail';
import { ProductCard } from '../product';
import { ErrorState } from '../ui';
import { cn } from '../../lib/cn';
import type { ProductSource } from '../../lib/blockData';

export type ShelfDisplay = 'grid' | 'rail';

export interface ProductRowProps {
  products: Product[];
  display: ShelfDisplay;
  /** Loads the first cards eagerly, for a block above the fold. */
  priority?: boolean;
  label?: string;
}

/** Products as a grid or a scrolling rail. */
export function ProductRow({ products, display, priority = false, label }: ProductRowProps) {
  const cards = products.map((item, index) => (
    <ProductCard key={item.id} product={item} index={index} imagePriority={priority && index < 2} />
  ));
  return display === 'rail' ? (
    <Rail label={label}>{cards}</Rail>
  ) : (
    <div className="at-grid">{cards}</div>
  );
}

/** One card's place while it loads. */
export function CardSkeleton() {
  return (
    <div className="at-card-skeleton" aria-hidden="true">
      <span className="at-skeleton at-card-skeleton__media" />
      <span className="at-skeleton at-card-skeleton__line" />
      <span className="at-skeleton at-card-skeleton__line at-card-skeleton__line--short" />
    </div>
  );
}

export function ShelfSkeleton({ count = 4, display }: { count?: number; display: ShelfDisplay }) {
  return (
    <div className={cn('at-grid', display === 'rail' && 'at-grid--one-row')} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export interface ProductShelfProps {
  source: ProductSource | null;
  limit: number;
  display: ShelfDisplay;
  priority?: boolean;
  label?: string;
}

/**
 * Loads one list of products and shows it, with its loading and error states.
 * One request per shelf: the review rules forbid a request per product. A shelf
 * with nothing to show renders nothing, so an empty block leaves no gap.
 */
export function ProductShelf({ source, limit, display, priority, label }: ProductShelfProps) {
  const query = useQuery({
    ...productApi.queries.list({
      source: source?.source ?? 'latest',
      sourceValue: source?.sourceValue,
      perPage: limit,
    }),
    enabled: source !== null,
  });

  if (source === null) return null;
  if (query.isLoading) return <ShelfSkeleton display={display} />;
  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} retrying={query.isFetching} />;
  }

  const products = (query.data?.items ?? []).slice(0, limit);
  if (!products.length) return null;
  return <ProductRow products={products} display={display} priority={priority} label={label} />;
}
