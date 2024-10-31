// app/gosi/SortButton.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function SortButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSortBy = searchParams?.get('sortBy');

  const handleClick = () => {
    let url = '/gosi';

    if (currentSortBy === 'views') {
      url += '?sortBy=parsedPrice';
    } else if (currentSortBy === 'parsedPrice') {
      url = '/gosi';
    } else {
      url += '?sortBy=views';
    }

    router.push(url);
  };

  const buttonText =
    currentSortBy === 'views'
      ? '가격 순으로 정렬하기'
      : currentSortBy === 'parsedPrice'
      ? '원본'
      : '조회 수 순으로 정렬하기';

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        margin: '20px 0',
        backgroundColor: '#4CAF50',
        color: 'white',
        textAlign: 'center',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
    >
      {buttonText}
    </button>
  );
}
