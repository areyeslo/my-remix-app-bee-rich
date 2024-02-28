import { Outlet } from '@remix-run/react';

import { H1 } from '~/components/headings';

export default function Component() {
  return (
    <div className="w-full">
      <H1>Your Income</H1>
      <div className="mt-10 w-full flex flex-col-reverse lg:flex-row">
        <section className="lg:p-8 w-full lg:max-w-2xl">
          <h2 className="sr-only">Total income</h2>
          <ul className="flex flex-col">
            <li>
              <a href="/dashboard/income/1">
                <p className="text-xl font-semibold">Salary</p> <p>$100</p>
              </a>
            </li>
            <li>
              <a href="/dashboard/income/2">
                <p className="text-xl font-semibold">Shares</p> <p>$100</p>
              </a>
            </li>
            <li>
              <a href="/dashboard/income/3">
                <p className="text-xl font-semibold">Monthly allowance </p> <p>$100</p>
              </a>
            </li>
          </ul>
        </section>
        <Outlet />
      </div>
    </div>
  );
}
