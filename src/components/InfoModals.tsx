import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalContent {
  title: string;
  body: React.ReactNode;
}

export default function InfoModals() {
  const [activeHash, setActiveHash] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const supportedHashes = [
        '#stories', '#fees', '#about', '#careers', '#press', 
        '#blog', '#guides', '#playbooks', '#help', 
        '#privacy', '#terms', '#cookies'
      ];
      if (supportedHashes.includes(hash)) {
        setActiveHash(hash);
        document.body.style.overflow = 'hidden';
      } else {
        setActiveHash(null);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('hashchange', checkHash);
    checkHash(); // Check initial load

    return () => {
      window.removeEventListener('hashchange', checkHash);
      document.body.style.overflow = '';
    };
  }, []);

  const closeModal = () => {
    window.location.hash = '';
  };

  if (!activeHash) return null;

  const contentMap: Record<string, ModalContent> = {
    '#stories': {
      title: "Success Stories",
      body: (
        <div className="space-y-4">
          <p>Read about how world-class startups and creative designers achieve visual goals together on Lanzy.</p>
          <div className="border border-neutral-800 p-4 bg-neutral-900 mt-2">
            <h4 className="font-bold text-white mb-1">LinearFlow hired senior branding lead</h4>
            <p className="text-xs text-slate-400">"Hiring David directly without payment delays or platform commissions saved us over $12,000 in fee structures."</p>
          </div>
          <div className="border border-neutral-800 p-4 bg-neutral-900">
            <h4 className="font-bold text-white mb-1">Amplify Agency scaled UI/UX team</h4>
            <p className="text-xs text-slate-400">"Lanzy is our absolute go-to resource for onboarding top-tier product specialists."</p>
          </div>
        </div>
      )
    },
    '#fees': {
      title: "Fee Structure",
      body: (
        <div className="space-y-4">
          <p className="text-sm">We believe in transparent, direct engagement without intermediaries.</p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-neutral-800 p-4 bg-neutral-900">
              <h4 className="font-bold text-white text-sm">For Designers</h4>
              <p className="text-2xl font-extrabold my-2">0%</p>
              <p className="text-xs text-slate-400">Keep 100% of your earnings. No platform cut.</p>
            </div>
            <div className="border border-neutral-800 p-4 bg-neutral-900">
              <h4 className="font-bold text-white text-sm">For Clients</h4>
              <p className="text-2xl font-extrabold my-2">$0</p>
              <p className="text-xs text-slate-400">No project listing fees or service markups.</p>
            </div>
          </div>
        </div>
      )
    },
    '#about': {
      title: "About Us",
      body: (
        <div className="space-y-4 leading-relaxed">
          <p>Lanzy was founded with a singular mission: to remove the friction between elite creative professionals and modern business teams.</p>
          <p>Traditional freelancer platforms force middlemen rules, delay payments, and extract hefty commissions. We built Lanzy as an open directory based on direct connection, allowing collaboration to happen naturally.</p>
        </div>
      )
    },
    '#careers': {
      title: "Careers",
      body: (
        <div className="space-y-4">
          <p>We are a fully remote team build-testing the future of freelancer collaboration portals.</p>
          <div className="border border-neutral-800 p-4 bg-neutral-900">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm">Frontend React Engineer</span>
              <span className="text-[10px] bg-white text-black px-2 py-0.5">Remote</span>
            </div>
            <p className="text-xs text-slate-400">Help us scale our directory and portfolio interfaces using modern styling tools.</p>
          </div>
        </div>
      )
    },
    '#press': {
      title: "Press Kit",
      body: (
        <div className="space-y-4">
          <p>Official assets, logos, and branding guidelines for publications mentioning Lanzy.</p>
          <div className="border border-neutral-800 p-4 bg-neutral-900 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white text-sm">Brand Logo Assets</h4>
              <p className="text-xs text-slate-400">Includes PNG, SVG, and branding standards.</p>
            </div>
            <a href="/lancylogo.png" download className="text-xs bg-white text-black font-semibold px-4 py-2 hover:bg-slate-200">
              Download
            </a>
          </div>
        </div>
      )
    },
    '#blog': {
      title: "Design Blog",
      body: (
        <div className="space-y-4">
          <p>Read about freelancing guides, layout trends, and pricing tips.</p>
          <article className="border-b border-neutral-900 pb-4">
            <h4 className="font-bold text-white text-sm hover:underline cursor-pointer">Pricing your design work in 2026</h4>
            <p className="text-xs text-slate-400 mt-1">A comprehensive guide on value-based pricing patterns.</p>
          </article>
          <article className="border-b border-neutral-900 pb-4">
            <h4 className="font-bold text-white text-sm hover:underline cursor-pointer">The shift to direct client communication</h4>
            <p className="text-xs text-slate-400 mt-1">Why commission-free networks are replacing standard freelancer apps.</p>
          </article>
        </div>
      )
    },
    '#guides': {
      title: "Freelancer Guides",
      body: (
        <div className="space-y-3">
          <p>Actionable resources to help independent creators structure business terms.</p>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li>Setting up freelance design contracts</li>
            <li>Invoicing your clients internationally</li>
            <li>Structuring project feedback loops</li>
          </ul>
        </div>
      )
    },
    '#playbooks': {
      title: "Hiring Playbooks",
      body: (
        <div className="space-y-3">
          <p>How teams evaluate and recruit world-class creative talents.</p>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li>Structuring high-fidelity branding challenges</li>
            <li>Reviewing design portfolios efficiently</li>
            <li>Negotiating rates for direct hires</li>
          </ul>
        </div>
      )
    },
    '#help': {
      title: "Help Center",
      body: (
        <div className="space-y-4">
          <p>Get quick answers to common questions about direct hiring.</p>
          <div>
            <h4 className="font-bold text-white text-sm">How does Lanzy verify designers?</h4>
            <p className="text-xs text-slate-400 mt-1">We inspect past client projects, Figma structures, and creative details.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Are payments processed through Lanzy?</h4>
            <p className="text-xs text-slate-400 mt-1">No. All payments are handled directly between the client and designer.</p>
          </div>
        </div>
      )
    },
    '#privacy': {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p><strong>Effective Date:</strong> January 1, 2026</p>
          <p>Your privacy is important to us. This privacy policy describes what information Lanzy collects, uses, and shares when you access our freelance marketplace directory.</p>
          <p>We do not store financial transactions or client project payments since all operations occur directly outside the platform. We only process basic account configurations and design portfolio assets you explicitly upload.</p>
        </div>
      )
    },
    '#terms': {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p><strong>Last Updated:</strong> January 1, 2026</p>
          <p>Welcome to Lanzy. By accessing our directory, you agree to these Terms of Service.</p>
          <p>Lanzy is a direct-connect freelancer platform. We provide profile lookups and portfolio discovery. We do not act as an escrow agent, intermediary, or party to any agreements concluded between designers and clients. All engagements, contracting, and payments are strictly the responsibility of the respective parties.</p>
        </div>
      )
    },
    '#cookies': {
      title: "Cookies Settings",
      body: (
        <div className="space-y-4">
          <p>We use essential cookies to maintain sessions and verify login credentials.</p>
          <div className="flex justify-between items-center border border-neutral-900 p-4 bg-neutral-950">
            <div>
              <span className="font-bold text-white text-xs block">Essential Functional Cookies</span>
              <span className="text-[10px] text-slate-400">Required for login sessions. Cannot be turned off.</span>
            </div>
            <span className="text-xs font-bold text-white">Enabled</span>
          </div>
        </div>
      )
    }
  };

  const modal = contentMap[activeHash] || { title: "Information", body: <p>No page found.</p> };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-black border border-neutral-800 w-full max-w-xl text-white rounded-none shadow-premium flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950">
          <h3 className="text-lg font-bold tracking-tight">{modal.title}</h3>
          <button 
            onClick={closeModal} 
            className="text-slate-400 hover:text-white p-1 hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] text-left">
          {modal.body}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-neutral-900 bg-neutral-950 flex justify-end">
          <button 
            onClick={closeModal} 
            className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-5 py-2.5 rounded-none transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
