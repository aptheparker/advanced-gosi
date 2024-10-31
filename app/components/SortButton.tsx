// app/gosi/SortButton.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function SortButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSortBy = searchParams?.get('sortBy') || '';

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = event.target.value;
    let url = '/gosi';

    if (sortBy) {
      url += `?sortBy=${sortBy}`;
    }

    router.push(url);
  };

  return (
    <select
      value={currentSortBy}
      onChange={handleSortChange}
      style={{
        padding: '8px 16px',
        margin: '20px 0',
        backgroundColor: '#4CAF50',
        color: 'white',
        textAlign: 'center',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      <option value="views">조회 수 순으로 정렬하기</option>
      <option value="parsedPrice">가격 순으로 정렬하기</option>
      <option value="">원본</option>
    </select>
  );
}
