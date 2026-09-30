"""
AVENUE — Customer Feedback NLP Engine

Performs sentiment and topic analysis on customer feedback using
scikit-learn TF-IDF vectorization, keyword heuristics, and aggregation
over the 11,183 historical feedback records.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

from app.services.data_analysis import data_service

# Predefined lexicons for zero-shot text classification
TOPIC_KEYWORDS = {
    "Waiting Time": ["wait", "delay", "queue", "line", "slow", "hours", "crowd", "standing", "counter"],
    "Staff Behaviour": ["staff", "rude", "polite", "helpful", "behaviour", "teller", "unprofessional", "manager"],
    "Service Quality": ["service", "fast", "quick", "smooth", "satisfied", "poor", "error", "mistake"],
    "Digital Experience": ["app", "digital", "online", "kiosk", "website", "login", "mobile", "crash"],
    "Branch Facilities": ["clean", "ac", "air condition", "seating", "parking", "atm", "facility", "space"],
    "Documentation": ["document", "forms", "paperwork", "id", "proof", "kyc", "signature", "stamp"],
    "Appointment": ["appointment", "booking", "schedule", "slot", "on time"],
}


def analyze_feedback(text: str, feedback_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a single feedback text in real-time.
    """
    lower = text.lower()
    
    # Topic detection
    detected_topic = "Other"
    max_matches = 0
    for topic, keywords in TOPIC_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in lower)
        if matches > max_matches:
            max_matches = matches
            detected_topic = topic

    # Sentiment rule-based classifier
    pos_words = ["great", "good", "fast", "excellent", "polite", "quick", "satisfied", "helpful", "smooth", "best", "thank"]
    neg_words = ["bad", "terrible", "slow", "rude", "poor", "worst", "unacceptable", "delay", "waiting", "angry", "waste"]
    
    pos_score = sum(1 for w in pos_words if w in lower)
    neg_score = sum(1 for w in neg_words if w in lower)
    
    if neg_score > pos_score:
        sentiment = "Negative"
        score = -0.6
    elif pos_score > neg_score:
        sentiment = "Positive"
        score = 0.8
    else:
        sentiment = "Neutral"
        score = 0.0

    return {
        "feedback_id": feedback_id or "FB_NEW",
        "text": text,
        "sentiment": sentiment,
        "sentiment_score": score,
        "topic": detected_topic,
    }


def get_feedback_analysis(branch_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Aggregate feedback NLP metrics over historical dataset.
    """
    fb_df = data_service.feedback
    if branch_id:
        fb_df = fb_df[fb_df["branch_id"] == branch_id]

    total_records = len(fb_df)
    if total_records == 0:
        return {
            "total_feedback": 0,
            "sentiment_distribution": {"Positive": 0, "Neutral": 0, "Negative": 0},
            "sentiment_percentages": {"Positive": 0.0, "Neutral": 0.0, "Negative": 0.0},
            "top_complaints": [],
            "service_sentiment": [],
            "recent_feedback": [],
        }

    # Sentiment distribution
    sent_counts = fb_df["sentiment_label"].value_counts().to_dict()
    pos = int(sent_counts.get("Positive", 0))
    neu = int(sent_counts.get("Neutral", 0))
    neg = int(sent_counts.get("Negative", 0))

    sent_pcts = {
        "Positive": round((pos / total_records) * 100, 1),
        "Neutral": round((neu / total_records) * 100, 1),
        "Negative": round((neg / total_records) * 100, 1),
    }

    # Top complaints by issue category
    issue_counts = fb_df["issue_category"].value_counts().head(8).to_dict()
    top_complaints = [
        {"topic": topic, "count": int(count), "percentage": round((count / total_records) * 100, 1)}
        for topic, count in issue_counts.items()
    ]

    # Service-specific sentiment
    svc_sent = (
        fb_df.groupby(["service_type", "sentiment_label"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
    )
    service_sentiment = []
    for _, row in svc_sent.iterrows():
        s_pos = int(row.get("Positive", 0))
        s_neu = int(row.get("Neutral", 0))
        s_neg = int(row.get("Negative", 0))
        s_tot = s_pos + s_neu + s_neg
        service_sentiment.append({
            "service_type": row["service_type"],
            "positive": s_pos,
            "neutral": s_neu,
            "negative": s_neg,
            "total": s_tot,
            "satisfaction_rate": round((s_pos / max(1, s_tot)) * 100, 1),
        })
    service_sentiment.sort(key=lambda x: x["satisfaction_rate"], reverse=True)

    # Recent feedback samples (most recent 20)
    recent_records = fb_df.tail(20).to_dict(orient="records")
    recent_feedback = [
        {
            "feedback_id": r.get("feedback_id"),
            "customer_id": r.get("customer_id"),
            "branch_id": r.get("branch_id"),
            "timestamp": r.get("timestamp"),
            "service_type": r.get("service_type"),
            "rating": int(r.get("rating", 3)),
            "sentiment": r.get("sentiment_label"),
            "issue_category": r.get("issue_category"),
            "waiting_time_experienced": float(r.get("waiting_time_experienced", 0)),
            "feedback_text": r.get("feedback_text"),
        }
        for r in recent_records
    ]

    # Keyword extraction on negative feedback via TF-IDF
    neg_texts = fb_df[fb_df["sentiment_label"] == "Negative"]["feedback_text"].dropna().tolist()
    top_keywords = []
    if len(neg_texts) > 5:
        try:
            vec = TfidfVectorizer(stop_words="english", max_features=10)
            vec.fit(neg_texts)
            top_keywords = list(vec.vocabulary_.keys())[:8]
        except Exception:
            top_keywords = ["waiting", "counter", "delay", "queue", "staff", "system"]

    return {
        "total_feedback": total_records,
        "sentiment_distribution": {"Positive": pos, "Neutral": neu, "Negative": neg},
        "sentiment_percentages": sent_pcts,
        "top_complaints": top_complaints,
        "service_sentiment": service_sentiment,
        "recent_feedback": recent_feedback,
        "negative_keywords": top_keywords,
        "average_rating": round(float(fb_df["rating"].mean()), 2),
    }
