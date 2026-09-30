"""
Feedback NLP Module — BranchIQ

Analyzes customer feedback text to extract sentiment and themes.

IMPLEMENTATION STATUS: Placeholder — not yet implemented.

Planned approach:
- Preprocessing: tokenization, stopword removal
- Sentiment scoring: TextBlob (baseline) → transformer model (upgrade path)
- Theme extraction: keyword clustering, topic modeling (LDA)
- Output: FeedbackAnalysis objects with sentiment label and score
"""

from __future__ import annotations


def analyze_feedback(text: str, feedback_id: str | None = None) -> dict:
    """
    Analyze a customer feedback text for sentiment.

    Args:
        text: Raw customer feedback string.
        feedback_id: Optional identifier for the feedback record.

    Returns:
        A dict with keys: feedback_id, text, sentiment, score.

    Raises:
        NotImplementedError: Until the NLP pipeline is implemented.
    """
    raise NotImplementedError(
        "Feedback NLP is not yet implemented. "
        "Implement TextBlob baseline sentiment analysis in this module."
    )
