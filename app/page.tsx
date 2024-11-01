import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Link
        href="/gosi"
        className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-base h-12 px-8"
      >
        고시텔 목록 보러 가기
      </Link>
    </div>
  );
}
