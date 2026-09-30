"""
Customer Feedback NLP & Sentiment Engine — AVENUE
Performs natural language sentiment classification, aspect mining,
and operational satisfaction scoring on customer feedback.
"""

from __future__ import annotations
import re
from typing import Any
import uuid


POSITIVE_WORDS = {
    "great": 1.0, "excellent": 1.2, "fast": 1.0, "swift": 1.0, "quick": 0.8,
    "friendly": 0.9, "helpful": 0.9, "smooth": 0.8, "polite": 0.8, "courteous": 0.9,
    "efficient": 1.1, "easy": 0.7, "spot on": 1.0, "love": 1.2, "saved": 0.8,
    "recommend": 0.9, "clean": 0.6, "professional": 1.0, "best": 1.2, "awesome": 1.1,
}

NEGATIVE_WORDS = {
    "slow": -1.0, "long": -0.8, "wait": -0.6, "waiting": -0.7, "rude": -1.3,
    "packed": -0.9, "crowded": -0.8, "terrible": -1.4, "horrible": -1.5, "delay": -0.9,
    "delayed": -0.9, "unhelpful": -1.1, "confusing": -0.8, "frustrated": -1.2,
    "annoyed": -1.0, "waste": -1.1, "bad": -1.0, "poor": -1.0, "disappointed": -1.1,
}

THEME_KEYWORDS = {
    "Wait Time": ["wait", "waiting", "queue", "line", "hour", "minutes", "slow", "fast", "swift"],
    "Staff Courtesy": ["staff", "teller", "officer", "polite", "rude", "friendly", "helpful", "courteous"],
    "Service Efficiency": ["process", "speed", "efficient", "delay", "counter", "cycle", "paperwork"],
    "Branch Facility": ["crowded", "packed", "clean", "parking", "branch", "atm", "space"],
    "Digital & App": ["app", "online", "kiosk", "estimate", "token", "digital", "booking"],
}


def analyze_customer_feedback(text: str, branch_code: str = "AV-CENTRAL") -> dict[str, Any]:
    """
    Analyzes customer feedback text using lexicon-based NLP and aspect extraction.
    Returns sentiment score (-1.0 to +1.0), label, key themes, and AI summary.
    """
    clean_text = text.lower()
    words = re.findall(r"\b\w+\b", clean_text)

    score = 0.0
    word_count = len(words)

    # Check for negation in window of 2 words
    negated = False
    for i, word in enumerate(words):
        if word in ["not", "no", "never", "hardly"]:
            negated = True
            continue

        weight = 0.0
        if word in POSITIVE_WORDS:
            weight = POSITIVE_WORDS[word]
        elif word in NEGATIVE_WORDS:
            weight = NEGATIVE_WORDS[word]

        if negated:
            weight = -weight
            negated = False

        score += weight

    # Normalize to -1.0 to 1.0 range
    normalized_score = max(-1.0, min(1.0, score / max(2.5, word_count * 0.35)))

    if normalized_score > 0.15:
        sentiment = "positive"
    elif normalized_score < -0.15:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    # Identify themes
    matched_themes = []
    for theme, keywords in THEME_KEYWORDS.items():
        if any(kw in clean_text for kw in keywords):
            matched_themes.append(theme)

    if not matched_themes:
        matched_themes.append("General Service Experience")

    # Generate AI executive summary
    if sentiment == "positive":
        summary = f"Customer expressed satisfaction praising {', '.join(matched_themes)}. High CSAT contributor."
    elif sentiment == "negative":
        summary = f"Customer noted friction regarding {', '.join(matched_themes)}. Immediate operational review recommended."
    else:
        summary = f"Neutral observation focused on {', '.join(matched_themes)}. Average experience."

    return {
        "feedback_id": f"FB-{uuid.uuid4().hex[:6].upper()}",
        "branch_code": branch_code,
        "sentiment": sentiment,
        "score": round(normalized_score, 2),
        "key_themes": matched_themes,
        "ai_summary": summary,
    }
