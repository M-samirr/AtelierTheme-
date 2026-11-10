import { bootClient } from '@salla.sa/twilight-theme-engine/boot';
import { whenHeroPainted } from './lib/heroPaint';
import appCssUrl from './styles/app.css?url';

void whenHeroPainted().then(() =>
  bootClient({ stylesheet: appCssUrl, load: () => import('./hydrate') })
);
