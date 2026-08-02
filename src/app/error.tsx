'use client';

import { ErrorState } from '@/components/UI';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page-shell"><ErrorState message={error.message || 'The interface could not be rendered.'} onRetry={reset} /></div>;
}
