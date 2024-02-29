import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigation } from '@remix-run/react';
import clsx from 'clsx';

import { H1 } from '~/components/headings';
import { ListLinkItem } from '~/components/links';
import { db } from '~/modules/db.server';

export async function loader() {
  const invoice = await db.invoice.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`income retrieved: ${invoice}`);
  return json(invoice);
}

export default function Component() {
  const navigation = useNavigation();
  console.log(navigation.state);

  const invoices = useLoaderData<typeof loader>();

  return (
    <div className="w-full">
      <H1>Your Income</H1>
      <div className="mt-10 w-full flex flex-col-reverse lg:flex-row">
        <section className="lg:p-8 w-full lg:max-w-2xl">
          <h2 className="sr-only">Total income</h2>
          <ul className="flex flex-col">
            {invoices.map((invoice) => (
              <ListLinkItem key={invoice.id} to={`/dashboard/income/${invoice.id}`}>
                <p>
                  <i>{new Date(invoice.createdAt).toLocaleDateString('en-US')}</i>
                </p>
                <p className="text-x1 font-semibold">{invoice.description}</p>
                <p>
                  <b>
                    {Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currencyCode }).format(
                      invoice.amount
                    )}
                  </b>
                </p>
              </ListLinkItem>
            ))}
          </ul>
        </section>
        <section className={clsx('lg:p-8 w-full', navigation.state === 'loading' && 'motion-safe:animate-pulse')}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
