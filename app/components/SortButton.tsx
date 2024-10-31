// app/gosi/SortButton.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function SortButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSortedByViews = searchParams?.get('sortBy') === 'views';

  const handleClick = () => {
    const url = isSortedByViews ? '/gosi' : '/gosi?sortBy=views';
    router.push(url);
  };

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
      {isSortedByViews ? '원본' : '조회 수 순으로 정렬하기'}
    </button>
  );
}
