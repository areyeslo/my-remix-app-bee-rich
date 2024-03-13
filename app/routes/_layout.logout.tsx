import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { logout } from '~/modules/session/session.server';

// Since logout mutates the server state (the user session), we use an action unction
// and not a loader function to implement logout.
export function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

// Remix refetches all loader data from all active loader functions after an action function
// executes.
export function loader() {
  return redirect('/login');
}
