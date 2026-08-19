# Multi-Signal Ranking Formula

## Formula
$$\text{Final Score} = S_{\text{Skill}} \times w_{\text{skill}} + S_{\text{Semantic}} \times w_{\text{semantic}} + S_{\text{Reputation}} \times w_{\text{reputation}} + S_{\text{Budget}} \times w_{\text{budget}} + S_{\text{Freshness}} \times w_{\text{freshness}} + S_{\text{ColdStart}} \times w_{\text{coldStart}}$$

## Signal Weights (Default)
- **Skill Overlap ($w_{\text{skill}}$ = 0.35)**: Ratio of matched skills.
- **Semantic Score ($w_{\text{semantic}}$ = 0.20)**: Title and bio category relevance.
- **Reputation ($w_{\text{reputation}}$ = 0.15)**: Star rating (1-5) and verified reviews.
- **Budget Compatibility ($w_{\text{budget}}$ = 0.15)**: Ratio of project budget to freelancer estimated cost.
- **Freshness ($w_{\text{freshness}}$ = 0.10)**: Recency of project post or freelancer update.
- **Cold-Start Boost ($w_{\text{coldStart}}$ = 0.05)**: Boost for verified new talent.
