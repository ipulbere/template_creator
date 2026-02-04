import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#020617', 
      color: '#fff', 
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '1rem' }}>
        FACTORY.AI
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Website & Asset Generation Engine</p>
      <Link href="/dashboard" style={{ 
        backgroundColor: '#2563eb', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '9999px', 
        fontWeight: 'bold', 
        textDecoration: 'none' 
      }}>
        Open Dashboard
      </Link>
    </div>
  );
}
