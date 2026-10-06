import Link from 'next/link';

// Outside /en and /es there is no shell or language, so this page brings its own <html>.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#000', color: '#ddd', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0 }}>
        <main style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 500 }}>Page not found</h1>
          <p><Link href="/en/docs" style={{ color: '#7cc7ff' }}>Back to the docs</Link></p>
        </main>
      </body>
    </html>
  );
}
