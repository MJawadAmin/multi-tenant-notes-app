// components/Navbar.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Logo.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-xl text-gray-800">MT Notes</span>
        </Link>
        <nav className="space-x-6 hidden md:block">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
