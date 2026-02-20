import Link from 'next/link';

const Header = () => {
  return (
  <header className="bg-gray-900 text-gray-200 shadow-lg border-b border-gray-800">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <div className="text-lg font-semibold tracking-wide">
        AWS Portal
      </div>

      <nav className="flex gap-8">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>

        <Link href="/resources" className="hover:text-white transition-colors">
          Resources
        </Link>

        <Link href="/s3" className="hover:text-white transition-colors">
          S3
        </Link>
      </nav>
    </div>
  </header>
);

};

export default Header;