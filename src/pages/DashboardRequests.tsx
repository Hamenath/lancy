import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc 
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface HireRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  designerId: string;
  designerName: string;
  message: string;
  budget: string;
  timeline: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  createdAt: string;
}

export default function DashboardRequests() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<HireRequest[]>([]);
  const [sent, setSent] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review state for completed proposals
  const [reviewingProposalId, setReviewingProposalId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      // 1. Fetch Incoming Proposals
      const incomingQuery = query(
        collection(db, "hireRequests"),
        where("designerId", "==", user.uid)
      );
      const incomingSnap = await getDocs(incomingQuery);
      const incomingList: HireRequest[] = [];
      incomingSnap.forEach((doc) => {
        const data = doc.data();
        incomingList.push({ id: doc.id, ...data } as HireRequest);
      });
      incomingList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncoming(incomingList);

      // 2. Fetch Sent Proposals
      const sentQuery = query(
        collection(db, "hireRequests"),
        where("clientId", "==", user.uid)
      );
      const sentSnap = await getDocs(sentQuery);
      const sentList: HireRequest[] = [];
      sentSnap.forEach((doc) => {
        const data = doc.data();
        sentList.push({ id: doc.id, ...data } as HireRequest);
      });
      sentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSent(sentList);

    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: "accepted" | "completed" | "rejected") => {
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "hireRequests", id), {
        status: newStatus
      });

      const req = incoming.find((r) => r.id === id) || sent.find((r) => r.id === id);
      if (req) {
        await addDoc(collection(db, "notifications"), {
          userId: req.clientId,
          type: "status_update",
          message: `Your hire proposal to ${req.designerName} was ${newStatus}.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(`Proposal status updated to ${newStatus}.`);
      await fetchRequests();
    } catch (err: any) {
      console.error(err);
      setError("Failed to update proposal status.");
    }
  };

  const handleLeaveReview = async (e: React.FormEvent, proposal: HireRequest) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        designerId: proposal.designerId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || "Client",
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      setSuccess("Thank you for your rating!");
      setComment("");
      setReviewingProposalId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900 flex-col space-y-4">
        <p>Please log in to manage proposals.</p>
        <Link to="/login" className="text-sm text-blue-400 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="w-full px-4 md:px-8 pt-32 pb-12 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Hire Requests & Proposals</h1>
              <p className="text-sm text-neutral-400 mt-1">Manage project proposals, status changes, and reviews</p>
            </div>
            <Link to="/dashboard" className="text-xs text-neutral-400 hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="rounded-none bg-red-950/50 border border-red-900 p-4 text-xs text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-none bg-green-950/50 border border-green-900 p-4 text-xs text-green-400">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-800 border-t-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Incoming Requests Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold border-b border-neutral-900 pb-3">Received Project Offers</h2>
                {incoming.length === 0 ? (
                  <p className="text-neutral-500 text-xs py-6">No project offers received yet.</p>
                ) : (
                  <div className="space-y-6">
                    {incoming.map((req) => (
                      <div key={req.id} className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-none space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-white">{req.clientName}</h3>
                            <span className="text-[10px] text-neutral-500">{req.clientEmail}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border ${
                            req.status === "completed" ? "text-green-400 border-green-950 bg-green-950/10" :
                            req.status === "accepted" ? "text-blue-400 border-blue-950 bg-blue-950/10" :
                            req.status === "rejected" ? "text-red-400 border-red-950 bg-red-950/10" :
                            "text-amber-400 border-amber-950 bg-amber-950/10"
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Project details:</p>
                          <p className="text-xs text-slate-300 leading-relaxed bg-neutral-900/50 p-3 border border-neutral-900">{req.message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400 border-t border-neutral-900 pt-3">
                          <div>
                            <span className="block font-semibold">Budget:</span>
                            <span className="text-white font-bold">${req.budget}</span>
                          </div>
                          <div>
                            <span className="block font-semibold">Timeline:</span>
                            <span className="text-white">{req.timeline}</span>
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        {req.status === "pending" && (
                          <div className="flex gap-3 pt-3 border-t border-neutral-900">
                            <Button 
                              onClick={() => handleUpdateStatus(req.id, "accepted")} 
                              className="flex-1 text-xs py-2 bg-white text-black hover:bg-neutral-200 rounded-none font-bold"
                            >
                              Accept Proposal
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus(req.id, "rejected")} 
                              variant="destructive"
                              className="flex-1 text-xs py-2 rounded-none font-bold"
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        {req.status === "accepted" && (
                          <div className="pt-3 border-t border-neutral-900">
                            <Button 
                              onClick={() => handleUpdateStatus(req.id, "completed")} 
                              className="w-full text-xs py-2 bg-white text-black hover:bg-neutral-200 rounded-none font-bold"
                            >
                              Mark Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold border-b border-neutral-900 pb-3">My Proposals Sent</h2>
                {sent.length === 0 ? (
                  <p className="text-neutral-500 text-xs py-6">You haven't sent any hire proposals yet.</p>
                ) : (
                  <div className="space-y-6">
                    {sent.map((req) => (
                      <div key={req.id} className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-none space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm text-white">To: {req.designerName}</h3>
                            <span className="text-[10px] text-neutral-500">Sent on: {new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border ${
                            req.status === "completed" ? "text-green-400 border-green-950 bg-green-950/10" :
                            req.status === "accepted" ? "text-blue-400 border-blue-950 bg-blue-950/10" :
                            req.status === "rejected" ? "text-red-400 border-red-950 bg-red-950/10" :
                            "text-amber-400 border-amber-950 bg-amber-950/10"
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-350 bg-neutral-900/30 p-3 border border-neutral-900">{req.message}</p>

                        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400 pt-2">
                          <div>
                            <span className="font-semibold">Budget:</span> ${req.budget}
                          </div>
                          <div>
                            <span className="font-semibold">Timeline:</span> {req.timeline}
                          </div>
                        </div>

                        {/* Review Form triggers when completed */}
                        {req.status === "completed" && (
                          <div className="pt-3 border-t border-neutral-900 space-y-3">
                            {reviewingProposalId === req.id ? (
                              <form onSubmit={(e) => handleLeaveReview(e, req)} className="space-y-3 bg-neutral-900/50 p-4 border border-neutral-850">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Rating</label>
                                  <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full bg-neutral-950 text-white border border-neutral-800 text-xs px-2.5 py-1.5 rounded-none"
                                  >
                                    <option value="5">★★★★★ - Excellent</option>
                                    <option value="4">★★★★☆ - Great</option>
                                    <option value="3">★★★☆☆ - Good</option>
                                    <option value="2">★★☆☆☆ - Average</option>
                                    <option value="1">★☆☆☆☆ - Poor</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Comments</label>
                                  <textarea
                                    required
                                    rows={2}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write a feedback comments..."
                                    className="w-full bg-neutral-950 text-white border border-neutral-800 text-xs px-2.5 py-1.5 rounded-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={submittingReview} className="text-[10px] h-8 flex-1 bg-white text-black hover:bg-neutral-200 rounded-none">
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setReviewingProposalId(null)} className="text-[10px] h-8 rounded-none">
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <Button 
                                onClick={() => setReviewingProposalId(req.id)}
                                className="w-full text-xs py-2 bg-white text-black hover:bg-neutral-200 rounded-none font-bold"
                              >
                                Leave Review & Rating
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
