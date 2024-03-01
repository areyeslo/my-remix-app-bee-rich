import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

import { db } from '~/modules/db.server';

//We use loader functions to handle HTTP GET requests.
//Remix's action function is called for all other HTTP requests to the route, such as POST requests.
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title');
  const description = formData.get('description');
  const amount = formData.get('amount');

  if (typeof title !== 'string' || typeof description !== 'string' || typeof amount !== 'string') {
    throw Error('something went wrong');
  }

  const amountNumber = Number.parseFloat(amount);
  if (Number.isNaN(amountNumber)) {
    throw Error('something went wrong');
  }

  const expense = await db.expense.create({ data: { title, description, amount: amountNumber, currencyCode: 'USD' } });
  return redirect(`/dashboard/expenses/${expense.id}`);
}

export default function Component() {
  return (
    //The ?index search parameter tells Remix to submit to the index route module, not
    //the parent module.
    <Form method="post" action="/dashboard/expenses/?index">
      <label className="w-full lg:max-w-md">
        Title: <input type="text" name="title" placeholder="Dinner for Two" required />
      </label>
      <label className="w-full lg:max-w-md">
        Description: <textarea name="description" />
      </label>
      <label className="w-full lg:max-w-md">
        Amount (in USD): <input type="number" defaultValue={0} name="amount" required />
      </label>
      <button type="submit">Create</button>
    </Form>
  );
}
