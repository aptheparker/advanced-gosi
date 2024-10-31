import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Link
        href="/gosi"
        className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-base h-12 px-8"
      >
        Go to Gosi Listings
      </Link>
    </div>
  );
}
