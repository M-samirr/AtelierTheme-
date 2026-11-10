/** What the engine passes to every home block: the merchant's fields plus its position. */
export interface HomeBlockProps {
  data: {
    position?: number;
    /** True for the first blocks of the page, which render with it. */
    priority?: boolean;
    [key: string]: unknown;
  };
}
