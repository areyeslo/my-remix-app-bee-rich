import { json } from '@remix-run/node';
import { Link as RemixLink, Outlet, useLoaderData, useLocation } from '@remix-run/react';

import { Container } from '~/components/containers';
import { NavLink } from '~/components/links';
import { db } from '~/modules/db.server';

export async function loader() {
  const firstExpenseQuery = db.expense.findFirst({ orderBy: { createdAt: 'desc' } });
  const firstInvoiceQuery = db.invoice.findFirst({ orderBy: { createdAt: 'desc' } });

  const [firstExpense, firstInvoice] = await Promise.all([firstExpenseQuery, firstInvoiceQuery]);
  return json({ firstExpense, firstInvoice });
}

export default function Component() {
  const { firstExpense, firstInvoice } = useLoaderData<typeof loader>();

  //Remix's useLocation hook lets us access a global location object with information
  //about the current URL.
  const location = useLocation();

  return (
    <>
      <header>
        <Container className="p-4 mb-10">
          <nav>
            <ul className="w-full flex flex-row gap-5 font-bold               text-lg lg:text-2xl">
              <li>
                <RemixLink to="/">BeeRich</RemixLink>
              </li>
              <li className="ml-auto">
                <RemixLink to="/404">Log out</RemixLink>
              </li>
            </ul>
            <ul className="mt-10 w-full flex flex-row gap-5">
              <li className="ml-auto">
                {/* If prefetch is set to intent, then Remix starts prefetching once the user focuses or 
                hovers over the link */}
                <NavLink
                  to={firstInvoice ? `/dashboard/income/${firstInvoice.id}` : '/dashboard/income'}
                  prefetch="intent"
                  styleAsActive={location.pathname.startsWith('/dashboard/income')}
                >
                  Income
                </NavLink>
              </li>
              <li className="mr-auto">
                <NavLink
                  to={firstExpense ? `/dashboard/expenses/${firstExpense.id}` : '/dashboard/expenses'}
                  prefetch="intent"
                  styleAsActive={location.pathname.startsWith('/dashboard/expenses')}
                >
                  Expenses
                </NavLink>
              </li>
            </ul>
          </nav>
        </Container>
      </header>
      <main className="p-4 w-full flex justify-center items-center">
        <Outlet />
      </main>
    </>
  );
}
