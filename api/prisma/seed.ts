import {
    PrismaClient,
    ROLE,
    CHAT_SOURCE,
    CHAT_STATUS,
    CHAT_MESSAGE_TYPE,
    AGENT_TYPE,
    EXECUTION_TYPE,
    CALL_STATUS,
    SENTIMENT,
} from '@prisma/client';
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

    console.log(
        '═══════════════════════════════════════════════════════════════',
    );
    console.log('🌱 Starting AskChimps Database Seed');
    console.log(
        '═══════════════════════════════════════════════════════════════',
    );
    console.log(
        '💡 Tip: Run "npm run db:reset" to reset the entire database and reseed',
    );
    console.log('⏱️  This may take a few moments...\n');

    // Clean up existing data
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('🧹 Cleaning up existing data...');
    await prisma.chatMessage.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.chatFollowUpMessages.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.agent.deleteMany({});
    await prisma.userOrganisation.deleteMany({});
    await prisma.organisation.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Cleanup completed\n');

    // Hash passwords
    const superAdminhashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    const sunrooofOwnerhashedPassword = await bcrypt.hash(
        'SunrooofOwner@123',
        10,
    );
    const magppieOwnerhashedPassword = await bcrypt.hash(
        'MagppieOwner@123',
        10,
    );
    const sunrooofAIAdminHashedPassword = await bcrypt.hash(
        'SunrooofAI@123',
        10,
    );
    const sunrooofMarketingHashedPassword = await bcrypt.hash(
        'MarketingSunrooof@123',
        10,
    );
    const sunrooofSalesHashedPassword = await bcrypt.hash(
        'SalesSunrooof@123',
        10,
    );
    const magppieAIAdminHashedPassword = await bcrypt.hash('MagppieAI@123', 10);
    const magppieMarketingHashedPassword = await bcrypt.hash(
        'MarketingMagppie@123',
        10,
    );
    const magppieSalesHashedPassword = await bcrypt.hash(
        'SalesMagppie@123',
        10,
    );

    // Create Users
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
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
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
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
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
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
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
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
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('💬 Creating chat follow-up message templates...');

    // Sunrooof follow-up messages
    const sunrooofPaymentReminder = await prisma.chatFollowUpMessages.create({
        data: {
            slug: 'payment-reminder',
            organisationId: sunrooof.id,
            content:
                'Hi! Just following up on your payment. Please let us know if you need any assistance with the solar panel installation payment.',
        },
    });

    const sunrooofInstallationUpdate = await prisma.chatFollowUpMessages.create(
        {
            data: {
                slug: 'installation-update',
                organisationId: sunrooof.id,
                content:
                    'Hello! We wanted to update you on your solar panel installation schedule. Our team will reach out soon with the exact date.',
            },
        },
    );

    // Magppie follow-up messages
    const magppieQuoteFollowUp = await prisma.chatFollowUpMessages.create({
        data: {
            slug: 'quote-follow-up',
            organisationId: magppie.id,
            content:
                'Hi! We sent you a quote for our design services. Have you had a chance to review it? Let us know if you have any questions!',
        },
    });

    const magppieProjectUpdate = await prisma.chatFollowUpMessages.create({
        data: {
            slug: 'project-update',
            organisationId: magppie.id,
            content:
                'Hello! Just checking in on your design project. Our team is ready to start whenever you are!',
        },
    });

    console.log('   ✓ Sunrooof: Payment Reminder, Installation Update');
    console.log('   ✓ Magppie: Quote Follow-up, Project Update');
    console.log('✅ 4 follow-up message templates created successfully\n');

    // Create Agents
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
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

    // Create Leads
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('👥 Creating leads...');

    // Sunrooof leads
    const sunrooofLead1 = await prisma.lead.create({
        data: {
            organisationId: sunrooof.id,
            agentId: alexMarketingSunrooofAgent.id,
            firstName: 'Amit',
            lastName: 'Patel',
            phone: '+919876543210',
            email: 'amit.patel@example.com',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
        },
    });

    const sunrooofLead2 = await prisma.lead.create({
        data: {
            organisationId: sunrooof.id,
            agentId: dipikaSalesSunrooofAgent.id,
            firstName: 'Sneha',
            lastName: 'Reddy',
            phone: '+919876543211',
            email: 'sneha.reddy@example.com',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
        },
    });

    const sunrooofLead3 = await prisma.lead.create({
        data: {
            organisationId: sunrooof.id,
            agentId: alexMarketingSunrooofAgent.id,
            firstName: 'Rahul',
            lastName: 'Sharma',
            phone: '+919876543212',
            email: 'rahul.sharma@example.com',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
        },
    });

    const sunrooofLead4 = await prisma.lead.create({
        data: {
            organisationId: sunrooof.id,
            agentId: dipikaSalesSunrooofAgent.id,
            firstName: 'Priya',
            lastName: 'Nair',
            phone: '+919876543213',
            email: 'priya.nair@example.com',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
        },
    });

    const sunrooofLead5 = await prisma.lead.create({
        data: {
            organisationId: sunrooof.id,
            agentId: alexMarketingSunrooofAgent.id,
            firstName: 'Vikram',
            lastName: 'Singh',
            phone: '+919876543214',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
        },
    });

    // Magppie leads
    const magppieLead1 = await prisma.lead.create({
        data: {
            organisationId: magppie.id,
            agentId: alexMarketingMagppieAgent.id,
            firstName: 'Ananya',
            lastName: 'Gupta',
            phone: '+919876543215',
            email: 'ananya.gupta@example.com',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
        },
    });

    const magppieLead2 = await prisma.lead.create({
        data: {
            organisationId: magppie.id,
            agentId: priyaSalesMagppieAgent.id,
            firstName: 'Rohan',
            lastName: 'Mehta',
            phone: '+919876543216',
            email: 'rohan.mehta@example.com',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
        },
    });

    const magppieLead3 = await prisma.lead.create({
        data: {
            organisationId: magppie.id,
            agentId: alexMarketingMagppieAgent.id,
            firstName: 'Kavya',
            lastName: 'Iyer',
            phone: '+919876543217',
            email: 'kavya.iyer@example.com',
            city: 'Kochi',
            state: 'Kerala',
            country: 'India',
        },
    });

    const magppieLead4 = await prisma.lead.create({
        data: {
            organisationId: magppie.id,
            agentId: priyaSalesMagppieAgent.id,
            firstName: 'Arjun',
            lastName: 'Desai',
            phone: '+919876543218',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
        },
    });

    console.log('   ✓ Sunrooof: 5 leads created');
    console.log('   ✓ Magppie: 4 leads created');
    console.log('✅ 9 leads created successfully\n');

    // Create Chats
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('💬 Creating chats...');

    // Sunrooof chats
    const sunrooofChat1 = await prisma.chat.create({
        data: {
            organisationId: sunrooof.id,
            agentId: alexMarketingSunrooofAgent.id,
            leadId: sunrooofLead1.id,
            name: 'Solar Panel Inquiry - Amit Patel',
            source: CHAT_SOURCE.WHATSAPP,
            sourceId: 'wa_' + sunrooofLead1.phone,
            status: CHAT_STATUS.OPEN,
            shortSummary:
                'Customer inquiring about solar panel installation for residential property in Mumbai.',
            detailedSummary:
                'Amit Patel contacted us via WhatsApp to inquire about solar panel installation for his 3BHK apartment in Mumbai. He is interested in reducing electricity bills and wants to know about government subsidies, installation timeline, and maintenance costs. He mentioned his monthly electricity bill is around ₹8,000 and he wants to achieve 70-80% savings.',
        },
    });

    const sunrooofChat2 = await prisma.chat.create({
        data: {
            organisationId: sunrooof.id,
            agentId: dipikaSalesSunrooofAgent.id,
            leadId: sunrooofLead2.id,
            name: 'Follow-up: Installation Schedule - Sneha Reddy',
            source: CHAT_SOURCE.WHATSAPP,
            sourceId: 'wa_' + sunrooofLead2.phone,
            status: CHAT_STATUS.PENDING,
            shortSummary:
                'Customer waiting for installation schedule confirmation.',
            detailedSummary:
                'Sneha Reddy has already paid the advance and is waiting for the installation team to confirm the exact date. She prefers weekends for installation and wants to ensure minimal disruption to her daily routine. The technical team has completed the site survey and approved the installation plan.',
        },
    });

    const sunrooofChat3 = await prisma.chat.create({
        data: {
            organisationId: sunrooof.id,
            agentId: alexMarketingSunrooofAgent.id,
            leadId: sunrooofLead3.id,
            name: 'Commercial Solar Solution - Rahul Sharma',
            source: CHAT_SOURCE.INSTAGRAM,
            sourceId: 'ig_rahul_sharma_delhi',
            status: CHAT_STATUS.NEW,
            shortSummary:
                'Business owner interested in commercial solar installation.',
            detailedSummary:
                'Rahul Sharma owns a small manufacturing unit in Delhi and wants to install solar panels to reduce operational costs. He is looking for a 50kW system and wants to understand ROI, financing options, and tax benefits. He mentioned that his current monthly electricity expense is around ₹2.5 lakhs.',
        },
    });

    const sunrooofChat4 = await prisma.chat.create({
        data: {
            organisationId: sunrooof.id,
            agentId: dipikaSalesSunrooofAgent.id,
            leadId: sunrooofLead4.id,
            name: 'Post-Installation Support - Priya Nair',
            source: CHAT_SOURCE.WHATSAPP,
            sourceId: 'wa_' + sunrooofLead4.phone,
            status: CHAT_STATUS.CLOSED,
            shortSummary: 'Customer requesting post-installation support.',
            detailedSummary:
                'Priya Nair had solar panels installed 2 months ago and is very satisfied with the performance. She reached out to understand how to monitor the system performance and had a question about cleaning the panels. Our support team provided her with the mobile app details and scheduled a free maintenance check.',
        },
    });

    // Magppie chats
    const magppieChat1 = await prisma.chat.create({
        data: {
            organisationId: magppie.id,
            agentId: alexMarketingMagppieAgent.id,
            leadId: magppieLead1.id,
            name: 'Website Design Inquiry - Ananya Gupta',
            source: CHAT_SOURCE.INSTAGRAM,
            sourceId: 'ig_ananya_gupta_hyd',
            status: CHAT_STATUS.OPEN,
            shortSummary: 'Customer interested in website design for startup.',
            detailedSummary:
                'Ananya Gupta is launching a new e-commerce startup in Hyderabad and needs a modern, responsive website. She wants to see our portfolio, understand the timeline (preferably within 6 weeks), and get a detailed quote. She mentioned her budget is around ₹1.5-2 lakhs and she needs SEO optimization included.',
        },
    });

    const magppieChat2 = await prisma.chat.create({
        data: {
            organisationId: magppie.id,
            agentId: priyaSalesMagppieAgent.id,
            leadId: magppieLead2.id,
            name: 'Branding Package - Rohan Mehta',
            source: CHAT_SOURCE.WHATSAPP,
            sourceId: 'wa_' + magppieLead2.phone,
            status: CHAT_STATUS.PENDING,
            shortSummary: 'Customer reviewing branding package proposal.',
            detailedSummary:
                'Rohan Mehta runs a boutique hotel in Ahmedabad and wants a complete branding package including logo design, business cards, brochures, and social media templates. We sent him a detailed proposal with 3 design concepts. He is reviewing it with his partners and will get back to us by end of this week.',
        },
    });

    const magppieChat3 = await prisma.chat.create({
        data: {
            organisationId: magppie.id,
            agentId: alexMarketingMagppieAgent.id,
            leadId: magppieLead3.id,
            name: 'Social Media Management - Kavya Iyer',
            source: CHAT_SOURCE.INSTAGRAM,
            sourceId: 'ig_kavya_iyer_kochi',
            status: CHAT_STATUS.NEW,
            shortSummary:
                'Customer inquiring about social media management services.',
            detailedSummary:
                'Kavya Iyer owns a boutique clothing store in Kochi and wants to improve her social media presence. She is looking for monthly social media management services including content creation, posting schedule, and engagement management for Instagram and Facebook. She wants to see case studies and pricing options.',
        },
    });

    console.log('   ✓ Sunrooof: 4 chats created');
    console.log('   ✓ Magppie: 3 chats created');
    console.log('✅ 7 chats created successfully\n');

    // Create Chat Messages
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('💭 Creating chat messages...');

    // Messages for sunrooofChat1 (Solar Panel Inquiry)
    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat1.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hi, I am interested in installing solar panels for my apartment in Mumbai. Can you help me?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat1.id,
            organisationId: sunrooof.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Amit! Thank you for reaching out to Sunrooof. I would be happy to help you with solar panel installation. To provide you with the best solution, could you please share: 1) Your apartment size (in sq ft), 2) Your average monthly electricity bill, and 3) Your preferred installation timeline?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat1.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'My apartment is around 1200 sq ft, 3BHK. Monthly bill is around ₹8,000. I want to install as soon as possible.',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat1.id,
            organisationId: sunrooof.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Perfect! For a 1200 sq ft apartment with ₹8,000 monthly bill, I recommend a 3-4 kW solar system. This can reduce your electricity bill by 70-80%. The installation typically takes 2-3 days. You are also eligible for government subsidies up to 40%. Would you like me to schedule a free site survey?',
        },
    });

    // Messages for sunrooofChat2 (Installation Schedule)
    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat2.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hi, I paid the advance last week. When will the installation team come?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat2.id,
            organisationId: sunrooof.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Sneha! Thank you for your payment. Our technical team has completed the site survey and approved your installation plan. We can schedule the installation for this weekend (Saturday or Sunday). Which day works better for you?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat2.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content: 'Sunday would be perfect. What time will the team arrive?',
        },
    });

    // Messages for sunrooofChat3 (Commercial Solar)
    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat3.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'I saw your Instagram post about commercial solar solutions. I need a 50kW system for my manufacturing unit.',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat3.id,
            organisationId: sunrooof.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Rahul! Great to hear from you. A 50kW commercial solar system is an excellent investment. For your manufacturing unit, we can provide: 1) Complete turnkey solution, 2) ROI within 3-4 years, 3) Accelerated depreciation benefits, 4) Net metering facility. Could you share your current monthly electricity expense and available rooftop area?',
        },
    });

    // Messages for sunrooofChat4 (Post-Installation Support)
    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat4.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hi, I got the solar panels installed 2 months ago. How do I check the performance? Also, do I need to clean the panels?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat4.id,
            organisationId: sunrooof.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Priya! Great to hear from you. You can monitor your system performance through our Sunrooof mobile app (download link: sunrooof.com/app). For panel cleaning, we recommend cleaning once every 2-3 months. I have scheduled a free maintenance check for you next week. Our technician will clean the panels and check the system performance.',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: sunrooofChat4.id,
            organisationId: sunrooof.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content: 'Perfect! Thank you so much for the excellent support.',
        },
    });

    // Messages for magppieChat1 (Website Design)
    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat1.id,
            organisationId: magppie.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hi, I am launching an e-commerce startup and need a website. Can you share your portfolio and pricing?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat1.id,
            organisationId: magppie.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Ananya! Congratulations on your new startup! We would love to help you build a stunning e-commerce website. You can view our portfolio at magppie.com/portfolio. For e-commerce websites, our packages start from ₹1.5 lakhs and include: responsive design, payment gateway integration, product catalog, SEO optimization, and 6 months support. Timeline is typically 6-8 weeks. Would you like to schedule a call to discuss your requirements?',
        },
    });

    // Messages for magppieChat2 (Branding Package)
    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat2.id,
            organisationId: magppie.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hi, I received your branding proposal. The designs look great! I am discussing with my partners and will confirm by Friday.',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat2.id,
            organisationId: magppie.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Thank you so much, Rohan! We are glad you liked the design concepts. Take your time to discuss with your partners. If you have any questions or need any modifications, feel free to reach out. Looking forward to working with you!',
        },
    });

    // Messages for magppieChat3 (Social Media Management)
    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat3.id,
            organisationId: magppie.id,
            role: 'user',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'I need help with social media for my boutique store. Can you manage Instagram and Facebook?',
        },
    });

    await prisma.chatMessage.create({
        data: {
            chatId: magppieChat3.id,
            organisationId: magppie.id,
            role: 'assistant',
            type: CHAT_MESSAGE_TYPE.TEXT,
            content:
                'Hello Kavya! Absolutely! We offer comprehensive social media management services for Instagram and Facebook. Our packages include: content creation (posts, stories, reels), posting schedule (3-5 posts per week), engagement management, and monthly analytics reports. Pricing starts from ₹15,000/month. Would you like to see some case studies from our fashion and retail clients?',
        },
    });

    console.log('   ✓ Sunrooof chats: 11 messages created');
    console.log('   ✓ Magppie chats: 6 messages created');
    console.log('✅ 17 chat messages created successfully\n');

    console.log(
        '═══════════════════════════════════════════════════════════════',
    );
    console.log('🎉 Database Seeding Completed Successfully!');
    console.log(
        '═══════════════════════════════════════════════════════════════\n',
    );

    console.log('📊 SUMMARY:');
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log(`   👤 Users: 9`);
    console.log(`   🏢 Organisations: 3 (AskChimps, Sunrooof, Magppie)`);
    console.log(`   🤖 AI Agents: 4 (2 Marketing, 2 Sales)`);
    console.log(`   🔗 User-Organisation Relationships: 9`);
    console.log(`   👥 Leads: 9 (5 Sunrooof, 4 Magppie)`);
    console.log(`   💬 Chats: 7 (4 Sunrooof, 3 Magppie)`);
    console.log(`   💭 Chat Messages: 17 (11 Sunrooof, 6 Magppie)`);
    console.log(`   🏷️  Tags: 5`);
    console.log(`   📝 Follow-up Message Templates: 4`);

    console.log('🔐 LOGIN CREDENTIALS:');
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('\n   🌟 SUPER ADMIN:');
    console.log('      Email: admin@askchimps.com');
    console.log('      Password: SuperAdmin@123\n');

    console.log('   ☀️  SUNROOOF TEAM:');
    console.log(
        '      Email: admin@sunrooof.com | Password: SunrooofOwner@123 (Owner)',
    );
    console.log(
        '      Email: ai@sunrooof.com | Password: SunrooofAI@123 (Admin)',
    );
    console.log(
        '      Email: marketing@sunrooof.com | Password: MarketingSunrooof@123 (Admin - Marketing)',
    );
    console.log(
        '      Email: sales@sunrooof.com | Password: SalesSunrooof@123 (Admin - Sales)\n',
    );

    console.log('   🎨 MAGPPIE TEAM:');
    console.log(
        '      Email: admin@magppie.com | Password: MagppieOwner@123 (Owner)',
    );
    console.log(
        '      Email: ai@magppie.com | Password: MagppieAI@123 (Admin)',
    );
    console.log(
        '      Email: marketing@magppie.com | Password: MarketingMagppie@123 (Admin - Marketing)',
    );
    console.log(
        '      Email: sales@magppie.com | Password: SalesMagppie@123 (Admin - Sales)\n',
    );

    console.log('🤖 AI AGENTS:');
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('   ☀️  Sunrooof:');
    console.log(
        '      • Alex - Marketing Agent (alex-marketing-sunrooof-ai-assistant) [MARKETING]',
    );
    console.log(
        '      • Dipika - Sales Agent (dipika-sales-sunrooof-ai-assistant) [SALES]\n',
    );
    console.log('   🎨 Magppie:');
    console.log(
        '      • Alex - Marketing Agent (alex-marketing-magppie-ai-assistant) [MARKETING]',
    );
    console.log(
        '      • Priya - Sales Agent (priya-sales-magppie-ai-assistant) [SALES]\n',
    );

    console.log('🏷️  TAGS:');
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log(
        '   ☀️  Sunrooof: High Priority, VIP Customer, Needs Follow-up',
    );
    console.log('   🎨 Magppie: Hot Lead, Quote Requested\n');

    console.log('💬 FOLLOW-UP MESSAGE TEMPLATES:');
    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    );
    console.log('   ☀️  Sunrooof: Payment Reminder, Installation Update');
    console.log('   🎨 Magppie: Quote Follow-up, Project Update\n');

    console.log(
        '═══════════════════════════════════════════════════════════════',
    );
    console.log('✨ Ready to develop and test all features!');
    console.log(
        '═══════════════════════════════════════════════════════════════\n',
    );
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
