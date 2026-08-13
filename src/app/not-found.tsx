import Link from 'next/link';
import { EmptyState } from '@/components/UI';

export default function NotFound() {
  return <div className="page-shell"><EmptyState title="That route left the circuit" message="The page does not exist or the record was removed." action={<Link className="button" href="/">Return to live race</Link>} /></div>;
}
