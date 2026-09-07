import { PrismaClient } from '../lib/prisma-client/index.js';
import crypto from 'crypto';
import { masterDataDaisha } from '../lib/masterData.ts';

const prisma = new PrismaClient();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  console.log('=== SEEDING INITIAL USERS & DAISHA CATALOG ===');

  // 1. Seed Users
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('Seeding initial users...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const operatorPassword = process.env.OPERATOR_PASSWORD || 'operator123';

    await prisma.user.createMany({
      data: [
        {
          username: (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase(),
          password: hashPassword(adminPassword),
          name: 'Admin Maintenance & Rekap',
          role: 'ADMIN',
          description: 'Melihat rekapitulasi data, grafik statistik, ekspor Excel, kelola katalog, dan manajemen user.',
        },
        {
          username: (process.env.OPERATOR_USERNAME || 'operator').trim().toLowerCase(),
          password: hashPassword(operatorPassword),
          name: 'Staff Input / Teknisi Lapangan',
          role: 'OPERATOR',
          description: 'Input data kerusakan Daisha baik di plant maupun bengkel maintenance.',
        },
      ],
    });
    console.log('✔ 2 User berhasil dibuat (admin & operator)');
  } else {
    console.log(`User sudah ada (${userCount} user), lewati seed user.`);
  }

  // 2. Seed Catalog
  const daishaCount = await prisma.daishaType.count();
  if (daishaCount === 0) {
    console.log('Seeding Daisha catalog from masterDataDaisha...');
    let totalDaisha = 0;
    let totalComp = 0;
    let totalSymptoms = 0;

    for (const [daishaName, info] of Object.entries(masterDataDaisha)) {
      const createdDaisha = await prisma.daishaType.create({
        data: {
          name: daishaName.trim(),
          seksi: info.seksi || 'All seksi',
        },
      });
      totalDaisha++;

      for (const [compName, symptoms] of Object.entries(info.jenisKerusakan)) {
        const createdComp = await prisma.daishaComponent.create({
          data: {
            daishaTypeId: createdDaisha.id,
            name: compName.trim(),
          },
        });
        totalComp++;

        if (Array.isArray(symptoms) && symptoms.length > 0) {
          await prisma.daishaSymptom.createMany({
            data: symptoms.map((s) => ({
              componentId: createdComp.id,
              description: String(s).trim(),
            })),
          });
          totalSymptoms += symptoms.length;
        }
      }
    }
    console.log(`✔ Berhasil seed ${totalDaisha} Jenis Daisha, ${totalComp} Komponen, dan ${totalSymptoms} Gejala ke database!`);
  } else {
    console.log(`Katalog Daisha sudah ada (${daishaCount} Daisha), lewati seed katalog.`);
  }

  await prisma.$disconnect();
  console.log('=== SEEDING SELESAI ===');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
