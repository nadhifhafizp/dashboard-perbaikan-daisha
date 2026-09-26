// Test all API endpoints against the running server
const BASE_URL = 'http://localhost:3000';

async function testAll() {
  console.log('--- 1. Testing Login as Admin ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  console.log('Login status:', loginRes.status);
  const cookieHeader = loginRes.headers.get('set-cookie');
  let authCookie = '';
  if (cookieHeader) {
    authCookie = cookieHeader.split(';')[0];
    console.log('Got Auth Cookie:', authCookie.substring(0, 25) + '...');
  } else {
    console.error('Failed to get cookie!');
    return;
  }

  const headers = {
    'Cookie': authCookie,
    'Content-Type': 'application/json'
  };

  console.log('\n--- 2. Testing /api/catalog ---');
  const catRes = await fetch(`${BASE_URL}/api/catalog`, { headers });
  console.log('Catalog status:', catRes.status);
  const catData = await catRes.json();
  console.log('Catalog success:', catData.success, 'Daisha types count:', catData.tree?.length, 'Sections count:', catData.sections?.length);

  console.log('\n--- 3. Testing /api/repair (GET) ---');
  const repRes = await fetch(`${BASE_URL}/api/repair`, { headers });
  console.log('Repair status:', repRes.status);
  const repData = await repRes.json();
  console.log('Repair tickets count:', Array.isArray(repData) ? repData.length : repData);

  console.log('\n--- 4. Testing /api/spareparts (GET) ---');
  const spRes = await fetch(`${BASE_URL}/api/spareparts`, { headers });
  console.log('Spareparts status:', spRes.status);
  const spData = await spRes.json();
  console.log('Spareparts count:', spData.spareparts?.length);

  console.log('\n--- 5. Testing /api/users (GET) ---');
  const userRes = await fetch(`${BASE_URL}/api/users`, { headers });
  console.log('Users status:', userRes.status);
  const userData = await userRes.json();
  console.log('Users count:', userData.users?.length);

  console.log('\n--- 6. Testing /api/section-requests (GET) ---');
  const srRes = await fetch(`${BASE_URL}/api/section-requests`, { headers });
  console.log('Section-requests GET status:', srRes.status);
  const srData = await srRes.json();
  console.log('Section-requests success:', srData.success, 'Requests count:', srData.requests?.length);

  console.log('\n--- 7. Testing /api/section-requests (POST CREATE) ---');
  const srCreateRes = await fetch(`${BASE_URL}/api/section-requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'CREATE',
      seksiPemohon: 'Engineering',
      picPemohon: 'Test PIC',
      kontakPemohon: '08123456789',
      namaBarang: 'Baut Hexagonal M8',
      spesifikasi: 'Baja hitam Grade 8.8',
      jumlah: 50,
      satuan: 'pcs',
      urgensi: 'Normal',
      catatan: 'Untuk perbaikan daisha plant 1'
    })
  });
  console.log('Section-requests CREATE status:', srCreateRes.status);
  const srCreateData = await srCreateRes.json();
  console.log('Section-requests CREATE result:', srCreateData);

  let newReqId = null;
  if (srCreateData.success && srCreateData.request?.id) {
    newReqId = srCreateData.request.id;

    console.log('\n--- 8. Testing /api/section-requests (POST UPDATE_STATUS) ---');
    const srUpdateRes = await fetch(`${BASE_URL}/api/section-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'UPDATE_STATUS',
        id: newReqId,
        status: 'Disetujui',
        estimasi: '1 Hari',
        catatanAdmin: 'Disetujui oleh maintenance admin'
      })
    });
    console.log('Section-requests UPDATE_STATUS status:', srUpdateRes.status);
    const srUpdateData = await srUpdateRes.json();
    console.log('Section-requests UPDATE_STATUS result:', srUpdateData);

    console.log('\n--- 9. Testing /api/section-requests (POST DELETE) ---');
    const srDeleteRes = await fetch(`${BASE_URL}/api/section-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'DELETE',
        id: newReqId
      })
    });
    console.log('Section-requests DELETE status:', srDeleteRes.status);
    const srDeleteData = await srDeleteRes.json();
    console.log('Section-requests DELETE result:', srDeleteData);
  }

  console.log('\n--- 10. Testing /api/server-info ---');
  const srvRes = await fetch(`${BASE_URL}/api/server-info`, { headers });
  console.log('Server info status:', srvRes.status);
  const srvData = await srvRes.json();
  console.log('Server info result:', srvData);
}

testAll().catch(console.error);
