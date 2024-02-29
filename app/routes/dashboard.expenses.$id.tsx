import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { H2 } from '~/components/headings';
import { db } from '~/modules/db.server';

//A loader function runs server-side before its route component is rendered.
//Use to fetch data (on the server) dynamically based on route parameters.
//Remix provides params argument to access the route parameters of the current
//URL.
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) throw new Response('Not found', { status: 404 });
  return json(expense);
}

export default function Component() {
  //Remix's useLoaderData hook provides access to the route module's loader data.
  const expense = useLoaderData<typeof loader>();
  return (
    <div className="w-full h-full p-8">
      <H2>{expense.title}</H2> <p>{expense.amount}</p>
    </div>
  );
}
