import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useNavigation } from '@remix-run/react';

import { Button } from '~/components/buttons';
import { Card } from '~/components/containers';
import { Form, Input } from '~/components/forms';
import { H1 } from '~/components/headings';
import { InlineError } from '~/components/texts';
import { createUserSession, getUserId, loginUser } from '~/modules/session/session.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  if (!email || !password) {
    return json({ error: 'Please fill out all fields.' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw Error('Invalid form data.');
  }

  try {
    const user = await loginUser({ email, password });
    console.log(`user: ${JSON.stringify(user)}`);
    return redirect('/dashboard', { headers: await createUserSession(user) });
  } catch (error: any) {
    return json({ error: error?.message || 'Something went wrong.' });
  }
}

// If a session cookie is appended to the request and userId exists,
// then we can be sure that the user has already been authenticated.
// In this case, we redirect to the dashboard. Otherwise, we show the
// login or signup page.
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/dashboard');
  }
  return {};
}

export default function Component() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle' && navigation.formAction === '/login';
  const actionData = useActionData<typeof action>();
  return (
    <Card>
      <Form method="POST" action="/login">
        <H1>Log In</H1>
        <Input label="Email:" name="email" type="email" required />
        <Input label="Password:" name="password" type="password" required />
        <Button disabled={isSubmitting} type="submit" isPrimary>
          {isSubmitting ? 'Logging you in...' : 'Log In!'}
        </Button>
        <InlineError aria-live="assertive">{actionData?.error && actionData.error}</InlineError>
      </Form>
    </Card>
  );
}
