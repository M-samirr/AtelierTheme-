# Engine forks

Theme components that are copies of engine components, changed for Atelier. The engine does not
update them, so each upgrade of `@salla.sa/twilight-theme-engine` can leave them behind. This file
records where each one came from.

**Base** is the engine version in the repo when the fork was last edited.

| Fork (`app/components/…`)                               | Engine source (`tailwind/…` in the engine)   | Wired in by                                        | Base    | What the fork changes                                                                                                                                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `product/ProductListPage.tsx`                           | `routes/product-listing/ProductListPage.tsx` | `registry` `product:list-page` in `app/router.tsx` | 1.0.160 | Same data flow, filters, sort, infinite scroll and hook slots; the theme's hero with category/brand image, toolbar, grid and list views, filter position setting, empty and error states; brand and category text is shown as plain text |
| `product/ProductPage.tsx`                               | `routes/product/ProductPage.tsx`             | `app/routes/$slug.p$id.tsx` (route taken over)     | 1.0.160 | Same data and hook slots, the engine's `AddToCartForm` unchanged; the theme's gallery, summary and information panels; related products use `ProductShelf`; the store testimonials band is dropped                                       |
| `product/ProductSummary.tsx`, `product/ProductInfo.tsx` | `components/product/ProductDetails.tsx`      | `ProductPage`                                      | 1.0.160 | Split in two: the description, SKU, barcode and tags move below the buy button, as tabs or an accordion                                                                                                                                  |
| `product/ProductGallery.tsx`                            | `components/product/ProductGallery.tsx`      | `ProductPage`                                      | 1.0.160 | Scroll-snap track instead of `salla-slider`; plays videos in place; same `product-options::change` image matching                                                                                                                        |

Current engine: **1.0.160**.

## Rules

- Fork only when a hook slot, the `registry` (`product:card`, `product:gallery`, `product:list-page`,
  `product:list-skeleton`, `account:layout-pending`, `home:*`) or `app/routes.ts` cannot do the job.
  Every fork is code maintained by hand.
- Add a row here and say at the top of the file's doc comment what differs from the engine.
- On an engine upgrade, diff each fork's source between **Base** and the new version:

```bash
for v in 1.0.160 1.0.170; do
  mkdir -p engine-$v && tar -xzf "$(npm pack @salla.sa/twilight-theme-engine@$v --silent)" -C engine-$v
done
diff -u engine-1.0.160/package/tailwind/routes/cart/CartPage.tsx.txt \
  engine-1.0.170/package/tailwind/routes/cart/CartPage.tsx.txt
```

Then port what applies and set **Base** to the new version.
