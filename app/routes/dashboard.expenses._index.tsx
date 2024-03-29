import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useNavigation } from '@remix-run/react';

import { Button } from '~/components/buttons';
import { Form, Input, Textarea } from '~/components/forms';
import { db } from '~/modules/db.server';
import { requireUserId } from '~/modules/session/session.server';

//We use loader functions to handle HTTP GET requests.
//Remix's action function is called for all other HTTP requests to the route, such as POST requests.
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

  // Prisma connect: You can connect an existing user to a new or existing expense
  // The following connects an existing userId to the new expense.
  // Used to establish relationships between different tables/entities in the database.
  const expense = await db.expense.create({
    data: { title, description, amount: amountNumber, currencyCode: 'USD', user: { connect: { id: userId } } },
  });
  return redirect(`/dashboard/expenses/${expense.id}`);
}

export default function Component() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle' && navigation.formAction === '/dashboard/expenses/?index';
  return (
    //The ?index search parameter tells Remix to submit to the index route module, not
    //the parent module.
    <Form method="post" action="/dashboard/expenses/?index">
      <Input label="Title:" type="text" name="title" placeholder="Dinner for Two" required />
      <Textarea label="Description:" name="description" />
      <Input label="Amount (in USD):" type="number" defaultValue={0} name="amount" required />
      <Button type="submit" disabled={isSubmitting} isPrimary>
        {isSubmitting ? 'Creating...' : 'Create'}
      </Button>
    </Form>
  );
}
