# AVENUE Synthetic Data Quality & Validation Report

**Generated:** 2026-09-30T12:56:18.916143  
**Data Directory:** `C:\CSE Next-Gen Computational Intelligence\Google Antigravity\TCS Hackathon\data\processed`  
**Overall Status:** **PASS** (10/10 checks passed)

---

## Summary of Verification Checks

| Check # | Verification Area | Target Standard | Status | Findings |
|---|---|---|---|---|
| **1** | Missing Values | Zero null/NaN values across all fields | ✅ PASS | 0 missing cells |
| **2** | Timestamp Chronology | `arrival <= start <= end` for all visits | ✅ PASS | 0 chronological inversions |
| **3** | Non-negative Durations | Durations >= 0; Completed visits > 0 | ✅ PASS | All 79,528 records physically valid |
| **4** | Waiting Time Bounds | 0 <= Wait <= 240 mins; Matches timestamps | ✅ PASS | Max wait 68.2m; 0 timestamp discrepancies |
| **5** | Unique Identifiers | No duplicates in any table's primary key | ✅ PASS | 0 duplicate IDs found across 9 tables |
| **6** | Referential Integrity | All foreign keys resolve to valid entities | ✅ PASS | 0 orphaned records |
| **7** | Service-Staff Skill Match | Visits served by qualified/cross-trained staff | ✅ PASS | 97.64% skill alignment |
| **8** | Appointment Schedule | No appointments scheduled on bank holidays | ✅ PASS | 0 appointments on holidays |
| **9** | Capacity Engine Bounds | Zero-division guarded, load score in [0, 100] | ✅ PASS | Robust bounds; zero-division safe |
| **10**| Audit Completeness | Full machine & human readable reports | ✅ PASS | Report generated successfully |

---

## Dataset Scope Verified

- **Branches:** 10 operational facilities across Bengaluru
- **Staff:** 101 personnel with granular primary/secondary skill sets
- **Service Categories:** 14 distinct banking operations
- **Customers:** 15000 synthetic profiles across 6 analytical segments (Zero PII)
- **Calendar Days:** 180 days analyzed (132 active banking days)
- **Scheduled Appointments:** 9533 records
- **Service Visits & Logs:** 79528 queue entries
- **Token Dispatch Records:** 79528 counter tokens
- **Customer Feedback:** 11183 realistic sentiment & rating records

**Conclusion:** All datasets satisfy the TCS hackathon problem statement criteria for structural integrity, logical consistency, and queuing realism.
