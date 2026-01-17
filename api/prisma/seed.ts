import { PrismaClient, ROLE, CHAT_SOURCE, CHAT_STATUS, CHAT_MESSAGE_TYPE, AGENT_TYPE, EXECUTION_TYPE, CALL_STATUS, SENTIMENT } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Seed script is disabled in production');
    return;
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🌱 Starting AskChimps Database Seed');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💡 Tip: Run "npm run db:reset" to reset the entire database and reseed');
  console.log('⏱️  This may take a few moments...\n');

  // Hash passwords
  const superAdminhashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
  const sunrooofOwnerhashedPassword = await bcrypt.hash('SunrooofOwner@123', 10);
  const magppieOwnerhashedPassword = await bcrypt.hash('MagppieOwner@123', 10);
  const sunrooofAIAdminHashedPassword = await bcrypt.hash('SunrooofAI@123', 10);
  const sunrooofMarketingHashedPassword = await bcrypt.hash('MarketingSunrooof@123', 10);
  const sunrooofSalesHashedPassword = await bcrypt.hash('SalesSunrooof@123', 10);
  const magppieAIAdminHashedPassword = await bcrypt.hash('MagppieAI@123', 10);
  const magppieMarketingHashedPassword = await bcrypt.hash('MarketingMagppie@123', 10);
  const magppieSalesHashedPassword = await bcrypt.hash('SalesMagppie@123', 10);

  // Create Users
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Creating users...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@askchimps.com',
      password: superAdminhashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      isActive: true,
    },
  });

  const sunroofOwner = await prisma.user.create({
    data: {
      email: 'admin@sunrooof.com',
      password: sunrooofOwnerhashedPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      isActive: true,
    },
  });

  const magppieOwner = await prisma.user.create({
    data: {
      email: 'admin@magppie.com',
      password: magppieOwnerhashedPassword,
      firstName: 'Priya',
      lastName: 'Sharma',
      isActive: true,
    },
  });

  const sunrooofAIAdmin = await prisma.user.create({
    data: {
      email: 'ai@sunrooof.com',
      password: sunrooofAIAdminHashedPassword,
      firstName: 'AI',
      lastName: 'Assistant',
      isActive: true,
    },
  });

  const sunrooofMarketing = await prisma.user.create({
    data: {
      email: 'marketing@sunrooof.com',
      password: sunrooofMarketingHashedPassword,
      firstName: 'Marketing',
      lastName: 'Team',
      isActive: true,
    },
  });

  const sunrooofSales = await prisma.user.create({
    data: {
      email: 'sales@sunrooof.com',
      password: sunrooofSalesHashedPassword,
      firstName: 'Sales',
      lastName: 'Team',
      isActive: true,
    },
  });

  const magppieAIAdmin = await prisma.user.create({
    data: {
      email: 'ai@magppie.com',
      password: magppieAIAdminHashedPassword,
      firstName: 'AI',
      lastName: 'Assistant',
      isActive: true,
    },
  });

  const magppieMarketing = await prisma.user.create({
    data: {
      email: 'marketing@magppie.com',
      password: magppieMarketingHashedPassword,
      firstName: 'Marketing',
      lastName: 'Team',
      isActive: true,
    },
  });

  const magppieSales = await prisma.user.create({
    data: {
      email: 'sales@magppie.com',
      password: magppieSalesHashedPassword,
      firstName: 'Sales',
      lastName: 'Team',
      isActive: true,
    },
  });

  console.log('   ✓ Super Admin: admin@askchimps.com');
  console.log('   ✓ Sunrooof Owner: admin@sunrooof.com');
  console.log('   ✓ Sunrooof AI Admin: ai@sunrooof.com');
  console.log('   ✓ Sunrooof Marketing: marketing@sunrooof.com');
  console.log('   ✓ Sunrooof Sales: sales@sunrooof.com');
  console.log('   ✓ Magppie Owner: admin@magppie.com');
  console.log('   ✓ Magppie AI Admin: ai@magppie.com');
  console.log('   ✓ Magppie Marketing: marketing@magppie.com');
  console.log('   ✓ Magppie Sales: sales@magppie.com');
  console.log('✅ 9 users created successfully\n');

  // Create Organisations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏢 Creating organisations...');
  const askChimps = await prisma.organisation.create({
    data: {
      id: '01KE1XVBMM6VP8QKQ4MBQVMCX5',
      name: 'AskChimps',
      slug: 'askchimps',
      availableIndianChannels: 10,
      availableInternationalChannels: 5,
      chatCredits: 10000,
      callCredits: 15000,
    },
  });

  const sunrooof = await prisma.organisation.create({
    data: {
      id: '01KE1XVBMSP4P5SAXY9QKP1FX0',
      name: 'Sunrooof',
      slug: 'sunrooof',
      availableIndianChannels: 5,
      availableInternationalChannels: 0,
      chatCredits: 437,
      callCredits: 890,
    },
  });

  const magppie = await prisma.organisation.create({
    data: {
      id: '01KE1XVBMZ0TCDAS0EPFGHPVWZ',
      name: 'Magppie',
      slug: 'magppie',
      availableIndianChannels: 5,
      availableInternationalChannels: 0,
      chatCredits: 0,
      callCredits: 2000,
    },
  });

  console.log('   ✓ AskChimps (askchimps)');
  console.log('   ✓ Sunrooof (sunrooof)');
  console.log('   ✓ Magppie (magppie)');
  console.log('✅ 3 organisations created successfully\n');

  // Create User-Organisation relationships
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 Creating user-organisation relationships...');
  await prisma.userOrganisation.create({
    data: {
      userId: superAdmin.id,
      organisationId: askChimps.id,
      role: ROLE.OWNER,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: sunroofOwner.id,
      organisationId: sunrooof.id,
      role: ROLE.OWNER,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: magppieOwner.id,
      organisationId: magppie.id,
      role: ROLE.OWNER,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: sunrooofAIAdmin.id,
      organisationId: sunrooof.id,
      role: ROLE.ADMIN,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: sunrooofMarketing.id,
      organisationId: sunrooof.id,
      role: ROLE.ADMIN,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: sunrooofSales.id,
      organisationId: sunrooof.id,
      role: ROLE.ADMIN,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: magppieAIAdmin.id,
      organisationId: magppie.id,
      role: ROLE.ADMIN,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: magppieMarketing.id,
      organisationId: magppie.id,
      role: ROLE.ADMIN,
    },
  });

  await prisma.userOrganisation.create({
    data: {
      userId: magppieSales.id,
      organisationId: magppie.id,
      role: ROLE.ADMIN,
    },
  });

  console.log('   ✓ Super Admin → AskChimps (OWNER)');
  console.log('   ✓ Sunrooof Owner → Sunrooof (OWNER)');
  console.log('   ✓ Sunrooof AI Admin → Sunrooof (ADMIN)');
  console.log('   ✓ Sunrooof Marketing → Sunrooof (ADMIN)');
  console.log('   ✓ Sunrooof Sales → Sunrooof (ADMIN)');
  console.log('   ✓ Magppie Owner → Magppie (OWNER)');
  console.log('   ✓ Magppie AI Admin → Magppie (ADMIN)');
  console.log('   ✓ Magppie Marketing → Magppie (ADMIN)');
  console.log('   ✓ Magppie Sales → Magppie (ADMIN)');
  console.log('✅ 9 user-organisation relationships created successfully\n');

  // Create Tags
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️  Creating tags...');

  // Sunrooof tags
  const sunrooofHighPriorityTag = await prisma.tag.create({
    data: {
      name: 'High Priority',
      slug: 'high-priority',
      organisationId: sunrooof.id,
    },
  });

  const sunrooofVIPTag = await prisma.tag.create({
    data: {
      name: 'VIP Customer',
      slug: 'vip-customer',
      organisationId: sunrooof.id,
    },
  });

  const sunrooofFollowUpTag = await prisma.tag.create({
    data: {
      name: 'Needs Follow-up',
      slug: 'needs-follow-up',
      organisationId: sunrooof.id,
    },
  });

  // Magppie tags
  const magppieHotLeadTag = await prisma.tag.create({
    data: {
      name: 'Hot Lead',
      slug: 'hot-lead',
      organisationId: magppie.id,
    },
  });

  const magppieQuoteRequestedTag = await prisma.tag.create({
    data: {
      name: 'Quote Requested',
      slug: 'quote-requested',
      organisationId: magppie.id,
    },
  });

  console.log('   ✓ Sunrooof: High Priority, VIP Customer, Needs Follow-up');
  console.log('   ✓ Magppie: Hot Lead, Quote Requested');
  console.log('✅ 5 tags created successfully\n');

  // Create Chat Follow-Up Messages
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 Creating chat follow-up message templates...');

  // Sunrooof follow-up messages
  const sunrooofPaymentReminder = await prisma.chatFollowUpMessages.create({
    data: {
      slug: 'payment-reminder',
      organisationId: sunrooof.id,
      content: 'Hi! Just following up on your payment. Please let us know if you need any assistance with the solar panel installation payment.',
    },
  });

  const sunrooofInstallationUpdate = await prisma.chatFollowUpMessages.create({
    data: {
      slug: 'installation-update',
      organisationId: sunrooof.id,
      content: 'Hello! We wanted to update you on your solar panel installation schedule. Our team will reach out soon with the exact date.',
    },
  });

  // Magppie follow-up messages
  const magppieQuoteFollowUp = await prisma.chatFollowUpMessages.create({
    data: {
      slug: 'quote-follow-up',
      organisationId: magppie.id,
      content: 'Hi! We sent you a quote for our design services. Have you had a chance to review it? Let us know if you have any questions!',
    },
  });

  const magppieProjectUpdate = await prisma.chatFollowUpMessages.create({
    data: {
      slug: 'project-update',
      organisationId: magppie.id,
      content: 'Hello! Just checking in on your design project. Our team is ready to start whenever you are!',
    },
  });

  console.log('   ✓ Sunrooof: Payment Reminder, Installation Update');
  console.log('   ✓ Magppie: Quote Follow-up, Project Update');
  console.log('✅ 4 follow-up message templates created successfully\n');

  // Create Agents
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Creating AI agents...');
  const alexMarketingSunrooofAgent = await prisma.agent.create({
    data: {
      id: '01KEBJ0DS1Z20WMZCK4E0HPJYT',
      name: 'Alex - Marketing Agent',
      type: AGENT_TYPE.MARKETING,
      organisationId: sunrooof.id,
      slug: 'alex-marketing-sunrooof-ai-assistant',
    },
  });

  const dipikaSalesSunrooofAgent = await prisma.agent.create({
    data: {
      id: '01KEBJ0DS7SV0FEAHAT60Q11H2',
      name: 'Dipika - Sales Agent',
      type: AGENT_TYPE.SALES,
      organisationId: sunrooof.id,
      slug: 'dipika-sales-sunrooof-ai-assistant',
    },
  });

  const alexMarketingMagppieAgent = await prisma.agent.create({
    data: {
      id: '01KEBJ0DSB83QJTHSE044YE3S3',
      name: 'Alex - Marketing Agent',
      type: AGENT_TYPE.MARKETING,
      organisationId: magppie.id,
      slug: 'alex-marketing-magppie-ai-assistant',
    },
  });

  const priyaSalesMagppieAgent = await prisma.agent.create({
    data: {
      id: '01KEBJ0DSGY863F1MWMY8NM6P6',
      name: 'Priya - Sales Agent',
      type: AGENT_TYPE.SALES,
      organisationId: magppie.id,
      slug: 'priya-sales-magppie-ai-assistant',
    },
  });

  console.log('   ✓ Alex - Marketing Agent (Sunrooof) [MARKETING]');
  console.log('   ✓ Dipika - Sales Agent (Sunrooof) [SALES]');
  console.log('   ✓ Alex - Marketing Agent (Magppie) [MARKETING]');
  console.log('   ✓ Priya - Sales Agent (Magppie) [SALES]');
  console.log('✅ 4 AI agents created successfully\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 Database Seeding Completed Successfully!');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📊 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   👤 Users: 9`);
  console.log(`   🏢 Organisations: 3 (AskChimps, Sunrooof, Magppie)`);
  console.log(`   🤖 AI Agents: 4 (2 Marketing, 2 Sales)`);
  console.log(`   🔗 User-Organisation Relationships: 9`);

  console.log('🔐 LOGIN CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n   🌟 SUPER ADMIN:');
  console.log('      Email: admin@askchimps.com');
  console.log('      Password: SuperAdmin@123\n');

  console.log('   ☀️  SUNROOOF TEAM:');
  console.log('      Email: admin@sunrooof.com | Password: SunrooofOwner@123 (Owner)');
  console.log('      Email: ai@sunrooof.com | Password: SunrooofAI@123 (Admin)');
  console.log('      Email: marketing@sunrooof.com | Password: MarketingSunrooof@123 (Admin - Marketing)');
  console.log('      Email: sales@sunrooof.com | Password: SalesSunrooof@123 (Admin - Sales)\n');

  console.log('   🎨 MAGPPIE TEAM:');
  console.log('      Email: admin@magppie.com | Password: MagppieOwner@123 (Owner)');
  console.log('      Email: ai@magppie.com | Password: MagppieAI@123 (Admin)');
  console.log('      Email: marketing@magppie.com | Password: MarketingMagppie@123 (Admin - Marketing)');
  console.log('      Email: sales@magppie.com | Password: SalesMagppie@123 (Admin - Sales)\n');

  console.log('🤖 AI AGENTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ☀️  Sunrooof:');
  console.log('      • Alex - Marketing Agent (alex-marketing-sunrooof-ai-assistant) [MARKETING]');
  console.log('      • Dipika - Sales Agent (dipika-sales-sunrooof-ai-assistant) [SALES]\n');
  console.log('   🎨 Magppie:');
  console.log('      • Alex - Marketing Agent (alex-marketing-magppie-ai-assistant) [MARKETING]');
  console.log('      • Priya - Sales Agent (priya-sales-magppie-ai-assistant) [SALES]\n');

  console.log('🏷️  TAGS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ☀️  Sunrooof: High Priority, VIP Customer, Needs Follow-up');
  console.log('   🎨 Magppie: Hot Lead, Quote Requested\n');

  console.log('💬 FOLLOW-UP MESSAGE TEMPLATES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ☀️  Sunrooof: Payment Reminder, Installation Update');
  console.log('   🎨 Magppie: Quote Follow-up, Project Update\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✨ Ready to develop and test all features!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

