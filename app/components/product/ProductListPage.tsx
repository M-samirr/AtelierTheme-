import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useLocation, useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { availableSortIds, sortOptions } from '@salla.sa/twilight-theme-engine/utils/sort-options';
import { onSallaEvent, whenSallaReady } from '@salla.sa/twilight-theme-engine/utils';
import { Breadcrumb, Image, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { Drawer } from '@salla.sa/twilight-theme-engine/drawer';
import { Testimonials, useReorderButtons } from '@salla.sa/twilight-theme-engine/home';
import {
  parseNextPageToken,
  product as productApi,
} from '@salla.sa/twilight-theme-engine/api/product';
import {
  useAppliedFilters,
  type ProductListLoaderData,
} from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { Category, Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { ItemsList, ReviewItemSkeleton } from '@salla.sa/twilight-components-react';
import { ProductCard } from './ProductCard';
import { CardSkeleton } from '../common';
import { Button, EmptyState, ErrorState } from '../ui';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { settingChoice, settingNumber } from '../../lib/settings';
import { plainText } from '../../lib/text';

type View = 'grid' | 'list';

const VIEWS = ['grid', 'list'] as const;
const FILTER_POSITIONS = ['sidebar', 'drawer'] as const;
const VIEW_STORAGE_KEY = 'wishah-studio:catalog-view';
const WITH_FILTERS_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';

interface BrandEntity {
  name: string;
  logo?: string;
  banner?: string | null;
  description?: string;
}

function readStoredView(): View | null {
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === 'grid' || stored === 'list' ? stored : null;
  } catch {
    return null;
  }
}

function storeView(view: View) {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
}

/** Reports a loaded page to the store's analytics, as the engine's own list page does. */
function reportProductsFetched(
  list: { items: Product[]; next: string | null },
  source: ProductListLoaderData['source']
) {
  whenSallaReady((sdk) =>
    sdk.event.dispatch('salla-products-list::products.fetched', {
      data: list.items,
      cursor: { next: list.next },
      nextPage: list.next,
      source: source.type,
      sourceValue: source.value,
    })
  );
}

function ListingHero({
  title,
  description,
  image,
  logo,
}: {
  title: string;
  description?: string;
  image?: string | null;
  logo?: string;
}) {
  return (
    <header className={cn('at-listing-hero', image && 'at-listing-hero--image')}>
      {image && (
        <Image
          className="at-listing-hero__img"
          src={image}
          alt=""
          width={1280}
          srcSetWidths={[640, 1080, 1600]}
          sizes="100vw"
          priority
        />
      )}
      <div className="at-listing-hero__copy">
        {logo && <Image src={logo} alt="" width={120} height={64} objectFit="contain" />}
        <h1 id="page-main-title">{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </header>
  );
}

/**
 * Every product list: category, brand, tag, search, offers and order-again.
 * Fork of the engine's `ProductListPage` (see FORKS.md): same data flow,
 * filters, sorting, infinite scroll and hook slots, with the theme's header,
 * toolbar, grid/list views and states.
 */
export function ProductListPage({
  page,
  source,
  query,
  products,
  pagination,
  filters,
}: ProductListLoaderData) {
  const { t } = useTranslation();
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useThemeSettings();

  const defaultView = settingChoice(settings.catalog_default_view, VIEWS, 'grid');
  const [view, setView] = useState<View>(defaultView);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPosition = settingChoice(
    settings.catalog_filters_position,
    FILTER_POSITIONS,
    'sidebar'
  );
  const columns = settingNumber(settings.catalog_columns, 4, { min: 2, max: 5 });

  const showFilters = Boolean(query.filters && store?.settings?.product?.filters);
  const inSidebar = showFilters && filterPosition === 'sidebar';
  const isReorder = source.type === 'reorder';
  useReorderButtons(isReorder);

  // Read after mount: the server cannot know the visitor's stored choice.
  useEffect(() => {
    const stored = readStoredView();
    if (stored) setView(stored);
  }, []);

  useEffect(() => onSallaEvent('salla-filters::changed', () => setFiltersOpen(false)), []);

  const selectedSort = query.sort;
  const sortIds = availableSortIds(source.type, store?.settings?.product?.sort_options);
  const sorts = useMemo(() => sortOptions(selectedSort, t, sortIds), [selectedSort, t, sortIds]);
  const shownSort = sorts.some((option) => option.is_selected) ? selectedSort : '';

  const onSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(location.searchStr);
      params.set('sort', event.target.value);
      params.delete('page');
      navigate(`${location.pathname}?${params.toString()}`);
    },
    [navigate, location.pathname, location.searchStr]
  );

  const {
    filters: appliedFilters,
    page: filteredPage,
    lastPage,
    status: filterStatus,
    retry: retryFilters,
  } = useAppliedFilters(source, selectedSort, showFilters);

  const shownPage = filterStatus === 'ready' ? filteredPage : lastPage;
  const shownProducts =
    filterStatus === 'error'
      ? []
      : filterStatus === 'idle'
        ? products
        : (shownPage?.items ?? products);
  const shownNext =
    filterStatus === 'idle'
      ? pagination?.next
      : filterStatus === 'ready'
        ? filteredPage?.next
        : null;

  const nextCursorRef = useRef<string | null>(shownNext ?? null);
  useEffect(() => {
    nextCursorRef.current = shownNext ?? null;
  }, [shownNext]);

  const loader = useCallback(async () => {
    const { cursor, page: nextPage } = parseNextPageToken(nextCursorRef.current);
    const result = await productApi.list({
      source: source.type,
      sourceValue: source.value,
      ...(cursor && { cursor }),
      ...(nextPage !== undefined && { page: nextPage }),
      sort: selectedSort,
      ...(appliedFilters && { filterable: true, filters: appliedFilters }),
    });
    nextCursorRef.current = result.next;
    reportProductsFetched(result, source);
    return result;
  }, [source, selectedSort, appliedFilters]);

  const chooseView = (next: View) => {
    setView(next);
    storeView(next);
  };

  const listKey = source.value ?? source.type;
  const filteredKey =
    filterStatus === 'idle'
      ? ''
      : `-${filterStatus}${filterStatus === 'ready' ? JSON.stringify(appliedFilters) : ''}`;
  const itemsKey = `${listKey}-${selectedSort}${filteredKey}`;

  const isBrand = source.type === 'brands';
  const isSearch = source.type === 'search';
  const brand = isBrand ? (source.entity as BrandEntity | undefined) : undefined;
  const category =
    source.type === 'categories' ? (source.entity as Category | undefined) : undefined;
  const heroImage = brand?.banner ?? category?.image;
  const heroText = plainText(brand?.description ?? category?.description);

  return (
    <div key={listKey} data-source={isReorder ? 'reorder' : undefined}>
      <div className="at-container">
        {settings.product_index_show_breadcrumbs !== false && (
          <Suspense fallback={<div className="at-breadcrumb-space" />}>
            <Breadcrumb page={page} />
          </Suspense>
        )}
        <ListingHero
          title={brand?.name ?? page.title}
          description={heroText}
          image={heroImage}
          logo={brand?.logo}
        />
      </div>

      <div className="at-container at-listing">
        <HookSlot name="product:list.start" />

        <div className="at-toolbar">
          <div className="at-toolbar__group">
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                icon="sicon-filter"
                className={cn(inSidebar && 'at-toolbar__filters--mobile')}
                onClick={() => setFiltersOpen(true)}
              >
                {t('theme.catalog.filters', 'Filters')}
              </Button>
            )}
          </div>
          <div className="at-toolbar__group">
            {sorts.length > 0 && (
              <label className="at-toolbar__sort">
                <span>{t('theme.catalog.sort_by', 'Sort by')}</span>
                <select
                  className="at-select"
                  aria-label={t('theme.catalog.sort_by', 'Sort by')}
                  value={shownSort}
                  onChange={onSortChange}
                >
                  {shownSort === '' && (
                    <option value="" disabled hidden>
                      {t('theme.catalog.sort_by', 'Sort by')}
                    </option>
                  )}
                  {sorts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div
              className="at-toolbar__views"
              role="group"
              aria-label={t('theme.catalog.view', 'View')}
            >
              <button
                type="button"
                className={cn('at-icon-btn', view === 'grid' && 'is-active')}
                aria-label={t('theme.catalog.grid_view', 'Grid view')}
                aria-pressed={view === 'grid'}
                onClick={() => chooseView('grid')}
              >
                <i className="sicon-grid" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn('at-icon-btn', view === 'list' && 'is-active')}
                aria-label={t('theme.catalog.list_view', 'List view')}
                aria-pressed={view === 'list'}
                onClick={() => chooseView('list')}
              >
                <i className="sicon-list" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className={cn('at-listing__layout', inSidebar && 'at-listing__layout--sidebar')}>
          {inSidebar && (
            <aside className="at-listing__filters">
              <SallaFilters id="filters-menu" filters={filters as never} />
            </aside>
          )}

          <div
            className="at-listing__results"
            style={
              { '--columns': inSidebar ? Math.min(columns, 3) : columns } as React.CSSProperties
            }
          >
            <HookSlot name="product:list.items.start" />
            <div
              className={cn(filterStatus === 'loading' && 'at-listing__dim')}
              aria-busy={filterStatus === 'loading'}
            >
              {filterStatus === 'error' ? (
                <ErrorState onRetry={retryFilters} />
              ) : (
                <ItemsList<Product>
                  key={itemsKey}
                  resetKey={itemsKey}
                  items={shownProducts}
                  loader={loader}
                  mode={shownNext ? 'infinite' : 'static'}
                  pageUrl={location.pathname + location.searchStr}
                  className="at-listing__list"
                  itemsClassName={cn('at-grid', view === 'list' && 'at-grid--list')}
                  skeleton={<CardSkeleton />}
                  skeletonType="item"
                  skeletonCount={8}
                  empty={
                    <EmptyState
                      icon={isSearch ? 'sicon-search' : 'sicon-shopping-bag'}
                      title={
                        isSearch
                          ? t('theme.catalog.no_results', 'No results found')
                          : t('theme.catalog.no_products', 'No products here yet')
                      }
                      body={
                        isSearch
                          ? t(
                              'theme.catalog.no_results_hint',
                              'Check the spelling or try a broader word.'
                            )
                          : t(
                              'theme.catalog.no_products_hint',
                              'New products will appear here once added.'
                            )
                      }
                      action={
                        <Button href="/" variant="outline" size="sm">
                          {t('theme.actions.back_home', 'Back to home')}
                        </Button>
                      }
                    />
                  }
                  t={(key, fallback) => t(key, fallback || key)}
                >
                  {(items) =>
                    items.map((item, index) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        index={index}
                        layout={view === 'list' ? 'horizontal' : 'vertical'}
                        imagePriority={index < 2}
                        sizes={inSidebar ? WITH_FILTERS_SIZES : undefined}
                      />
                    ))
                  }
                </ItemsList>
              )}
            </div>
            <HookSlot name="product:list.items.end" />
          </div>
        </div>

        {showFilters && (
          <Drawer
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            size="md"
            className="at-drawer"
          >
            <div className="at-drawer__head">
              <span className="at-icon-btn" aria-hidden="true" />
              <span className="at-drawer__title">{t('theme.catalog.filters', 'Filters')}</span>
              <button
                type="button"
                className="at-icon-btn"
                aria-label={t('theme.actions.close', 'Close')}
                onClick={() => setFiltersOpen(false)}
              >
                <i className="sicon-cancel" aria-hidden="true" />
              </button>
            </div>
            <div className="at-drawer__body at-drawer__body--padded">
              <SallaFilters id="filters-menu-mobile" filters={filters as never} />
            </div>
          </Drawer>
        )}

        {source.type === 'categories' && store?.settings?.category?.testimonial_enabled && (
          <RenderWhenVisible placeholder={<ReviewItemSkeleton />}>
            <Testimonials data={{}} />
          </RenderWhenVisible>
        )}

        <HookSlot name="product:list.end" />
      </div>
    </div>
  );
}
