import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Outlet, useLoaderData, useLocation, useNavigation, useParams, useSearchParams } from '@remix-run/react';
import clsx from 'clsx';

import { Input } from '~/components/forms';
import { H1 } from '~/components/headings';
import { ListLinkItem } from '~/components/links';
import { db } from '~/modules/db.server';

//loader functions are Remix's HTTP GET request handlers and work with request and response objects
//that follow the Fetch API's Request-Response interface.
//Remix's loader functions are executed only on the server and must return a Response object.

//Best Practice: In Remix, we aim to fetch data in route modules instead of components. Avoid granular data
//fetching at the component level to optimize data loading and prevent fetch waterfalls.

//Remix refreshes all loader data by re-fetching from all active loader functions after
//executing an action function, just like a full-page reload would do on a HTML form
//submission.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchString = url.searchParams.get('q');

  const expenses = await db.expense.findMany({
    orderBy: { createdAt: 'desc' },
    where: { title: { contains: searchString ? searchString : '' } },
  });
  console.log(`expenses retrieved: ${expenses}`);
  return json(expenses);
}

export default function Component() {
  const navigation = useNavigation();
  const location = useLocation();
  console.log(navigation.state);

  //Use the useLoaderData hook to access the loader data of the same route module.
  //Remix executes loader functions first and then renders the React application on the server.
  //useLoaderData returns the data of the route module that the hook is called in.
  const expenses = useLoaderData<typeof loader>();

  // The advantage of search parameters over React state is that they can be accessed on
  // server by reading from the request  URL. Search parameters persist on full-page reoloads
  // nand work with the browser's back and forward buttons.
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  console.log(`searchQuery: ${searchQuery}`);

  //useParam hook to access the id route parameter of the expense details page.
  const { id } = useParams();

  return (
    <div className="w-full">
      <H1>Your expenses</H1>
      <div className="mt-10 w-full flex flex-col-reverse lg:flex-row">
        <section className="lg:p-8 w-full lg:max-w-2xl">
          <h2 className="sr-only">All expenses</h2>
          {/* include action to point to the current URL path */}
          <Form method="GET" action={location.pathname}>
            <Input name="q" type="search" label="Search by title" defaultValue={searchQuery} />
          </Form>
          <ul className="flex flex-col">
            {expenses.map((expense) => (
              <ListLinkItem
                key={expense.id}
                to={`/dashboard/expenses/${expense.id}`}
                isActive={expense.id === id}
                deleteProps={{
                  ariaLabel: `Delete expense ${expense.title}`,
                  action: `/dashboard/expenses/${expense.id}`,
                }}
              >
                <p>
                  <i>{new Date(expense.createdAt).toLocaleDateString('en-US')}</i>
                </p>
                <p className="text-x1 font-semibold">{expense.title}</p>
                <p>
                  <b>
                    {Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currencyCode }).format(
                      expense.amount,
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
