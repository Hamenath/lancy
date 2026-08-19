import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Lancy deterministic database seeding...');

  // 1. Create Demo Users
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@lancy.dev' },
    update: {},
    create: {
      email: 'client@lancy.dev',
      name: 'Jordan Lee (Demo Client)',
      role: 'CLIENT',
      status: 'ACTIVE',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const freelancerUser = await prisma.user.upsert({
    where: { email: 'freelancer@lancy.dev' },
    update: {},
    create: {
      email: 'freelancer@lancy.dev',
      name: 'Alex Morgan (Demo Freelancer)',
      role: 'FREELANCER',
      status: 'ACTIVE',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      profile: {
        create: {
          title: 'Senior Full-Stack Engineer & Architect',
          bio: 'Specialized in building high-performance marketplace applications with NestJS, React, TypeScript, and PostgreSQL.',
          hourlyRate: 85,
          location: 'San Francisco, CA (Remote)',
          skills: 'React, TypeScript, Node.js, NestJS, PostgreSQL, Figma, UI/UX',
          rating: 4.9,
          reviewsCount: 12,
          isVerified: true,
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lancy.dev' },
    update: {},
    create: {
      email: 'admin@lancy.dev',
      name: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Create Demo Project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      title: 'Build a Modern Next.js Freelancer Dashboard',
      description: 'Looking for an experienced full-stack engineer to build a high-performance, dark-themed marketplace dashboard with real-time WebSocket messaging and financial analytics.',
      budget: 3500,
      currency: 'USD',
      category: 'Development & IT',
      projectType: 'FIXED_PRICE',
      experienceLevel: 'EXPERT',
      skills: 'React, TypeScript, Next.js, Node.js, Tailwind CSS',
      status: 'OPEN',
      clientId: clientUser.id,
    },
  });

  // 3. Create Demo Proposal
  const proposal = await prisma.proposal.upsert({
    where: { id: 'demo-proposal-1' },
    update: {},
    create: {
      id: 'demo-proposal-1',
      projectId: project.id,
      freelancerId: freelancerUser.id,
      bidAmount: 3500,
      estimatedDays: 14,
      coverLetter: 'Hi Jordan,\n\nI have extensive experience building scalable marketplace platforms using React, TypeScript, and NestJS. I can deliver a clean, production-ready dashboard within 14 days.',
      status: 'ACCEPTED',
    },
  });

  // 4. Create Demo Contract & Milestones
  const contract = await prisma.contract.upsert({
    where: { id: 'demo-contract-1' },
    update: {},
    create: {
      id: 'demo-contract-1',
      projectId: project.id,
      proposalId: proposal.id,
      clientId: clientUser.id,
      freelancerId: freelancerUser.id,
      title: 'Build a Modern Next.js Freelancer Dashboard',
      description: 'Contract for full-stack marketplace dashboard development.',
      agreedAmount: 3500,
      currency: 'USD',
      status: 'ACTIVE',
      milestones: {
        create: [
          {
            title: 'UI Design & Component Architecture',
            description: 'Deliver core React components and responsive layout.',
            amount: 1500,
            status: 'APPROVED',
            paymentStatus: 'PAID',
          },
          {
            title: 'API Integration & Analytics',
            description: 'Integrate NestJS backend REST APIs and time-series charts.',
            amount: 2000,
            status: 'IN_PROGRESS',
            paymentStatus: 'UNPAID',
          },
        ],
      },
    },
  });

  console.log('✅ Deterministic seeding complete!');
  console.log(`- Demo Client: client@lancy.dev`);
  console.log(`- Demo Freelancer: freelancer@lancy.dev`);
  console.log(`- Demo Admin: admin@lancy.dev`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
