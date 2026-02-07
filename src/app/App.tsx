import { AppRoutes } from './routes';
import { Providers } from './providers';

export function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
