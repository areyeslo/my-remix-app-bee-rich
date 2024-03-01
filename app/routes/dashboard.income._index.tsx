import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

import { db } from '~/modules/db.server';

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

  const income = await db.invoice.create({ data: { title, description, amount: amountNumber, currencyCode: 'USD' } });
  return redirect(`/dashboard/income/${income.id}`);
}

export default function Component() {
  return (
    //The ?index search parameter tells Remix to submit to the index route module, not
    //the parent module.
    <Form method="post" action="/dashboard/income/?index">
      <label>Title:</label>
      <input type="text" name="title" placeholder="Monthly Salary" required />
      <label>Description:</label>
      <textarea name="description" />
      <label>Amount (in USD):</label>
      <input type="number" defaultValue={0} name="amount" required />
      <button type="submit">Create</button>
    </Form>
  );
}
