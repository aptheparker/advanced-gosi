/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import SortButton from '../components/SortButton';

interface ListingData {
  number: string;
  title: string;
  location: string;
  area: string;
  roomCount: string;
  totalPrice: string;
  parsedPrice: number;
  date: string;
  views: string;
}

function parsedPrice(price: string): number {
  let totalPrice = 0;
  // Remove any non-numeric prefixes like "실투자" and whitespace
  price = price.replace(/^[^\d]+/, '');

  if (price.includes('억') && price.includes('천') && price.includes('백')) {
    const [billions, thousands] = price.split('억');
    totalPrice += parseInt(billions, 10) * 100000000;
    totalPrice += parseInt(thousands, 10) * 10000000;

    const [_, hundreds] = price.split('천');
    totalPrice += parseInt(hundreds, 10) * 1000000;
  } else if (price.includes('억') && price.includes('천')) {
    const [billions, thousands] = price.split('억');
    totalPrice += parseInt(billions, 10) * 100000000;
    totalPrice += parseInt(thousands, 10) * 10000000;
  } else if (price.includes('억')) {
    // 1억
    const [billions, tenMillions] = price.split('억');
    totalPrice += parseInt(billions, 10) * 100000000;
    if (tenMillions) {
      // 1억1000
      totalPrice += parseInt(tenMillions, 10) * 10000;
    }
  } else if (price.includes('천')) {
    // 2천
    const [tenMillions] = price.split('천');
    totalPrice += parseInt(tenMillions, 10) * 10000000;
  } else {
    totalPrice += parseInt(price, 10) * 10000;
  }

  return totalPrice;
}

// Fetch all data from pages 1 to 50 on the server side
async function fetchAllListings(): Promise<ListingData[]> {
  const pageNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
  const baseUrl = process.env.GOSI_URL;

  if (!baseUrl) {
    throw new Error('The GOSI_URL environment variable is not set.');
  }

  const responses = await Promise.all(
    pageNumbers.map((page) =>
      axios.get(`${baseUrl}?page=${page}`, {
        responseType: 'arraybuffer',
      }),
    ),
  );

  const allListings: ListingData[] = [];

  responses.forEach((response) => {
    const decodedContent = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    const $ = cheerio.load(decodedContent);

    $('table[width="850"] tr')
      .slice(2) // Skip header rows
      .each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length === 9) {
          allListings.push({
            number: $(cells[1]).text().trim(),
            title: $(cells[2]).text().trim(),
            location: $(cells[3]).text().trim(),
            area: $(cells[4]).text().trim(),
            roomCount: $(cells[5]).text().trim(),
            totalPrice: $(cells[6]).text().trim(),
            parsedPrice: parsedPrice($(cells[6]).text().trim()),
            // parsedPrice: parsedPrice('1억1000'),
            date: $(cells[7]).text().trim(),
            views: $(cells[8]).text().trim(),
          });
        }
      });
  });

  return allListings;
}

export default async function GositelsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const allListings = await fetchAllListings();

  // Check for sorting parameter and sort if needed
  if (searchParams?.sortBy === 'views') {
    allListings.sort((a, b) => {
      const viewsA = parseInt(a.views.replace(/\D/g, '') || '0', 10);
      const viewsB = parseInt(b.views.replace(/\D/g, '') || '0', 10);
      return viewsB - viewsA;
    });
  } else if (searchParams?.sortBy === 'parsedPrice') {
    allListings.sort((a, b) => b.parsedPrice - a.parsedPrice);
  }

  // Inline styles for table alignment and readability
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const headerCellStyle: React.CSSProperties = {
    padding: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottom: '1px solid #ccc',
  };

  const cellStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
  };

  return (
    <div>
      <h1>고시원 Listings</h1>
      <SortButton />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>ID</th>
            <th style={headerCellStyle}>번호</th>
            <th style={headerCellStyle}>제목</th>
            <th style={headerCellStyle}>시,구</th>
            <th style={headerCellStyle}>m2(평수)</th>
            <th style={headerCellStyle}>룸갯수</th>
            <th style={headerCellStyle}>매물가총액</th>
            <th style={headerCellStyle}>수정된 매물가</th>
            <th style={headerCellStyle}>작성일</th>
            <th style={headerCellStyle}>조회</th>
          </tr>
        </thead>
        <tbody>
          {allListings.map((listing, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index + 1}</td>
              <td style={cellStyle}>{listing.number}</td>
              <td style={cellStyle}>{listing.title}</td>
              <td style={cellStyle}>{listing.location}</td>
              <td style={cellStyle}>{listing.area}</td>
              <td style={cellStyle}>{listing.roomCount}</td>
              <td style={cellStyle}>{listing.totalPrice}</td>
              <td style={cellStyle}>{listing.parsedPrice}</td>
              <td style={cellStyle}>{listing.date}</td>
              <td style={cellStyle}>{listing.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
