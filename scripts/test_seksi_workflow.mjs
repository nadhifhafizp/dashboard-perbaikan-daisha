// Test login as seksi_welding and submitting a request
const BASE_URL = 'http://localhost:3000';

async function testSeksi() {
  console.log('--- 1. Login as seksi_welding ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'seksi_welding', password: 'seksi123' })
  });
  console.log('Login status:', loginRes.status);
  const cookieHeader = loginRes.headers.get('set-cookie');
  if (!cookieHeader) {
    console.error('Failed to get cookie for seksi_welding');
    return;
  }
  const cookie = cookieHeader.split(';')[0];
  const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };

  console.log('--- 2. GET /api/section-requests as seksi_welding ---');
  const getRes = await fetch(`${BASE_URL}/api/section-requests`, { headers });
  console.log('GET status:', getRes.status);
  const getData = await getRes.json();
  console.log('GET result:', getData);

  console.log('--- 3. POST /api/section-requests (CREATE) as seksi_welding ---');
  const postRes = await fetch(`${BASE_URL}/api/section-requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'CREATE',
      seksiPemohon: 'Welding',
      picPemohon: 'Ahmad Supriyadi',
      kontakPemohon: 'Ext 402',
      namaBarang: 'Jig Trolley TBR 2026',
      spesifikasi: 'Besi hollow 40x40 tebal 2mm',
      jumlah: 2,
      satuan: 'unit',
      urgensi: 'Urgent',
      catatan: 'Untuk lini produksi baru'
    })
  });
  console.log('POST status:', postRes.status);
  const postData = await postRes.json();
  console.log('POST result:', postData);

  console.log('--- 4. Verify request in GET as seksi_welding ---');
  const getRes2 = await fetch(`${BASE_URL}/api/section-requests`, { headers });
  const getData2 = await getRes2.json();
  console.log('Requests for seksi_welding count:', getData2.requests?.length);
}

testSeksi().catch(console.error);
