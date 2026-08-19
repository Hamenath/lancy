import { Injectable } from '@nestjs/common';
import { 
  AIProvider, 
  SkillExtractionResult, 
  ProjectImprovementResult, 
  ProfileImprovementResult, 
  ProposalImprovementResult 
} from './ai-provider.interface';

@Injectable()
export class MockAIProvider implements AIProvider {
  name = 'MOCK';

  async extractSkills(text: string): Promise<SkillExtractionResult> {
    const textLower = text.toLowerCase();
    const skillsList = [
      'React', 'TypeScript', 'Node.js', 'Figma', 'UI/UX', 'PostgreSQL', 
      'NestJS', 'Tailwind CSS', 'Python', 'Docker', 'GraphQL', 'Next.js'
    ];

    const detected = skillsList.filter(s => textLower.includes(s.toLowerCase()));
    const skills = (detected.length > 0 ? detected : ['React', 'TypeScript', 'UI/UX']).map(name => ({
      name,
      confidence: 0.92,
    }));

    return {
      skills,
      category: textLower.includes('design') ? 'Design & Creative' : 'Development & IT',
      experienceLevel: 'INTERMEDIATE',
    };
  }

  async improveProject(title: string, description: string): Promise<ProjectImprovementResult> {
    return {
      title: title.length > 5 ? title : `Professional ${title} Project`,
      description: `${description.trim()}\n\nKey Deliverables:\n- Production ready codebase\n- Responsive UI & Clean Architecture\n- Comprehensive documentation & unit tests`,
      suggestedSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      suggestedDeliverables: [
        'Responsive Web Application',
        'RESTful API Endpoints',
        'Database Schema & Migrations',
        'Deployment Documentation'
      ],
    };
  }

  async improveProfile(headline: string, bio: string, skills: string[]): Promise<ProfileImprovementResult> {
    return {
      headline: headline || 'Senior Full-Stack Engineer & Product Specialist',
      bio: bio ? `${bio.trim()}\n\nSpecialized in building scalable marketplace applications with modern web technologies.` : 'Passionate full-stack developer committed to delivering high-performance, clean code solutions.',
      suggestedSkills: Array.from(new Set([...skills, 'TypeScript', 'Clean Architecture', 'System Design'])),
      recommendations: [
        'Add quantitative achievements to your bio (e.g. reduced load times by 40%).',
        'Include links to verified open-source contributions.',
        'Specify your preferred team communication channels.'
      ],
    };
  }

  async improveProposal(
    projectDescription: string, 
    coverLetter: string, 
    userBio?: string, 
    userSkills: string[] = []
  ): Promise<ProposalImprovementResult> {
    const verifiedSkillsStr = userSkills.length > 0 ? userSkills.join(', ') : 'React & Node.js';
    return {
      suggestedDraft: `Hi,\n\nI reviewed your project requirement: "${projectDescription.slice(0, 80)}...". Based on my verified background in ${verifiedSkillsStr}, I am confident I can deliver high-quality results efficiently.\n\n${coverLetter.trim()}\n\nI look forward to discussing the project milestones with you.`,
      keyHighlights: [
        `Verified experience in ${verifiedSkillsStr}`,
        'Commitment to clean architecture & timely milestone deliveries'
      ],
      suggestedQuestions: [
        'What is your target timeline for the initial milestone launch?',
        'Do you have specific design assets or Figma specifications ready?'
      ],
    };
  }

  async chat(prompt: string, context?: string): Promise<string> {
    return `Hello! As Lancy AI Assistant, I can help you with hiring, project descriptions, proposal optimization, and marketplace rules. Context: "${context || 'General Lancy Guidance'}". How can I assist your workflow today?`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic pseudo-random float vector of dimension 16 for mock testing
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const vector: number[] = [];
    for (let i = 0; i < 16; i++) {
      const val = Math.sin(hash + i);
      vector.push(Number(val.toFixed(4)));
    }
    return vector;
  }
}
