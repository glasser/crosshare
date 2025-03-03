import NextErrorComponent, { ErrorProps } from 'next/error';
import { NextPageContext } from 'next';
import * as Sentry from '@sentry/node';

import { ErrorPage } from '../components/ErrorPage';
import { ContactLinks } from '../components/ContactLinks';

const LocalStorageErrorPage = () => (
  <ErrorPage title="Couldn't Store Data">
    <p>
      Crosshare needs permission to store data in your browser to keep track of
      your solve progress on puzzles. Please grant access in your browsers
      settings (e.g. in settings/cookies for Chrome).
    </p>
    <p>
      If you&apos;re having trouble figuring this out please get in touch via{' '}
      <ContactLinks />
    </p>
  </ErrorPage>
);

const isLocalStorageError = (err: Error): boolean => {
  return err.message.includes('Failed to read the \'localStorage\' property');
};

const MyError = ({
  title,
  statusCode,
  hasGetInitialPropsRun,
  err,
}: {
  title?: string;
  err: Error;
  statusCode: number;
  hasGetInitialPropsRun: boolean;
}) => {
  if (isLocalStorageError(err)) {
    return <LocalStorageErrorPage />;
  }
  if (!hasGetInitialPropsRun && err && typeof Sentry !== 'undefined') {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err);
  }

  return (
    <ErrorPage title="Something Went Wrong">
      <p>
        Sorry! An error with Crosshare occurred - you can get in touch for help
        via <ContactLinks />.
      </p>
      <p>
        {statusCode} {title}
      </p>
    </ErrorPage>
  );
};

MyError.getInitialProps = async ({ res, err, asPath }: NextPageContext) => {
  const errorInitialProps: ErrorProps = await NextErrorComponent.getInitialProps(
    { res, err } as NextPageContext
  );

  // Running on the server, the response object (`res`) is available.
  //
  // Next.js will pass an err on the server if a page's data fetching methods
  // threw or returned a Promise that rejected
  //
  // Running on the client (browser), Next.js will provide an err if:
  //
  //  - a page's `getInitialProps` threw or returned a Promise that rejected
  //  - an exception was thrown somewhere in the React lifecycle (render,
  //    componentDidMount, etc) that was caught by Next.js's React Error
  //    Boundary. Read more about what types of exceptions are caught by Error
  //    Boundaries: https://reactjs.org/docs/error-boundaries.html

  if (res?.statusCode === 404) {
    return { statusCode: 404 };
  }
  if (err && typeof Sentry !== 'undefined') {
    if (!isLocalStorageError(err)) {
      Sentry.captureException(err);
    }
    return { ...errorInitialProps, hasGetInitialPropsRun: true };
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(
      new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
    );
  }

  return { ...errorInitialProps, hasGetInitialPropsRun: true };
};

export default MyError;
