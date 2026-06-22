import Image from 'next/image'
import Link from 'next/link'

export default function KampLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="kamp-nav">
        <Link href="/" className="kamp-nav-logo">
          <Image src="/images/logo-finaal.png" alt="Scouts Kriko-M" width={34} height={34} />
          <span>Scouts Kriko-M</span>
        </Link>
        <Link href="/" className="kamp-nav-back">← Website</Link>
      </nav>
      <main>{children}</main>
    </>
  )
}
