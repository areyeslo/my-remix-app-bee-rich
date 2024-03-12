import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';

import { H1 } from './components/headings';
import { ButtonLink } from './components/links';
import { PageTransitionProgressBar } from './components/progress';
import tailwindCSS from './styles/tailwind.css';

export const meta: MetaFunction = () => {
  return [{ title: 'BeeRich' }];
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: tailwindCSS }];

// ErrorBoundary component is part of Remix's route API and replaces the route module component in case of an error.
// An error boundary is rendered if an error occurs within the loader or action function of the route module.
// We cannot call the useLoaderData hook. Loader data is not defined when the ErrorBoundary component is rendered.
export function ErrorBoundary() {
  const error = useRouteError();
  let heading = 'Unexpected Error';
  let message =
    'We are very sorry. An unexpected error occurred. Please try again or contact us if the problem persists.';
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        heading = '401 Unauthorized';
        message = 'Oops! Looks like you tried to visit a page that you do not have access to.';
        break;
      case 404:
        heading = '404 Not Found';
        message = 'Oops! Looks like you tried to visit a page that does not exist.';
        break;
    }
  }

  let errorMessage = error instanceof Error ? error.message : null;

  return (
    //By using the custom Document component, error boundary includes the application's scripts, stylesheets and custom
    //html and head elements.
    <Document>
      <H1>{heading}</H1>
      <p>{message}</p>
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
