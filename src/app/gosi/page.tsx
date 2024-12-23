/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as styles from './styles';

import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import SortButton from '../../components/SortButton';
import Link from 'next/link';

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
  detailHref: string;
}

function parsedPrice(price: string): number {
  let totalPrice = 0;

  if (
    price === '권리없음' ||
    price === '권리금무' ||
    price === '' ||
    price === '무권리'
  ) {
    return 0;
  }
  // Remove any non-numeric prefixes like "실투자" and whitespace
  price = price.replace(/^[^\d]+/, '').replace(/,/g, '');

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
  } else if (price.includes('억원')) {
    const [billions] = price.split('억원');
    totalPrice += parseInt(billions, 10) * 100000000;
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

async function fetchAllListings(): Promise<ListingData[]> {
  const pageNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
  const baseUrl = process.env.GOSI_BASE_URL;

  if (!baseUrl) {
    throw new Error('The GOSI_URL environment variable is not set.');
  }

  const responses = await Promise.all(
    pageNumbers.map((page) =>
      axios.get(`${baseUrl}/searchlist.php3?page=${page}`, {
        responseType: 'arraybuffer',
      }),
    ),
  );

  const allListings: ListingData[] = [];

  responses.forEach((response) => {
    const decodedContent = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    const $ = cheerio.load(decodedContent);

    $('table[width="850"] tr')
      .slice(2)
      .each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length === 9) {
          const titleCell = $(cells[2]);
          const titleLink = titleCell.find('a');
          const titleHref = titleLink.attr('href') || '';

          allListings.push({
            number: $(cells[1]).text().trim(),
            title: $(cells[2]).text().trim(),
            location: $(cells[3]).text().trim(),
            area: $(cells[4]).text().trim(),
            roomCount: $(cells[5]).text().trim(),
            totalPrice: $(cells[6]).text().trim(),
            parsedPrice: parsedPrice($(cells[6]).text().trim()),
            date: $(cells[7]).text().trim(),
            views: $(cells[8]).text().trim(),
            detailHref: titleHref,
          });
        }
      });
  });

  return allListings;
}

export default async function GosiPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const allListings = await fetchAllListings();

  const { sortBy } = await searchParams;

  if (sortBy === 'views') {
    allListings.sort((a, b) => {
      const viewsA = parseInt(a.views.replace(/\D/g, '') || '0', 10);
      const viewsB = parseInt(b.views.replace(/\D/g, '') || '0', 10);
      return viewsB - viewsA;
    });
  } else if (sortBy === 'parsedPrice') {
    allListings.sort((a, b) => b.parsedPrice - a.parsedPrice);
  }

  return (
    <div>
      <h1
        style={{
          textAlign: 'center',
          backgroundColor: '#b3e6ff',
          marginBottom: '20px',
          padding: '10px',
        }}
      >
        고시텔 목록
      </h1>
      <SortButton />
      <table style={styles.tableStyle}>
        <thead>
          <tr>
            <th style={styles.headerCellStyle}>ID</th>
            <th style={styles.headerCellStyle}>번호</th>
            <th style={styles.headerCellStyle}>제목</th>
            <th style={styles.headerCellStyle}>시,구</th>
            <th style={styles.headerCellStyle}>m2(평수)</th>
            <th style={styles.headerCellStyle}>룸갯수</th>
            <th style={styles.headerCellStyle}>매물가총액</th>
            <th style={styles.headerCellStyle}>수정된 매물가</th>
            <th style={styles.headerCellStyle}>작성일</th>
            <th style={styles.headerCellStyle}>조회</th>
          </tr>
        </thead>
        <tbody>
          {allListings.map((listing, index) => (
            <tr key={index}>
              <td style={styles.cellStyle}>{index + 1}</td>
              <td style={styles.cellStyle}>{listing.number}</td>
              <td style={styles.cellStyle}>
                <Link
                  href={`${process.env.GOSI_BASE_URL}/${listing.detailHref}`}
                >
                  {listing.title}
                </Link>
              </td>
              <td style={styles.cellStyle}>{listing.location}</td>
              <td style={styles.cellStyle}>{listing.area}</td>
              <td style={styles.cellStyle}>{listing.roomCount}</td>
              <td style={styles.cellStyle}>{listing.totalPrice}</td>
              <td style={styles.cellStyle}>{listing.parsedPrice}</td>
              <td style={styles.cellStyle}>{listing.date}</td>
              <td style={styles.cellStyle}>{listing.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
