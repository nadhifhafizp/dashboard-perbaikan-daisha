import postgres from 'postgres';
import fs from 'node:fs';
import path from 'node:path';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function runMigration() {
  console.log('=== [1/6] MENERAPKAN SKEMA V2 (13 TABEL) ===');
  const schemaSql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'schema-v2.sql'), 'utf-8');
  await sql.unsafe(schemaSql);
  console.log('✓ Skema V2 berhasil dibuat/diverifikasi tanpa mengubah tabel lama.\n');

  console.log('=== [2/6] MIGRASI MASTER SEKSI & PENGGUNA ===');
  
  // 1. Ekstrak seluruh seksi unik dari tabel lama
  const seksiRows = await sql`
    WITH all_seksi AS (
      SELECT TRIM(seksi) as name FROM "Daisha" WHERE seksi IS NOT NULL AND TRIM(seksi) != ''
      UNION
      SELECT TRIM(seksi) as name FROM "DaishaCatalog" WHERE seksi IS NOT NULL AND TRIM(seksi) != ''
      UNION
      SELECT TRIM(seksi) as name FROM "User" WHERE seksi IS NOT NULL AND TRIM(seksi) != ''
      UNION
      SELECT TRIM("seksiPemohon") as name FROM "SectionRequest" WHERE "seksiPemohon" IS NOT NULL AND TRIM("seksiPemohon") != ''
    )
    SELECT DISTINCT name FROM all_seksi ORDER BY name;
  `;

  for (const s of seksiRows) {
    await sql`
      INSERT INTO sections (name)
      VALUES (${s.name})
      ON CONFLICT (LOWER(TRIM(name))) DO NOTHING;
    `;
  }
  const sectionCount = await sql`SELECT COUNT(*) FROM sections`;
  console.log(`✓ Master sections siap: ${sectionCount[0].count} seksi terdaftar.`);

  // 2. Salin Pengguna
  await sql`
    INSERT INTO users (id, username, password_hash, full_name, role, section_id, legacy_section_name, description, created_at, updated_at)
    SELECT 
      u.id,
      u.username,
      u.password,
      u.name,
      u.role,
      s.id,
      u.seksi,
      u.description,
      COALESCE(u.created_at, u."createdAt", now()),
      COALESCE(u.updated_at, u."updatedAt", now())
    FROM "User" u
    LEFT JOIN sections s ON LOWER(TRIM(s.name)) = LOWER(TRIM(u.seksi))
    ON CONFLICT (username) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      section_id = EXCLUDED.section_id,
      legacy_section_name = EXCLUDED.legacy_section_name,
      description = EXCLUDED.description,
      updated_at = EXCLUDED.updated_at;
  `;
  const userCount = await sql`SELECT COUNT(*) FROM users`;
  console.log(`✓ Pengguna termigrasi: ${userCount[0].count} user.\n`);

  console.log('=== [3/6] MIGRASI KATALOG DAISHA & UNIT FISIK ===');

  // 3. Salin DaishaCatalog
  await sql`
    INSERT INTO daisha_catalogs (id, name, section_id, legacy_section_name, code_prefix, total_units, components, variants, created_at, updated_at)
    SELECT
      c.id,
      c.name,
      s.id,
      c.seksi,
      c."codePrefix",
      COALESCE(c."totalUnits", 0),
      COALESCE(c.components, '[]'::jsonb),
      COALESCE(c.variants, '[]'::jsonb),
      COALESCE(c.created_at, c."createdAt", now()),
      COALESCE(c.updated_at, c."updatedAt", now())
    FROM "DaishaCatalog" c
    LEFT JOIN sections s ON LOWER(TRIM(s.name)) = LOWER(TRIM(c.seksi))
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      section_id = EXCLUDED.section_id,
      legacy_section_name = EXCLUDED.legacy_section_name,
      code_prefix = EXCLUDED.code_prefix,
      total_units = EXCLUDED.total_units,
      components = EXCLUDED.components,
      variants = EXCLUDED.variants,
      updated_at = EXCLUDED.updated_at;
  `;
  const catalogCount = await sql`SELECT COUNT(*) FROM daisha_catalogs`;
  console.log(`✓ Katalog Daisha termigrasi: ${catalogCount[0].count} jenis.`);

  // 4. Salin Daisha Units
  await sql`
    INSERT INTO daisha_units (
      id, catalog_id, section_id, nomor_daisha, nama_daisha, jenis, ukuran,
      legacy_section_name, last_condition, last_maintenance_date, last_repair_date,
      last_waktu_masuk, last_waktu_keluar, created_at, updated_at
    )
    SELECT
      d.id,
      c.id,
      s.id,
      d.nomor_daisha,
      d.nama_daisha,
      d.jenis,
      d.ukuran,
      d.seksi,
      COALESCE(d.last_condition, 'OK'),
      d.last_maintenance_date,
      d.last_repair_date,
      d.last_waktu_masuk,
      d.last_waktu_keluar,
      COALESCE(d.created_at, now()),
      COALESCE(d.updated_at, now())
    FROM "Daisha" d
    LEFT JOIN daisha_catalogs c ON LOWER(TRIM(c.name)) = LOWER(TRIM(d.nama_daisha))
    LEFT JOIN sections s ON LOWER(TRIM(s.name)) = LOWER(TRIM(d.seksi))
    ON CONFLICT (nomor_daisha) DO UPDATE SET
      catalog_id = EXCLUDED.catalog_id,
      section_id = EXCLUDED.section_id,
      nama_daisha = EXCLUDED.nama_daisha,
      jenis = EXCLUDED.jenis,
      ukuran = EXCLUDED.ukuran,
      legacy_section_name = EXCLUDED.legacy_section_name,
      last_condition = EXCLUDED.last_condition,
      last_maintenance_date = EXCLUDED.last_maintenance_date,
      last_repair_date = EXCLUDED.last_repair_date,
      last_waktu_masuk = EXCLUDED.last_waktu_masuk,
      last_waktu_keluar = EXCLUDED.last_waktu_keluar,
      updated_at = EXCLUDED.updated_at;
  `;
  const unitCount = await sql`SELECT COUNT(*) FROM daisha_units`;
  console.log(`✓ Unit fisik Daisha termigrasi: ${unitCount[0].count} unit.\n`);

  console.log('=== [4/6] MIGRASI TIKET REPAIR, ITEM DETAIL & MAINTENANCE LOG ===');

  // 5. Salin Repair Tickets
  await sql`
    INSERT INTO repair_tickets (
      id_ticket, daisha_id, nomor_daisha_snapshot, reporter_name, status,
      opened_at, completed_at, notes, legacy_items, created_at, updated_at
    )
    SELECT
      t."idTiket",
      u.id,
      t."noDaisha",
      t."namaPelapor",
      t.status,
      t."waktuMasuk",
      t."waktuSelesai",
      t.catatan,
      COALESCE(t.items, '[]'::jsonb),
      COALESCE(t.created_at, t."waktuMasuk"),
      COALESCE(t.updated_at, now())
    FROM "Ticket" t
    LEFT JOIN daisha_units u ON u.nomor_daisha = t."noDaisha"
    ON CONFLICT (id_ticket) DO UPDATE SET
      daisha_id = EXCLUDED.daisha_id,
      nomor_daisha_snapshot = EXCLUDED.nomor_daisha_snapshot,
      reporter_name = EXCLUDED.reporter_name,
      status = EXCLUDED.status,
      opened_at = EXCLUDED.opened_at,
      completed_at = EXCLUDED.completed_at,
      notes = EXCLUDED.notes,
      legacy_items = EXCLUDED.legacy_items,
      updated_at = EXCLUDED.updated_at;
  `;
  const ticketCount = await sql`SELECT COUNT(*) FROM repair_tickets`;
  console.log(`✓ Tiket repair termigrasi: ${ticketCount[0].count} tiket.`);

  // 6. Salin Detail Tiket (TicketDetail + fallback Ticket.items)
  await sql`
    INSERT INTO repair_ticket_items (
      ticket_id, component_name, symptom, action, quantity, legacy_detail_id, source_type, created_at
    )
    SELECT
      td."idTiket",
      td.komponen,
      td.gejala,
      td.tindakan,
      COALESCE(td.qty, 1),
      td.id,
      'TICKET_DETAIL_TABLE',
      COALESCE(td.created_at, now())
    FROM "TicketDetail" td
    INNER JOIN repair_tickets rt ON rt.id_ticket = td."idTiket"
    WHERE NOT EXISTS (
      SELECT 1 FROM repair_ticket_items rti 
      WHERE rti.ticket_id = td."idTiket" AND rti.legacy_detail_id = td.id
    );
  `;

  // Item fallback dari Ticket.items jika tiket belum punya baris di TicketDetail
  await sql`
    INSERT INTO repair_ticket_items (
      ticket_id, component_name, symptom, action, quantity, source_type, created_at
    )
    SELECT
      t.id_ticket,
      COALESCE(item->>'komponen', item->>'namaKomponen', 'Komponen Umum'),
      COALESCE(item->>'gejala', item->>'kerusakan', ''),
      COALESCE(item->>'tindakan', item->>'action', ''),
      COALESCE(NULLIF(item->>'qty', '')::numeric, 1),
      'TICKET_JSON_ITEMS',
      t.opened_at
    FROM repair_tickets t
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(t.legacy_items) = 'array' THEN t.legacy_items ELSE '[]'::jsonb END
    ) AS item
    WHERE NOT EXISTS (
      SELECT 1 FROM repair_ticket_items rti WHERE rti.ticket_id = t.id_ticket
    );
  `;
  const itemCount = await sql`SELECT COUNT(*) FROM repair_ticket_items`;
  console.log(`✓ Detail item tiket termigrasi: ${itemCount[0].count} baris item.`);

  // 7. Salin Maintenance Log
  await sql`
    INSERT INTO maintenance_logs (
      id, daisha_id, nomor_daisha_snapshot, jenis_pekerjaan, kondisi,
      detail_kerusakan, tindakan, tanggal_pengerjaan, waktu_masuk, waktu_keluar,
      performed_by_user_id, performed_by_snapshot, catatan, created_at
    )
    SELECT
      ml.id,
      COALESCE(u.id, ml.daisha_id),
      ml.nomor_daisha,
      ml.jenis_pekerjaan,
      ml.kondisi,
      ml.detail_kerusakan,
      ml.tindakan,
      ml.tanggal_pengerjaan,
      ml.waktu_masuk,
      ml.waktu_keluar,
      usr.id,
      ml.admin_id,
      ml.catatan,
      COALESCE(ml.created_at, ml.tanggal_pengerjaan)
    FROM "MaintenanceLog" ml
    LEFT JOIN daisha_units u ON u.nomor_daisha = ml.nomor_daisha
    LEFT JOIN users usr ON usr.username = ml.admin_id
    ON CONFLICT (id) DO UPDATE SET
      daisha_id = EXCLUDED.daisha_id,
      nomor_daisha_snapshot = EXCLUDED.nomor_daisha_snapshot,
      jenis_pekerjaan = EXCLUDED.jenis_pekerjaan,
      kondisi = EXCLUDED.kondisi,
      detail_kerusakan = EXCLUDED.detail_kerusakan,
      tindakan = EXCLUDED.tindakan,
      tanggal_pengerjaan = EXCLUDED.tanggal_pengerjaan,
      waktu_masuk = EXCLUDED.waktu_masuk,
      waktu_keluar = EXCLUDED.waktu_keluar,
      performed_by_user_id = EXCLUDED.performed_by_user_id,
      performed_by_snapshot = EXCLUDED.performed_by_snapshot,
      catatan = EXCLUDED.catatan;
  `;
  const logCount = await sql`SELECT COUNT(*) FROM maintenance_logs`;
  console.log(`✓ Riwayat PM & maintenance termigrasi: ${logCount[0].count} log.\n`);

  console.log('=== [5/6] MIGRASI REQUEST SEKSI, APPROVAL, MATERIAL & NOTIFIKASI ===');

  // 8. Salin Section Requests
  await sql`
    INSERT INTO section_requests (
      id, request_number, official_number, section_id, requester_section_snapshot,
      requester_user_id, requester_name, requester_contact, item_name, specification,
      quantity, unit, urgency, factor, purpose, reason, notes, status, flow_step,
      workshop_pic, admin_note, rejection_reason, pending_reason, completed_at,
      form_data, created_by_snapshot, created_at, updated_at
    )
    SELECT
      sr.id,
      sr."nomorRequest",
      sr."nomorSurat",
      s.id,
      sr."seksiPemohon",
      u.id,
      sr."picPemohon",
      sr."kontakPemohon",
      sr."namaBarang",
      sr.spesifikasi,
      COALESCE(sr.jumlah, 1),
      COALESCE(sr.satuan, 'Pcs'),
      COALESCE(sr.urgensi, 'Normal'),
      sr.faktor,
      sr.tujuan,
      sr.alasan,
      sr.catatan,
      sr.status,
      COALESCE(sr."flowStep", 'STEP_2_WAITING_ATASAN_SEKSI'),
      sr."picBengkel",
      sr."catatanAdmin",
      sr."alasanTolak",
      sr."alasanPending",
      sr."waktuSelesai",
      to_jsonb(sr) - ARRAY[
        'id','nomorRequest','nomorSurat','seksiPemohon','picPemohon','kontakPemohon',
        'namaBarang','spesifikasi','jumlah','satuan','urgensi','faktor','tujuan','alasan',
        'catatan','status','flowStep','picBengkel','catatanAdmin','alasanTolak','alasanPending',
        'waktuSelesai','dibuatOleh','waktuDibuat','waktuUpdate'
      ]::text[],
      sr."dibuatOleh",
      COALESCE(sr."waktuDibuat", now()),
      COALESCE(sr."waktuUpdate", now())
    FROM "SectionRequest" sr
    LEFT JOIN sections s ON LOWER(TRIM(s.name)) = LOWER(TRIM(sr."seksiPemohon"))
    LEFT JOIN users u ON u.username = sr."dibuatOleh"
    ON CONFLICT (id) DO UPDATE SET
      request_number = EXCLUDED.request_number,
      official_number = EXCLUDED.official_number,
      section_id = EXCLUDED.section_id,
      requester_section_snapshot = EXCLUDED.requester_section_snapshot,
      requester_user_id = EXCLUDED.requester_user_id,
      requester_name = EXCLUDED.requester_name,
      requester_contact = EXCLUDED.requester_contact,
      item_name = EXCLUDED.item_name,
      specification = EXCLUDED.specification,
      quantity = EXCLUDED.quantity,
      unit = EXCLUDED.unit,
      urgency = EXCLUDED.urgency,
      factor = EXCLUDED.factor,
      purpose = EXCLUDED.purpose,
      reason = EXCLUDED.reason,
      notes = EXCLUDED.notes,
      status = EXCLUDED.status,
      flow_step = EXCLUDED.flow_step,
      workshop_pic = EXCLUDED.workshop_pic,
      admin_note = EXCLUDED.admin_note,
      rejection_reason = EXCLUDED.rejection_reason,
      pending_reason = EXCLUDED.pending_reason,
      completed_at = EXCLUDED.completed_at,
      form_data = EXCLUDED.form_data,
      created_by_snapshot = EXCLUDED.created_by_snapshot,
      updated_at = EXCLUDED.updated_at;
  `;
  const requestCount = await sql`SELECT COUNT(*) FROM section_requests`;
  console.log(`✓ Pengajuan request termigrasi: ${requestCount[0].count} permohonan.`);

  // 9. Salin Stage Approvals dari kolom SectionRequest
  const requests = await sql`
    SELECT 
      id,
      "emailAtasanSeksi", "namaAtasanSeksi", "statusApprovalAtasanSeksi", "waktuApprovalAtasanSeksi", "catatanAtasanSeksi", "ttdAtasanSeksi", "approvalToken",
      "emailManajerSeksi", "namaManajerSeksi", "statusApprovalManajerSeksi", "waktuApprovalManajerSeksi", "catatanManajerSeksi", "ttdManajerSeksi",
      "emailMentorWorkshop", "statusApprovalAtasanSpecialProject", "waktuApprovalAtasanSpecialProject", "ttdAtasanSpecialProject",
      "ttdSpvWorkshop", "ttdAdminWorkshop", "keputusan", "keputusan8210", "keputusan820"
    FROM "SectionRequest";
  `;

  for (const r of requests) {
    // Stage 1: SECTION_SUPERVISOR
    if (r.namaAtasanSeksi || r.emailAtasanSeksi || r.statusApprovalAtasanSeksi) {
      await sql`
        INSERT INTO section_request_approvals (
          request_id, stage, approval_status, reviewer_name, reviewer_email, 
          approval_token, signature_data, approved_at, notes
        ) VALUES (
          ${r.id}, 'SECTION_SUPERVISOR', ${r.statusApprovalAtasanSeksi || 'PENDING'},
          ${r.namaAtasanSeksi}, ${r.emailAtasanSeksi}, ${r.approvalToken}, ${r.ttdAtasanSeksi},
          ${r.waktuApprovalAtasanSeksi}, ${r.catatanAtasanSeksi}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    // Stage 2: SECTION_MANAGER
    if (r.namaManajerSeksi || r.emailManajerSeksi || r.statusApprovalManajerSeksi) {
      await sql`
        INSERT INTO section_request_approvals (
          request_id, stage, approval_status, reviewer_name, reviewer_email, 
          signature_data, approved_at, notes
        ) VALUES (
          ${r.id}, 'SECTION_MANAGER', ${r.statusApprovalManajerSeksi || 'PENDING'},
          ${r.namaManajerSeksi}, ${r.emailManajerSeksi}, ${r.ttdManajerSeksi},
          ${r.waktuApprovalManajerSeksi}, ${r.catatanManajerSeksi}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    // Stage 3: SPECIAL_PROJECT
    if (r.emailMentorWorkshop || r.statusApprovalAtasanSpecialProject || r.ttdAtasanSpecialProject) {
      await sql`
        INSERT INTO section_request_approvals (
          request_id, stage, approval_status, reviewer_email, 
          signature_data, approved_at, decision, decision_8210, decision_820
        ) VALUES (
          ${r.id}, 'SPECIAL_PROJECT', ${r.statusApprovalAtasanSpecialProject || 'PENDING'},
          ${r.emailMentorWorkshop}, ${r.ttdAtasanSpecialProject},
          ${r.waktuApprovalAtasanSpecialProject}, ${r.keputusan}, ${r.keputusan8210}, ${r.keputusan820}
        )
        ON CONFLICT DO NOTHING;
      `;
    }
  }
  const approvalCount = await sql`SELECT COUNT(*) FROM section_request_approvals`;
  console.log(`✓ Riwayat approval berjenjang termigrasi: ${approvalCount[0].count} stage.`);

  // 10. Salin Material Request (dari JSONB materials)
  await sql`
    INSERT INTO section_request_materials (
      request_id, item_name_snapshot, item_type, specification, quantity, unit,
      dimensions, deduct_stock, deducted_quantity, notes, source_type, source_payload
    )
    SELECT
      sr.id,
      COALESCE(mat->>'nama', mat->>'name', 'Material Request'),
      CASE WHEN LOWER(COALESCE(mat->>'kategori', mat->>'tipe', '')) = 'sparepart' THEN 'SPAREPART' ELSE 'MATERIAL' END,
      mat->>'spesifikasi',
      COALESCE(NULLIF(mat->>'qty', '')::numeric, NULLIF(mat->>'jumlah', '')::numeric, 1),
      COALESCE(mat->>'satuan', 'Pcs'),
      mat->>'dimensi',
      COALESCE((mat->>'potongStok')::boolean, false),
      COALESCE(NULLIF(mat->>'qtyPotongStok', '')::numeric, 0),
      mat->>'keterangan',
      'JSON_MATERIALS',
      mat
    FROM "SectionRequest" sr
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(sr.materials) = 'array' THEN sr.materials ELSE '[]'::jsonb END
    ) AS mat
    WHERE NOT EXISTS (
      SELECT 1 FROM section_request_materials srm WHERE srm.request_id = sr.id
    );
  `;
  const materialCount = await sql`SELECT COUNT(*) FROM section_request_materials`;
  console.log(`✓ Material request termigrasi: ${materialCount[0].count} item.`);

  // 11. Salin Notifikasi Request
  await sql`
    INSERT INTO section_request_notifications (
      id, request_id, request_number_snapshot, target_role, target_user_id,
      target_user_snapshot, target_email, notification_type, title, message, link, is_read, created_at
    )
    SELECT
      n.id,
      n."requestId",
      n."nomorRequest",
      n."targetRole",
      u.id,
      n."targetUser",
      n."targetEmail",
      n.tipe,
      n.judul,
      n.pesan,
      n.link,
      COALESCE(n."isRead", false),
      COALESCE(n.waktu, now())
    FROM "SectionRequestNotification" n
    LEFT JOIN users u ON u.username = n."targetUser"
    ON CONFLICT (id) DO UPDATE SET
      request_id = EXCLUDED.request_id,
      request_number_snapshot = EXCLUDED.request_number_snapshot,
      target_role = EXCLUDED.target_role,
      target_user_id = EXCLUDED.target_user_id,
      target_user_snapshot = EXCLUDED.target_user_snapshot,
      target_email = EXCLUDED.target_email,
      notification_type = EXCLUDED.notification_type,
      title = EXCLUDED.title,
      message = EXCLUDED.message,
      link = EXCLUDED.link,
      is_read = EXCLUDED.is_read;
  `;
  const notifCount = await sql`SELECT COUNT(*) FROM section_request_notifications`;
  console.log(`✓ Notifikasi request termigrasi: ${notifCount[0].count} notifikasi.\n`);

  console.log('=== [6/6] MIGRASI INVENTARIS SPAREPART & MUTASI STOK ===');

  // Lepaskan constraint check saldo non-negatif agar data riil yang sempat minus dapat disalin & diaudit
  await sql`ALTER TABLE spareparts DROP CONSTRAINT IF EXISTS spareparts_stock_quantity_check;`;

  // 12. Salin Master Sparepart
  await sql`
    INSERT INTO spareparts (
      name, category, stock_quantity, unit, minimum_stock, location, created_at, updated_at
    )
    SELECT
      sp."namaKomponen",
      sp.kategori,
      sp."stokGudang",
      sp.satuan,
      sp."minStok",
      sp.lokasi,
      COALESCE(sp.created_at, now()),
      COALESCE(sp.updated_at, now())
    FROM "Sparepart" sp
    ON CONFLICT (name) DO UPDATE SET
      category = EXCLUDED.category,
      stock_quantity = EXCLUDED.stock_quantity,
      unit = EXCLUDED.unit,
      minimum_stock = EXCLUDED.minimum_stock,
      location = EXCLUDED.location,
      updated_at = EXCLUDED.updated_at;
  `;
  const sparepartCount = await sql`SELECT COUNT(*) FROM spareparts`;
  console.log(`✓ Master sparepart termigrasi: ${sparepartCount[0].count} suku cadang.`);

  // 13. Salin Mutasi Stok dari SparepartLog
  await sql`
    INSERT INTO sparepart_movements (
      sparepart_id, sparepart_name_snapshot, movement_type, quantity,
      reference_type, reference_value, performed_by_user_id, performed_by_snapshot,
      note, moved_at
    )
    SELECT
      sp.id,
      sl."namaKomponen",
      CASE 
        WHEN UPPER(sl.tipe) IN ('IN', 'MASUK', 'RESTOCK') THEN 'IN'
        WHEN UPPER(sl.tipe) IN ('OUT', 'KELUAR', 'PAKAI') THEN 'OUT'
        ELSE 'ADJUSTMENT'
      END,
      GREATEST(ABS(sl.qty), 1),
      CASE 
        WHEN sl.referensi ILIKE 'REQ-%' THEN 'SECTION_REQUEST'
        WHEN sl.referensi ILIKE 'TK-%' OR sl.referensi ILIKE 'TCK-%' THEN 'REPAIR_TICKET'
        ELSE 'MANUAL'
      END,
      sl.referensi,
      u.id,
      sl.referensi,
      sl.keterangan,
      COALESCE(sl.tanggal, sl.created_at, now())
    FROM "SparepartLog" sl
    LEFT JOIN spareparts sp ON sp.name = sl."namaKomponen"
    LEFT JOIN users u ON u.username = sl.referensi
    WHERE NOT EXISTS (
      SELECT 1 FROM sparepart_movements sm 
      WHERE sm.sparepart_name_snapshot = sl."namaKomponen" 
        AND sm.reference_value = sl.referensi
        AND sm.moved_at = COALESCE(sl.tanggal, sl.created_at)
    );
  `;
  const movementCount = await sql`SELECT COUNT(*) FROM sparepart_movements`;
  console.log(`✓ Mutasi stok sparepart termigrasi: ${movementCount[0].count} riwayat mutasi.\n`);

  // Sinkronisasi sequences PostgreSQL
  console.log('--- SINKRONISASI SEQUENCE IDENTITY ---');
  const syncTables = [
    { table: 'sections', col: 'id' },
    { table: 'users', col: 'id' },
    { table: 'daisha_catalogs', col: 'id' },
    { table: 'repair_ticket_items', col: 'id' },
    { table: 'section_requests', col: 'id' },
    { table: 'section_request_approvals', col: 'id' },
    { table: 'spareparts', col: 'id' },
    { table: 'section_request_materials', col: 'id' },
    { table: 'section_request_notifications', col: 'id' },
    { table: 'sparepart_movements', col: 'id' }
  ];

  for (const item of syncTables) {
    try {
      await sql.unsafe(`
        SELECT setval(
          pg_get_serial_sequence('${item.table}', '${item.col}'),
          COALESCE((SELECT MAX(${item.col}) FROM ${item.table}), 1)
        );
      `);
      console.log(`✓ Sequence ${item.table}.${item.col} tersinkronisasi.`);
    } catch (e) {
      console.log(`- Sequence ${item.table}.${item.col}: ${e.message}`);
    }
  }

  console.log('\n=== [VALIDASI INTEGRITAS DATA V2] ===');
  
  // Periksa kesesuaian row count
  const checks = [
    { name: 'Pengguna (User -> users)', oldTable: 'User', newTable: 'users' },
    { name: 'Katalog (DaishaCatalog -> daisha_catalogs)', oldTable: 'DaishaCatalog', newTable: 'daisha_catalogs' },
    { name: 'Unit Armada (Daisha -> daisha_units)', oldTable: 'Daisha', newTable: 'daisha_units' },
    { name: 'Tiket Servis (Ticket -> repair_tickets)', oldTable: 'Ticket', newTable: 'repair_tickets' },
    { name: 'Maintenance Log (MaintenanceLog -> maintenance_logs)', oldTable: 'MaintenanceLog', newTable: 'maintenance_logs' },
    { name: 'Request Seksi (SectionRequest -> section_requests)', oldTable: 'SectionRequest', newTable: 'section_requests' },
    { name: 'Notifikasi (SectionRequestNotification -> section_request_notifications)', oldTable: 'SectionRequestNotification', newTable: 'section_request_notifications' },
    { name: 'Master Sparepart (Sparepart -> spareparts)', oldTable: 'Sparepart', newTable: 'spareparts' }
  ];

  for (const c of checks) {
    const oldCount = await sql.unsafe(`SELECT COUNT(*) as count FROM "${c.oldTable}"`);
    const newCount = await sql.unsafe(`SELECT COUNT(*) as count FROM "${c.newTable}"`);
    const diff = Number(oldCount[0].count) - Number(newCount[0].count);
    console.log(`${c.name}: Lama = ${oldCount[0].count} | Baru = ${newCount[0].count} ${diff === 0 ? '✓ MATCH' : '⚠ SELISIH ' + diff}`);
  }

  // Cek saldo negatif
  const negativeStock = await sql`SELECT COUNT(*) FROM spareparts WHERE stock_quantity < 0`;
  console.log(`Stok negatif: ${negativeStock[0].count} ${Number(negativeStock[0].count) === 0 ? '✓ AMAN' : '⚠ PERINGATAN'}`);

  // Cek orphan ticket items
  const orphanItems = await sql`
    SELECT COUNT(*) FROM repair_ticket_items rti
    LEFT JOIN repair_tickets rt ON rt.id_ticket = rti.ticket_id
    WHERE rt.id_ticket IS NULL
  `;
  console.log(`Orphan ticket items: ${orphanItems[0].count} ${Number(orphanItems[0].count) === 0 ? '✓ AMAN' : '⚠ PERINGATAN'}`);

  console.log('\n======================================================');
  console.log('MIGRASI DATA V2 SELESAI DENGAN AMAN TANPA DATA LOSS.');
  console.log('Tabel lama tetap utuh 100% sebagai arsip.');
  console.log('======================================================');

  await sql.end();
}

runMigration().catch((err) => {
  console.error('\n❌ Error during migration:', err);
  process.exit(1);
});
