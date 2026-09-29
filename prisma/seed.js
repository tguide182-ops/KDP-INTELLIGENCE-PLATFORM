const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}

async function main() {
  console.log('Seeding VYRAL database...');

  // 1. Create Default User
  const { hash, salt } = hashPassword('password123');
  const user = await prisma.user.upsert({
    where: { email: 'creator@vyral.ai' },
    update: {},
    create: {
      email: 'creator@vyral.ai',
      name: 'Apex Creator',
      passwordHash: hash,
      salt: salt,
      role: 'CREATOR',
    },
  });
  console.log('Created creator user:', user.email);

  // 2. Create Apex Inquiries Channel
  const channel = await prisma.channel.upsert({
    where: { youtubeChannelId: 'UC_mock_veritasium_style' },
    update: {},
    create: {
      userId: user.id,
      youtubeChannelId: 'UC_mock_veritasium_style',
      handle: '@apexinquiries',
      title: 'Apex Inquiries',
      description: 'In-depth documentaries, visual essays, and investigative analyses exploring high-stakes events and complex systems.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      customUrl: 'https://youtube.com/@apexinquiries',
      country: 'United States',
      publishedAt: new Date('2021-04-12T00:00:00Z'),
      isOwned: true,
    },
  });

  // 3. Create Channel DNA
  await prisma.channelDNA.upsert({
    where: { channelId: channel.id },
    update: {},
    create: {
      channelId: channel.id,
      positioning: 'High-production forensic investigations into engineering anomalies, forgotten disasters, and systemic breakdowns.',
      topicPillars: JSON.stringify([
        { pillar: 'Structural & Engineering Catastrophes', frequencyPercent: 45, avgMultiplier: 3.8 },
        { pillar: 'Cold War & Scientific Deception', frequencyPercent: 30, avgMultiplier: 2.4 },
        { pillar: 'Modern Infrastructure Mysteries', frequencyPercent: 25, avgMultiplier: 1.9 },
      ]),
      titleDNA: JSON.stringify({
        formula: 'The [Adjective] [Subject] That [Unexpected Action/Consequence]',
        characterCountAvg: 52,
        highPerformingTriggers: ['Secret', 'Failure', 'Catastrophe', 'Nobody Can Explain', 'Why It Collapsed'],
      }),
      thumbnailDNA: JSON.stringify({
        colorPalette: ['#0f172a', '#f97316', '#e2e8f0'],
        focalStyle: 'Single monolithic object center-left with extreme contrast lighting',
        textDensity: 'LOW',
        expressionStyle: 'No talking head or face; focus on ominous object/blueprint',
      }),
      hookDNA: JSON.stringify({
        primaryStyle: 'In medias res cold-open under 8 seconds before any logo or intro',
        curiosityDurationSec: 45,
      }),
      visualDNA: JSON.stringify({
        pacing: 'Cut frequency every 3.8 seconds with continuous subtle zoom or pan',
        bRollFrequency: 'High density archival footage blended with custom 3D schematics',
      }),
      storytellingDNA: JSON.stringify({
        arcPattern: 'Three-act thriller structure adapted for documentary pacing',
        openLoopsAverage: 4,
      }),
    },
  });

  console.log('VYRAL database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
