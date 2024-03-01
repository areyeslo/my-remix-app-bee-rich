import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigation } from '@remix-run/react';
import clsx from 'clsx';

import { H1 } from '~/components/headings';
import { ListLinkItem } from '~/components/links';
import { db } from '~/modules/db.server';

//loader functions are Remix's HTTP GET request handlers and work with request and response objects
//that follow the Fetch API's Request-Response interface.
//Remix's loader functions are executed only on the server and must return a Response object.

//Best Practice: In Remix, we aim to fetch data in route modules instead of components. Avoid granular data
//fetching at the component level to optimize data loading and prevent fetch waterfalls.
export async function loader() {
  const expenses = await db.expense.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`expenses retrieved: ${expenses}`);
  return json(expenses);
}

export default function Component() {
  const navigation = useNavigation();
  console.log(navigation.state);

  //Use the useLoaderData hook to access the loader data of the same route module.
  //Remix executes loader functions first and then renders the React application on the server.
  //useLoaderData returns the data of the route module that the hook is called in.
  const expenses = useLoaderData<typeof loader>();

  return (
    <div className="w-full">
      <H1>Your expenses</H1>
      <div className="mt-10 w-full flex flex-col-reverse lg:flex-row">
        <section className="lg:p-8 w-full lg:max-w-2xl">
          <h2 className="sr-only">All expenses</h2>
          <ul className="flex flex-col">
            {expenses.map((expense) => (
              <ListLinkItem key={expense.id} to={`/dashboard/expenses/${expense.id}`}>
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
