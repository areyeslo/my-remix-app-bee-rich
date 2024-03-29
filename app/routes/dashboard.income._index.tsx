import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { Button } from '~/components/buttons';
import { Form, Input, Textarea } from '~/components/forms';
import { db } from '~/modules/db.server';
import { requireUserId } from '~/modules/session/session.server';

//Loaders handle HTTP GET requests, while action functions receive all other incoming
//HTTP requests.
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
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

  const income = await db.invoice.create({
    data: { title, description, amount: amountNumber, currencyCode: 'USD', user: { connect: { id: userId } } },
  });
  return redirect(`/dashboard/income/${income.id}`);
}

export default function Component() {
  return (
    //The ?index search parameter tells Remix to submit to the index route module, not
    //the parent module.
    <Form method="post" action="/dashboard/income/?index">
      <Input label="Title:" type="text" name="title" placeholder="Dividend received" required />
      <Textarea label="Description:" name="description" />
      <Input label="Amount (in USD):" type="number" defaultValue={0} name="amount" required />
      <Button type="submit" isPrimary>
        Create
      </Button>
    </Form>
  );
}
