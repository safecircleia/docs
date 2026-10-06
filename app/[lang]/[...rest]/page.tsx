import { notFound } from 'next/navigation';

// Any URL under /en or /es that no other route claims renders the in-shell 404.
export default function CatchAll() {
  notFound();
}
