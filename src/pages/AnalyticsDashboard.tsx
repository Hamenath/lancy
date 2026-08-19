import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BarChart3, TrendingUp, Eye, DollarSign, Award, CheckCircle, FileText, PieChart } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import type { 
  FreelancerAnalytics, 
  ClientAnalytics 
} from "../services/analyticsService";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [freelancerData, setFreelancerData] = useState<FreelancerAnalytics | null>(null);
  const [clientData, setClientData] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadAnalytics() {
      try {
        setLoading(true);
        if ((user as any).role === "CLIENT") {
          const res = await analyticsService.getClientAnalytics();
          if (res) setClientData(res);
        } else {
          const res = await analyticsService.getFreelancerAnalytics();
          if (res) setFreelancerData(res);
        }
      } catch (err) {
        console.error("Error loading analytics dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900">
        <p>Please log in to view your analytics.</p>
      </div>
    );
  }

  const isClient = (user as any).role === "CLIENT";

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-12 border-b border-neutral-900 bg-neutral-950/40">
          <div className="w-full px-4 md:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-4 rounded-none">
                <BarChart3 className="size-3.5" />
                <span>Marketplace Intelligence</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                {isClient ? "Client Spending & Hiring" : "Freelancer Performance & Earnings"} <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Analytics</span>
              </h1>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Real-time marketplace metrics derived from verified proposals, contract milestones, and double-entry financial ledger records.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="w-full px-4 md:px-8 py-8 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800 border-t-white"></div>
            </div>
          ) : isClient && clientData ? (
            <div className="space-y-8">
              {/* Client Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-brand-primary" /> Total Spending
                  </span>
                  <p className="text-2xl font-black text-white">{clientData.metrics.formattedTotalSpending}</p>
                  <p className="text-[10px] text-neutral-400">{clientData.metrics.completedContracts} Completed Contracts</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <FileText className="size-3.5 text-blue-400" /> Projects Posted
                  </span>
                  <p className="text-2xl font-black text-white">{clientData.metrics.projectsPosted}</p>
                  <p className="text-[10px] text-neutral-400">{clientData.metrics.activeProjects} Active Listings</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <CheckCircle className="size-3.5 text-green-400" /> Project Fill Rate
                  </span>
                  <p className="text-2xl font-black text-green-400">{clientData.metrics.projectFillRatePercentage}%</p>
                  <p className="text-[10px] text-neutral-400">{clientData.metrics.totalProposalsReceived} Proposals Received</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-yellow-400" /> Active Contracts
                  </span>
                  <p className="text-2xl font-black text-white">{clientData.metrics.activeContracts}</p>
                  <p className="text-[10px] text-neutral-400">In Progress Work</p>
                </div>
              </div>

              {/* Client Spending Time-Series Breakdown */}
              <div className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-none space-y-4">
                <h3 className="text-sm font-bold tracking-tight border-b border-neutral-900 pb-3 flex items-center gap-2">
                  <PieChart className="size-4 text-brand-primary" /> Monthly Spending History
                </h3>
                {clientData.spendingTimeSeries.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">No settled contract payments recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {clientData.spendingTimeSeries.map((s) => (
                      <div key={s.month} className="flex justify-between items-center p-3 border border-neutral-900 bg-neutral-900/40 font-mono text-xs">
                        <span className="text-neutral-400">{s.month}</span>
                        <span className="font-bold text-white">{s.formattedAmount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : freelancerData ? (
            <div className="space-y-8">
              {/* Freelancer Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-brand-primary" /> Total Net Earnings
                  </span>
                  <p className="text-2xl font-black text-brand-primary">{freelancerData.metrics.formattedTotalEarnings}</p>
                  <p className="text-[10px] text-neutral-400">{freelancerData.metrics.completedContracts} Completed Contracts</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <Eye className="size-3.5 text-blue-400" /> Profile Impressions
                  </span>
                  <p className="text-2xl font-black text-white">{freelancerData.metrics.profileViews}</p>
                  <p className="text-[10px] text-neutral-400">Total Unique Views</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-green-400" /> Proposal Win Rate
                  </span>
                  <p className="text-2xl font-black text-green-400">{freelancerData.metrics.acceptanceRatePercentage}%</p>
                  <p className="text-[10px] text-neutral-400">{freelancerData.metrics.acceptedProposals} of {freelancerData.metrics.totalProposals} Bids Accepted</p>
                </div>
                <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-none space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <Award className="size-3.5 text-yellow-400" /> Client Rating
                  </span>
                  <p className="text-2xl font-black text-white">{freelancerData.metrics.rating.toFixed(1)} ★</p>
                  <p className="text-[10px] text-neutral-400">{freelancerData.metrics.reviewsCount} Verified Reviews</p>
                </div>
              </div>

              {/* Freelancer Earnings Time-Series Breakdown */}
              <div className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-none space-y-4">
                <h3 className="text-sm font-bold tracking-tight border-b border-neutral-900 pb-3 flex items-center gap-2">
                  <PieChart className="size-4 text-brand-primary" /> Monthly Net Earnings History
                </h3>
                {freelancerData.earningsTimeSeries.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">No settled earnings recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {freelancerData.earningsTimeSeries.map((e) => (
                      <div key={e.month} className="flex justify-between items-center p-3 border border-neutral-900 bg-neutral-900/40 font-mono text-xs">
                        <span className="text-neutral-400">{e.month}</span>
                        <span className="font-bold text-brand-primary">{e.formattedAmount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 text-center py-12">No analytics metrics recorded yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
