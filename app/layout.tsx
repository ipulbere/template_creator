import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950 text-white">
      <body className="antialiased">{children}</body>
    </html>
  )
}
