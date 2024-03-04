import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from '@remix-run/react';

import { H1 } from './components/headings';
import { ButtonLink } from './components/links';
import { PageTransitionProgressBar } from './components/progress';
import tailwindCSS from './styles/tailwind.css';

export const meta: MetaFunction = () => {
  return [{ title: 'BeeRich' }];
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: tailwindCSS }];

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = error instanceof Error ? error.message : null;
  return (
    <Document>
      <H1>Unexpected Error</H1>
      <p>We are very sorry. An unexpected error occurred. Please try again or contact us if the problem persists.</p>
      {errorMessage && (
        <div className="border-4 border-red-500 p-10">
          <p>Error message: {errorMessage}</p>
        </div>
      )}
      <ButtonLink to="/" isPrimary>
        Back to homepage
      </ButtonLink>
    </Document>
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background dark:bg-darkBackground text-lg text-text dark:text-darkText">
        <PageTransitionProgressBar />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function Component() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
