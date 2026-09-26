// Extended test script for Repair, Spareparts, and Users CRUD operations
const BASE_URL = 'http://localhost:3000';

async function testCrud() {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };

  console.log('--- A. Testing Repair Ticket CRUD ---');
  const ticketId = `TCK-TEST-${Date.now()}`;
  const createTicketRes = await fetch(`${BASE_URL}/api/repair`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'CREATE',
      idTiket: ticketId,
      waktuMasuk: '2026-09-23 10:00',
      namaPelapor: 'Budi Teknisi',
      seksi: 'TBR Produksi',
      namaDaisha: 'FLAT BED TBR',
      noDaisha: 'FBD-001',
      detail: '1. [Roda / Caster] Roda pecah (Qty: 2, Tindakan: Ganti)'
    })
  });
  console.log('Ticket CREATE status:', createTicketRes.status);
  const createTicketData = await createTicketRes.json();
  console.log('Ticket CREATE result:', createTicketData);

  const updateTicketRes = await fetch(`${BASE_URL}/api/repair`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'UPDATE',
      idTiket: ticketId,
      status: 'Progress',
      catatan: 'Sedang menunggu pengelasan'
    })
  });
  console.log('Ticket UPDATE status:', updateTicketRes.status);
  console.log('Ticket UPDATE result:', await updateTicketRes.json());

  const deleteTicketRes = await fetch(`${BASE_URL}/api/repair`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'DELETE',
      idTiket: ticketId
    })
  });
  console.log('Ticket DELETE status:', deleteTicketRes.status);
  console.log('Ticket DELETE result:', await deleteTicketRes.json());

  console.log('\n--- B. Testing Sparepart Restock & Use ---');
  const getSpRes = await fetch(`${BASE_URL}/api/spareparts`, { headers });
  const getSpData = await getSpRes.json();
  const sampleSparepart = getSpData.spareparts?.[0]?.namaKomponen || 'Ring';
  console.log('Testing with sparepart:', sampleSparepart);

  const restockRes = await fetch(`${BASE_URL}/api/spareparts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'RESTOCK',
      namaKomponen: sampleSparepart,
      qty: 5,
      keterangan: 'Penerimaan PO-2026-09'
    })
  });
  console.log('Sparepart RESTOCK status:', restockRes.status);
  console.log('Sparepart RESTOCK result:', await restockRes.json());

  const useRes = await fetch(`${BASE_URL}/api/spareparts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'USE',
      namaKomponen: sampleSparepart,
      qty: 2,
      referensi: 'TCK-MANUAL-01',
      keterangan: 'Pemakaian uji coba'
    })
  });
  console.log('Sparepart USE status:', useRes.status);
  console.log('Sparepart USE result:', await useRes.json());

  console.log('\nAll CRUD tests completed successfully!');
}

testCrud().catch(console.error);
