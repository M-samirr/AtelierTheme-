import { createFileRoute } from '@tanstack/react-router';
import { Product } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductPage, ProductPageSkeleton } from '../components/product/ProductPage';

/** The engine's loader and head (title, Open Graph, JSON-LD) with the theme's page. */
export const Route = createFileRoute('/{-$locale}/$slug/p{$id}')({
  loader: ({ params }): Promise<ProductPageProps> =>
    Product.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(Product),
  pendingComponent: () => <ProductPageSkeleton />,
  component: ProductComponent,
});

function ProductComponent() {
  const data: ProductPageProps = Route.useLoaderData();
  // Keyed so gallery position and option state start fresh on product-to-product navigation.
  return <ProductPage key={data.product.id} {...data} />;
}
