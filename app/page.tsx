import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1>Website Factory AI</h1>
      <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
        Go to Dashboard
      </Link>
    </div>
  );
}
