import React from 'react';
import { createRoot } from 'react-dom/client';
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { App } from './site';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Solutions } from './pages/Solutions';
import { Pricing } from './pages/Pricing';
import { Help } from './pages/Help';
import { Contact } from './pages/Contact';
import { Policies } from './pages/Policies';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { Login } from './pages/Login';
import { FreeOnboarding } from './pages/FreeOnboarding';
import { Organizations } from './pages/Organizations';
import { StandardUpgrade } from './pages/StandardUpgrade';
import { InvestorPlatform } from './pages/InvestorPlatform';
import { IssuerWorkspace } from './pages/IssuerWorkspace';
import './utilities.css';
import './styles.scss';
import './issuer.scss';

const rootRoute = createRootRoute({ component: App });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const featuresRoute = createRoute({ getParentRoute: () => rootRoute, path: '/features', component: Features });
const solutionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/solutions', component: Solutions });
const pricingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pricing', component: Pricing });
const helpRoute = createRoute({ getParentRoute: () => rootRoute, path: '/help', component: Help });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contact', component: Contact });
const policiesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/policies', component: Policies });
const policyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/policies/$policy', component: Policies });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: Register });
const verifyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/verify-email', component: VerifyEmail });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login });
const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/free-onboarding', component: FreeOnboarding });
const organizationsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/organizations', component: Organizations });
const upgradeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/standard-upgrade', component: StandardUpgrade });
const investorPlatformRoute = createRoute({ getParentRoute: () => rootRoute, path: '/investor-platform', component: InvestorPlatform });
const issuerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer', component: IssuerWorkspace });
const issuerNavigationShellRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/$section', component: IssuerWorkspace });
const issuerAssetsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/assets', component: IssuerWorkspace });
const issuerAssetNewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/assets/new', component: IssuerWorkspace });
const issuerAssetDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/assets/$assetId', component: IssuerWorkspace });
const issuerAssetEditRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/assets/$assetId/edit', component: IssuerWorkspace });
const issuerInstrumentsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/instruments', component: IssuerWorkspace });
const issuerInstrumentNewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/instruments/new', component: IssuerWorkspace });
const issuerInstrumentDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/instruments/$instrumentId', component: IssuerWorkspace });
const issuerInstrumentEditRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/instruments/$instrumentId/edit', component: IssuerWorkspace });
const issuerProjectNewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/projects/new', component: IssuerWorkspace });
const issuerProjectDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/projects/$projectId', component: IssuerWorkspace });
const issuerProjectEditRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/projects/$projectId/edit', component: IssuerWorkspace });
const issuerOfferingNewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/offerings/new', component: IssuerWorkspace });
const issuerOfferingDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/offerings/$offeringId', component: IssuerWorkspace });
const issuerOfferingEditRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/offerings/$offeringId/edit', component: IssuerWorkspace });
const issuerCheckRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/issuance-check', component: IssuerWorkspace });
const issuerSettingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/settings', component: IssuerWorkspace });
const issuerProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/profile', component: IssuerWorkspace });
const issuerSubscriptionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/subscription', component: IssuerWorkspace });
const issuerUpgradeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/upgrade', component: IssuerWorkspace });
const issuerKybRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/kyb', component: IssuerWorkspace });
const issuerKybReviewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/kyb-review', component: IssuerWorkspace });
const issuerContractRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/contract', component: IssuerWorkspace });
const issuerPaymentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/payment', component: IssuerWorkspace });
const issuerBillingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/issuer/billing', component: IssuerWorkspace });
const routeTree = rootRoute.addChildren([homeRoute, featuresRoute, solutionsRoute, pricingRoute, investorPlatformRoute, helpRoute, contactRoute, policiesRoute, policyRoute, registerRoute, verifyRoute, loginRoute, onboardingRoute, organizationsRoute, upgradeRoute, issuerRoute, issuerNavigationShellRoute, issuerAssetsRoute, issuerAssetNewRoute, issuerAssetDetailRoute, issuerAssetEditRoute, issuerInstrumentsRoute, issuerInstrumentNewRoute, issuerInstrumentDetailRoute, issuerInstrumentEditRoute, issuerProjectNewRoute, issuerProjectDetailRoute, issuerProjectEditRoute, issuerOfferingNewRoute, issuerOfferingDetailRoute, issuerOfferingEditRoute, issuerCheckRoute, issuerSettingsRoute, issuerProfileRoute, issuerSubscriptionRoute, issuerUpgradeRoute, issuerKybRoute, issuerKybReviewRoute, issuerContractRoute, issuerPaymentRoute, issuerBillingRoute]);
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
