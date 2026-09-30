"""
AVENUE — Demand Forecasting Model Training

Trains XGBoost regressors for:
  A. Branch-level hourly demand (primary)
  B. Service-level hourly demand (secondary)

Pipeline:
  1. Build feature matrix via features.py
  2. Chronological train/val/test split (NO random shuffling)
  3. Train baseline (same-hour 7-day rolling mean)
  4. Train XGBoost model
  5. Evaluate on test set
  6. Save models and evaluation report

Usage:
    cd avenue/backend
    python -m ml.train_demand_model
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

# Allow running from project root
_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))

from ml.features import (
    build_hourly_branch_features,
    build_service_level_features,
    BRANCH_FEATURE_COLS,
    SERVICE_FEATURE_COLS,
    TARGET_COL,
    TRAIN_END_DATE,
    VAL_END_DATE,
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)


# ─── Metrics helpers ──────────────────────────────────────────────────────────

def _mape(y_true: np.ndarray, y_pred: np.ndarray) -> float | None:
    """MAPE only when no zero-valued actuals exist (avoids division by zero)."""
    mask = y_true > 0
    if mask.sum() == 0:
        return None
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def _metrics(y_true: np.ndarray, y_pred: np.ndarray, label: str) -> dict:
    mae  = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2   = float(r2_score(y_true, y_pred))
    mape = _mape(y_true, y_pred)
    print(f"  [{label}] MAE={mae:.3f} RMSE={rmse:.3f} R²={r2:.3f}" +
          (f" MAPE={mape:.1f}%" if mape is not None else " MAPE=N/A"))
    result = {"MAE": round(mae, 4), "RMSE": round(rmse, 4), "R2": round(r2, 4)}
    if mape is not None:
        result["MAPE_pct"] = round(mape, 2)
    return result


# ─── Branch-level model ───────────────────────────────────────────────────────

def train_branch_model() -> dict:
    """Train XGBoost on branch-level hourly demand. Returns evaluation report."""
    print("Building branch-level feature matrix...")
    df = build_hourly_branch_features()

    # Drop rows where all lag features are NaN (first few rows per branch)
    df = df.dropna(subset=["lag_1h"]).copy()

    # Chronological split
    train = df[df["date"] <= TRAIN_END_DATE]
    val   = df[(df["date"] > TRAIN_END_DATE) & (df["date"] <= VAL_END_DATE)]
    test  = df[df["date"] > VAL_END_DATE]

    print(f"  Train: {train['date'].min()} -> {train['date'].max()} ({len(train)} rows)")
    print(f"  Val:   {val['date'].min()} -> {val['date'].max()} ({len(val)} rows)")
    print(f"  Test:  {test['date'].min()} -> {test['date'].max()} ({len(test)} rows)")

    # Guard: ensure feature columns exist
    available_feats = [c for c in BRANCH_FEATURE_COLS if c in df.columns]
    missing = set(BRANCH_FEATURE_COLS) - set(available_feats)
    if missing:
        print(f"  WARNING: Missing features (will skip): {missing}")

    X_train = train[available_feats].values
    y_train = train[TARGET_COL].values
    X_val   = val[available_feats].values
    y_val   = val[TARGET_COL].values
    X_test  = test[available_feats].values
    y_test  = test[TARGET_COL].values

    # ── Baseline: rolling 7-day mean of same hour ────────────────────────────
    print("Evaluating baseline (rolling 7-day mean)...")
    base_pred_val  = val["rolling_mean_7d"].values
    base_pred_test = test["rolling_mean_7d"].values
    base_metrics_val  = _metrics(y_val,  np.maximum(0, base_pred_val),  "Baseline/Val")
    base_metrics_test = _metrics(y_test, np.maximum(0, base_pred_test), "Baseline/Test")

    # ── XGBoost ─────────────────────────────────────────────────────────────
    print("Training XGBoost branch model...")
    model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    xgb_pred_val  = np.maximum(0, model.predict(X_val))
    xgb_pred_test = np.maximum(0, model.predict(X_test))

    print("XGBoost validation metrics:")
    xgb_metrics_val  = _metrics(y_val,  xgb_pred_val,  "XGB/Val")
    print("XGBoost test metrics:")
    xgb_metrics_test = _metrics(y_test, xgb_pred_test, "XGB/Test")

    # Feature importance
    importance = dict(sorted(
        zip(available_feats, model.feature_importances_.tolist()),
        key=lambda x: -x[1]
    ))

    # Save model
    model_path = ARTIFACTS_DIR / "branch_demand_model.joblib"
    joblib.dump(model, model_path)
    print(f"  Saved model -> {model_path}")

    # Save feature list
    feat_path = ARTIFACTS_DIR / "branch_feature_cols.json"
    with open(feat_path, "w") as f:
        json.dump(available_feats, f)

    report = {
        "model": "XGBoostRegressor",
        "target": "customer_count per branch per hour",
        "train_period": {"start": str(train["date"].min()), "end": str(train["date"].max())},
        "val_period":   {"start": str(val["date"].min()),   "end": str(val["date"].max())},
        "test_period":  {"start": str(test["date"].min()),  "end": str(test["date"].max())},
        "train_rows": len(train),
        "val_rows": len(val),
        "test_rows": len(test),
        "baseline_metrics": {"val": base_metrics_val, "test": base_metrics_test},
        "xgb_metrics": {"val": xgb_metrics_val, "test": xgb_metrics_test},
        "feature_importance": {k: round(float(v), 5) for k, v in list(importance.items())[:15]},
        "feature_list": available_feats,
        "training_timestamp": datetime.datetime.now().isoformat(),
        "leakage_prevention": {
            "method": "chronological_split",
            "no_future_info": True,
            "lag_shift": "lag_1h=shift(1), lag_24h=shift(24), lag_same_hour_prev_week=shift(7 days)",
            "rolling_computed_over": "history only (shift(1) before rolling window)",
        },
    }

    eval_path = ARTIFACTS_DIR / "evaluation.json"
    with open(eval_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Saved evaluation -> {eval_path}")

    return report


# ─── Service-level model ─────────────────────────────────────────────────────

def train_service_model() -> dict:
    """Train XGBoost on service-level hourly demand."""
    print("Building service-level feature matrix...")
    df, svc_map = build_service_level_features()

    # Save service type encoding map
    svc_map_path = ARTIFACTS_DIR / "service_type_map.json"
    with open(svc_map_path, "w") as f:
        json.dump(svc_map, f)

    df = df.copy()
    train = df[df["date"] <= TRAIN_END_DATE]
    val   = df[(df["date"] > TRAIN_END_DATE) & (df["date"] <= VAL_END_DATE)]
    test  = df[df["date"] > VAL_END_DATE]

    print(f"  Service train rows: {len(train)}, val: {len(val)}, test: {len(test)}")

    available_feats = [c for c in SERVICE_FEATURE_COLS if c in df.columns]
    X_train = train[available_feats].values
    y_train = train[TARGET_COL].values
    X_val   = val[available_feats].values
    y_val   = val[TARGET_COL].values
    X_test  = test[available_feats].values
    y_test  = test[TARGET_COL].values

    print("Training XGBoost service model...")
    svc_model = xgb.XGBRegressor(
        n_estimators=250,
        learning_rate=0.07,
        max_depth=5,
        min_child_weight=5,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.2,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )
    svc_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

    xgb_pred_test = np.maximum(0, svc_model.predict(X_test))
    print("Service model test metrics:")
    svc_metrics = _metrics(y_test, xgb_pred_test, "ServiceXGB/Test")

    svc_model_path = ARTIFACTS_DIR / "service_demand_model.joblib"
    joblib.dump(svc_model, svc_model_path)

    svc_feat_path = ARTIFACTS_DIR / "service_feature_cols.json"
    with open(svc_feat_path, "w") as f:
        json.dump(available_feats, f)

    print(f"  Saved service model -> {svc_model_path}")
    return {"service_model_metrics": {"test": svc_metrics}}


# ─── Entry point ──────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("AVENUE - Demand Forecasting Training Pipeline")
    print("=" * 60)
    branch_report = train_branch_model()
    print()
    svc_report = train_service_model()

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    test_m = branch_report["xgb_metrics"]["test"]
    base_m = branch_report["baseline_metrics"]["test"]
    print(f"Branch model  - MAE: {test_m['MAE']:.3f}  RMSE: {test_m['RMSE']:.3f}  R2: {test_m['R2']:.3f}")
    print(f"Baseline      - MAE: {base_m['MAE']:.3f}  RMSE: {base_m['RMSE']:.3f}  R2: {base_m['R2']:.3f}")
    svc_m = svc_report["service_model_metrics"]["test"]
    print(f"Service model - MAE: {svc_m['MAE']:.3f}  RMSE: {svc_m['RMSE']:.3f}  R2: {svc_m['R2']:.3f}")


if __name__ == "__main__":
    main()
