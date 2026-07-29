import { mkdir, writeFile } from 'node:fs/promises';

const fishLabels = {
  갈치: { id: 341, exact: '은갈치', note: '대표 갈치류' },
  고등어: { id: 41, exact: '고등어' },
  전갱이: { id: 371, exact: '줄무늬전갱이', note: '유사 어종' },
  가자미: { id: 380, exact: '참가자미', note: '대표 가자미류' },
  오징어: { id: 320, exact: '오징어' },
  대구: null,
  청어: { id: 399, exact: '청어' },
  대게: { id: 96, exact: '대게' },
  참돔: { id: 386, exact: '참돔' },
  부시리: { id: 215, exact: '부시리' },
  방어: { id: 192, exact: '방어' },
  우럭: { id: 332, exact: '우럭' },
  광어: { id: 49, exact: '광어' },
  황금바리: null
};

const apiBase = 'https://pub-api.tpirates.com/v2/www/retail-price';
const marketCodes = [
  '0000000344',
  '0000000195',
  '0000000058',
  '0000000038',
  '0000000036',
  '0000000311'
].join(',');

const won = new Intl.NumberFormat('ko-KR');

async function fetchPrice(label) {
  if (!label) return null;
  const requestRows = async params => {
    const response = await fetch(`${apiBase}/label/${label.id}/price?${params}`);
    if (!response.ok) throw new Error(`price request failed: ${response.status}`);
    const payload = await response.json();
    return payload.content || [];
  };
  const localParams = new URLSearchParams({ size: '100', marketCodeList: marketCodes });
  let rows = (await requestRows(localParams)).filter(row =>
    row.priceDate &&
    Number.isFinite(row.minPrice) &&
    row.minPrice > 0
  );
  let scope = '부산 주요 수산시장';
  if (!rows.length) {
    const nationalParams = new URLSearchParams({ size: '1000' });
    rows = (await requestRows(nationalParams)).filter(row =>
      row.priceDate &&
      Number.isFinite(row.minPrice) &&
      row.minPrice > 0
    );
    scope = '전국 공개 시세';
  }
  if (!rows.length) return null;

  const kgRows = rows.filter(row => row.unitDesc === 'kg');
  const selected = kgRows.length ? kgRows : rows;
  const min = Math.min(...selected.map(row => row.minPrice));
  const max = Math.max(...selected.map(row => row.maxPrice || row.avgPrice || row.minPrice));
  const unit = selected[0].unitDesc || 'kg';
  const date = selected.map(row => row.priceDate).sort().at(-1);
  const display = min === max
    ? `약 ${won.format(min)}원/${unit}`
    : `약 ${won.format(min)}~${won.format(max)}원/${unit}`;

  return {
    display,
    min,
    max,
    unit,
    priceDate: date,
    listedName: label.exact,
    note: label.note || null,
    scope
  };
}

const items = {};
for (const [name, label] of Object.entries(fishLabels)) {
  try {
    items[name] = await fetchPrice(label);
  } catch (error) {
    console.error(`${name}: ${error.message}`);
    items[name] = null;
  }
}

const output = {
  source: '인어교주해적단',
  sourceUrl: 'https://tpirates.com/시세',
  market: '부산 주요 시장 우선, 미등록 시 전국 공개 소매시세',
  updatedAt: new Date().toISOString(),
  items
};

await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../docs/fish-prices.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8'
);
