import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Lancy marketplace database...');

  // Create sample client
  const client = await prisma.user.upsert({
    where: { email: 'client@lancy.dev' },
    update: {},
    create: {
      email: 'client@lancy.dev',
      name: 'Sarah Connor',
      role: 'CLIENT',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    },
  });

  // Create sample freelancers
  const freelancer1 = await prisma.user.upsert({
    where: { email: 'alex.design@lancy.dev' },
    update: {},
    create: {
      email: 'alex.design@lancy.dev',
      name: 'Alex Rivera',
      role: 'FREELANCER',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      profile: {
        create: {
          title: 'Senior UI/UX & Brand Designer',
          bio: 'Specializing in high-converting SaaS design systems, modern web apps, and design tokens.',
          hourlyRate: 85,
          location: 'San Francisco, CA',
          skills: 'Figma, Design Systems, React, UI/UX, Tailwind CSS',
          rating: 4.95,
          reviewsCount: 28,
          isVerified: true,
        },
      },
    },
  });

  const freelancer2 = await prisma.user.upsert({
    where: { email: 'dev.marcus@lancy.dev' },
    update: {},
    create: {
      email: 'dev.marcus@lancy.dev',
      name: 'Marcus Chen',
      role: 'FREELANCER',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      profile: {
        create: {
          title: 'Full Stack Engineer (React & NestJS)',
          bio: 'Building scalable microservices, WebSockets, and real-time interactive frontends.',
          hourlyRate: 95,
          location: 'Toronto, Canada',
          skills: 'TypeScript, NestJS, React, PostgreSQL, Docker',
          rating: 5.0,
          reviewsCount: 42,
          isVerified: true,
        },
      },
    },
  });

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform Rebrand & React UI Kit',
      description: 'Looking for a senior product designer and frontend engineer to build a high-fidelity design system.',
      budget: 4500,
      category: 'UI/UX Design',
      imageUrl: 'https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&q=80&w=500',
      clientId: client.id,
    },
  });

  // Create proposal
  await prisma.proposal.create({
    data: {
      projectId: project.id,
      freelancerId: freelancer1.id,
      bidAmount: 4200,
      coverLetter: 'I would love to help design and implement the UI system for your e-commerce platform!',
      status: 'PENDING',
    },
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
