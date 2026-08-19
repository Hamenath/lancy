# Lancy Product Demonstration Script (5-Minute Walkthrough)

## Demo Setup
1. Run `npm run db:seed` in `backend/`.
2. Login as Client: `client@lancy.dev`
3. Login as Freelancer: `freelancer@lancy.dev`

## Step-by-Step Flow
1. **Client Project Creation**:
   - Navigate to `/add-project`.
   - Click **"Improve with AI"** to generate project description & deliverables.
   - Publish project.
2. **AI Candidate Matching**:
   - View recommended freelancers on the published project page with AI match scores & reasons.
3. **Freelancer Proposal Submission**:
   - Log in as Freelancer.
   - Click **"Improve Proposal"** to generate fact-grounded cover letter draft.
   - Submit proposal.
4. **Contract Milestone Milestone Approval & Ledger**:
   - Accept proposal as Client $\rightarrow$ Contract created.
   - Freelancer submits milestone $\rightarrow$ Client approves $\rightarrow$ Payment processed to double-entry ledger.
5. **Real-Time Analytics & Admin Moderation**:
   - View `/dashboard/analytics` for earnings time-series.
   - View `/admin` for platform GMV and audit logs.
