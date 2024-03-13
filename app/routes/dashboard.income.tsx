import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
  useParams,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import clsx from 'clsx';

import { Input } from '~/components/forms';
import { H1 } from '~/components/headings';
import { ListLinkItem } from '~/components/links';
import { db } from '~/modules/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchString = url.searchParams.get('q');

  const invoice = await db.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    where: { title: { contains: searchString ? searchString : '' } },
  });

  return json(invoice);
}

export default function Component() {
  const navigation = useNavigation();
  const location = useLocation();
  console.log(navigation.state);

  const invoices = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { id } = useParams();

  const submit = useSubmit();

  return (
    <div className="w-full">
      <H1>Your Income</H1>
      <div className="mt-10 w-full flex flex-col-reverse lg:flex-row">
        <section className="lg:p-8 w-full lg:max-w-2xl">
          <h2 className="sr-only">Total income</h2>
          <Form method="GET" action={location.pathname}>
            <Input
              name="q"
              type="search"
              label="Search by title"
              defaultValue={searchQuery}
              onChange={(e) => submit(e.target.form)}
            />
          </Form>
          <ul className="flex flex-col">
            {invoices.map((invoice) => (
              <ListLinkItem
                key={invoice.id}
                to={`/dashboard/income/${invoice.id}`}
                isActive={invoice.id === id}
                deleteProps={{
                  ariaLabel: `Delete income ${invoice.title}`,
                  action: `/dashboard/income/${invoice.id}`,
                }}
              >
                <p>
                  <i>{new Date(invoice.createdAt).toLocaleDateString('en-US')}</i>
                </p>
                <p className="text-x1 font-semibold">{invoice.description}</p>
                <p>
                  <b>
                    {Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currencyCode }).format(
                      invoice.amount,
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
