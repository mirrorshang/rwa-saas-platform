import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { App, PendingPage } from './site';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import './utilities.css';
import './styles.scss';

const rootRoute = createRootRoute({ component: App });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const featuresRoute = createRoute({ getParentRoute: () => rootRoute, path: '/features', component: Features });
const pendingRoutes = [
  '/solutions', '/pricing', '/help', '/contact', '/policies', '/policies/$policy',
  '/register', '/verify-email', '/login', '/free-onboarding', '/organizations', '/standard-upgrade',
].map(path => createRoute({ getParentRoute: () => rootRoute, path, component: PendingPage }));
const routeTree = rootRoute.addChildren([homeRoute, featuresRoute, ...pendingRoutes]);
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
