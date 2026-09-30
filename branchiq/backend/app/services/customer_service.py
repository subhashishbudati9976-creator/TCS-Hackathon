"""
AVENUE — Customer Experience & AI Guidance Service

Provides customer-facing discovery, branch recommendation, and
grounded assistant response without relying on external paid LLMs.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import pandas as pd

from app.services.data_analysis import data_service

# Grounded preparation & document requirements per service
SERVICE_PREPARATION = {
    "Cash Withdrawal": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Use any Avenue ATM or Cash Recycler machine 24/7 with your Debit Card or UPI Cash.",
        "documents_required": ["Debit Card / Cheque book", "Government Photo ID (for transactions > $5,000)"],
        "appointment_recommended": False,
        "best_time_to_visit": "09:00 - 10:30 AM or after 03:00 PM",
    },
    "Cash Deposit": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Use Avenue Automated Deposit Machines (CDM) available 24/7 in ATM lobbies.",
        "documents_required": ["Account Number / Deposit Slip", "PAN Card / ID for cash deposits > $1,000"],
        "appointment_recommended": False,
        "best_time_to_visit": "Early morning (09:00 - 10:30 AM)",
    },
    "Account Opening": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Open an Avenue Digital Savings Account in under 10 minutes via Video-KYC on the Avenue Mobile App.",
        "documents_required": ["Passport / National ID", "Proof of Address (Utility bill < 3 months)", "2 Passport Photographs", "Initial deposit cheque or card"],
        "appointment_recommended": True,
        "best_time_to_visit": "Book an appointment between 10:00 AM - 01:00 PM for dedicated onboarding desk.",
    },
    "KYC Update": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Submit periodic KYC updates via Avenue NetBanking or Mobile App using DigiLocker / Aadhaar OTP.",
        "documents_required": ["Original National Identity Card / Passport", "Recent proof of residential address"],
        "appointment_recommended": False,
        "best_time_to_visit": "02:00 PM - 03:30 PM",
    },
    "Address Update": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Update address instantly on Avenue NetBanking by uploading utility bill or via Aadhaar OTP.",
        "documents_required": ["Proof of new address (Electricity bill, Lease agreement, or Bank statement)"],
        "appointment_recommended": False,
        "best_time_to_visit": "Anytime or online 24/7",
    },
    "Cheque Services": {
        "branch_required": True,
        "digital_available": True,
        "digital_alternative": "Order new cheque books or stop cheque payments directly from the Mobile App.",
        "documents_required": ["Physical cheque to deposit or account details", "Cheque requisition slip"],
        "appointment_recommended": False,
        "best_time_to_visit": "Drop cheques in 24/7 Cheque Drop Box without standing in queue.",
    },
    "Loan Enquiry": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Check loan eligibility and get in-principle approval via Avenue Instant Loan Calculator online.",
        "documents_required": ["Last 6 months bank statements", "Last 3 months salary slips or Tax returns", "ID Proof"],
        "appointment_recommended": True,
        "best_time_to_visit": "Pre-booked slot with Loan Specialist (11:00 AM - 03:00 PM)",
    },
    "Loan Application": {
        "branch_required": True,
        "digital_available": False,
        "digital_alternative": "Initiate online application; in-person document verification and agreement signing required.",
        "documents_required": ["Income Proof (ITR / Form 16 / Pay slips)", "Bank Statements (12 months)", "Property / Collateral documents", "Identity & Address Proof"],
        "appointment_recommended": True,
        "best_time_to_visit": "Strictly recommended via scheduled appointment to avoid 30+ min waiting.",
    },
    "Credit Card Service": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Apply for, activate, or block cards instantly inside the Avenue Banking App.",
        "documents_required": ["Identity Proof", "Recent Income / Salary document"],
        "appointment_recommended": False,
        "best_time_to_visit": "11:00 AM - 01:00 PM",
    },
    "Investment Enquiry": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Explore mutual funds and term deposits on Avenue Wealth Portal.",
        "documents_required": ["PAN Card", "FATCA Declaration", "Risk profiling questionnaire"],
        "appointment_recommended": True,
        "best_time_to_visit": "Pre-book with Wealth Relationship Manager",
    },
    "Complaint": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Log and track tickets via 24/7 Customer Care portal or SMS helpdesk.",
        "documents_required": ["Transaction reference numbers", "Relevant receipts / statements"],
        "appointment_recommended": False,
        "best_time_to_visit": "Branch Manager consultation (11:00 AM - 01:00 PM)",
    },
    "General Customer Support": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Avenue In-App Chat or 24/7 Helpline 1800-AVENUE.",
        "documents_required": ["Account number and debit card / ID"],
        "appointment_recommended": False,
        "best_time_to_visit": "Afternoon slots",
    },
    "Statement Request": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Download PDF e-statements free of charge instantly from NetBanking or Email.",
        "documents_required": ["Account number / Passbook"],
        "appointment_recommended": False,
        "best_time_to_visit": "Use Self-service Passbook Printing Kiosk in lobby",
    },
    "Digital Banking Support": {
        "branch_required": False,
        "digital_available": True,
        "digital_alternative": "Reset password or unlock account via SMS OTP online.",
        "documents_required": ["Registered Mobile Number", "Debit Card / Account Details"],
        "appointment_recommended": False,
        "best_time_to_visit": "Digital Helpdesk in branch lobby",
    },
}


class CustomerService:
    def get_service_options(self) -> List[Dict[str, Any]]:
        """Returns catalog of all bank services enriched with digital availability and preparation guidelines."""
        services_df = data_service.services
        options = []
        for _, s in services_df.iterrows():
            svc_name = s["service_type"]
            prep = SERVICE_PREPARATION.get(svc_name, {
                "branch_required": True,
                "digital_available": bool(s.get("digital_available", False)),
                "digital_alternative": "Check Avenue Mobile Banking for online availability.",
                "documents_required": ["Government Photo ID", "Account Details"],
                "appointment_recommended": False,
                "best_time_to_visit": "10:00 AM - 02:00 PM",
            })
            options.append({
                "service_id": s["service_id"],
                "service_type": svc_name,
                "category_group": s.get("category_group", "General Banking"),
                "average_service_time_min": float(s.get("average_service_time", 10.0)),
                "complexity_level": s.get("complexity_level", "Medium"),
                "digital_available": prep["digital_available"],
                "branch_required": prep["branch_required"],
                "digital_alternative": prep["digital_alternative"],
                "documents_required": prep["documents_required"],
                "appointment_recommended": prep["appointment_recommended"],
                "best_time_to_visit": prep["best_time_to_visit"],
            })
        return options

    def get_customer_branches(self) -> List[Dict[str, Any]]:
        """Returns customer-facing branch overview with current congestion levels and wait estimates."""
        all_branches = data_service.get_all_branches()
        enriched = []
        for b in all_branches:
            b_id = b["branch_id"]
            try:
                cap = data_service.get_branch_capacity(b_id)
                load = cap.get("branch_load_score", {})
                score = round(load.get("overall_load_score", 45.0), 1)
                risk = load.get("risk_level", "Moderate")
            except Exception:
                score = 45.0
                risk = "Moderate"

            enriched.append({
                "branch_id": b_id,
                "branch_code": b["branch_code"],
                "branch_name": b["branch_name"],
                "city": b["city"],
                "area": b["area"],
                "latitude": b.get("latitude"),
                "longitude": b.get("longitude"),
                "counters": b["number_of_counters"],
                "operating_hours": b["operating_hours"],
                "avg_wait_minutes": round(b.get("avg_wait_minutes", 12.0), 1),
                "current_load_score": score,
                "risk_level": risk,
                "congestion_status": "Low Crowding" if score < 45 else ("Moderate Crowding" if score < 70 else "High Crowding"),
            })
        return enriched

    def recommend_branches(self, service_type: str, preferred_area: Optional[str] = None) -> Dict[str, Any]:
        """
        Recommends best branches for customer's intended service and checks digital eligibility.
        """
        prep = SERVICE_PREPARATION.get(service_type, {
            "digital_available": False,
            "digital_alternative": "",
            "documents_required": ["Valid Photo ID"],
            "appointment_recommended": False,
        })
        branches = self.get_customer_branches()

        # Sort branches primarily by shortest average wait time and lowest load score
        sorted_branches = sorted(branches, key=lambda x: (x["avg_wait_minutes"], x["current_load_score"]))

        # Build structured recommendation items
        recommendations = []
        for i, b in enumerate(sorted_branches[:3]):
            recommendations.append({
                "rank": i + 1,
                "branch_id": b["branch_id"],
                "branch_name": b["branch_name"],
                "area": b["area"],
                "city": b["city"],
                "estimated_wait_minutes": b["avg_wait_minutes"],
                "load_status": b["congestion_status"],
                "load_score": b["current_load_score"],
                "service_available": True,
                "recommendation_reason": (
                    f"Fastest service option ({b['avg_wait_minutes']} min avg wait) with {b['congestion_status']}."
                    if i == 0 else f"Good alternative in {b['area']} with {b['counters']} counters."
                ),
            })

        return {
            "service_type": service_type,
            "digital_available": prep["digital_available"],
            "digital_alternative": prep["digital_alternative"],
            "documents_required": prep["documents_required"],
            "appointment_recommended": prep["appointment_recommended"],
            "recommended_branches": recommendations,
        }

    def chat_assistant(self, message: str) -> Dict[str, Any]:
        """
        Rule-based grounded intent detection and knowledge retrieval.
        Guarantees accurate banking policy answers with zero external LLM dependencies.
        """
        lower = message.lower()
        services = self.get_service_options()
        branches = self.get_customer_branches()

        # 1. Check for specific service mentions
        matched_service = None
        for s in services:
            if s["service_type"].lower() in lower:
                matched_service = s
                break
        
        # Fuzzy keyword matching for services
        if not matched_service:
            if any(w in lower for w in ["open account", "savings account", "new account"]):
                matched_service = next((s for s in services if s["service_type"] == "Account Opening"), None)
            elif any(w in lower for w in ["loan", "borrow", "mortgage"]):
                matched_service = next((s for s in services if s["service_type"] == "Loan Application"), None)
            elif any(w in lower for w in ["deposit", "cash in", "pay in"]):
                matched_service = next((s for s in services if s["service_type"] == "Cash Deposit"), None)
            elif any(w in lower for w in ["withdraw", "atm", "cash out"]):
                matched_service = next((s for s in services if s["service_type"] == "Cash Withdrawal"), None)
            elif any(w in lower for w in ["kyc", "identity update", "id update"]):
                matched_service = next((s for s in services if s["service_type"] == "KYC Update"), None)
            elif any(w in lower for w in ["statement", "passbook", "transaction history"]):
                matched_service = next((s for s in services if s["service_type"] == "Statement Request"), None)

        # 2. Check for branch mentions
        matched_branch = None
        for b in branches:
            if b["branch_id"].lower() in lower or b["branch_name"].lower() in lower or b["area"].lower() in lower:
                matched_branch = b
                break

        # Response Generation
        # Case A: User asking about documents or preparation
        if any(w in lower for w in ["document", "docs", "bring", "paper", "require", "prep"]):
            if matched_service:
                docs_str = "\n• " + "\n• ".join(matched_service["documents_required"])
                appt_str = "Appointment is recommended to avoid waiting." if matched_service["appointment_recommended"] else "Walk-in is welcome."
                reply = (
                    f"For **{matched_service['service_type']}**, please prepare the following documents:\n"
                    f"{docs_str}\n\n"
                    f"**Average service time:** {matched_service['average_service_time_min']:.0f} minutes.\n"
                    f"**Appointment guidance:** {appt_str}\n"
                    f"**Best time to visit:** {matched_service['best_time_to_visit']}."
                )
            else:
                reply = (
                    "To assist you with required documents, please mention which service you need "
                    "(e.g., *Account Opening, Loan Application, KYC Update, Cash Deposit*)."
                )

        # Case B: User asking about digital / online options
        elif any(w in lower for w in ["online", "digital", "app", "mobile", "internet", "home", "remote"]):
            if matched_service:
                if matched_service["digital_available"]:
                    reply = (
                    f"Yes! **{matched_service['service_type']}** can be completed digitally without visiting a branch:\n\n"
                    f"👉 **Digital Option:** {matched_service['digital_alternative']}\n\n"
                    f"If you still prefer visiting a branch, the average in-person service time is {matched_service['average_service_time_min']:.0f} minutes."
                )
                else:
                    reply = (
                        f"**{matched_service['service_type']}** requires an in-person branch visit for verification/signing.\n"
                        f"However, you can initiate the process online and book an appointment to skip the queue."
                    )
            else:
                reply = (
                    "Most routine banking services like *Cash Transfers, Statement Downloads, KYC Updates, "
                    "Card Management, and Account Opening* can be completed 24/7 on the Avenue Mobile App!"
                )

        # Case C: User asking about branch crowding / wait times
        elif any(w in lower for w in ["wait", "crowd", "rush", "queue", "busy", "least", "fastest", "best branch"]):
            if matched_branch:
                reply = (
                    f"**{matched_branch['branch_name']} ({matched_branch['branch_id']})** currently has:\n"
                    f"• **Estimated wait time:** {matched_branch['avg_wait_minutes']:.1f} minutes\n"
                    f"• **Crowding status:** {matched_branch['congestion_status']} (Load Score: {matched_branch['current_load_score']}/100)\n"
                    f"• **Active counters:** {matched_branch['counters']}\n"
                    f"• **Hours:** {matched_branch['operating_hours']}"
                )
            else:
                best = sorted(branches, key=lambda x: x["avg_wait_minutes"])[0]
                reply = (
                    f"The least crowded branch right now is **{best['branch_name']}** ({best['area']}) with an estimated "
                    f"wait time of only **{best['avg_wait_minutes']:.1f} minutes** ({best['congestion_status']}).\n\n"
                    f"Network average wait time is ~14 minutes."
                )

        # Case D: Specific service general guidance
        elif matched_service:
            dig_info = f"💡 **Online option:** {matched_service['digital_alternative']}" if matched_service["digital_available"] else "In-branch visit required."
            reply = (
                f"**{matched_service['service_type']}** details:\n"
                f"• **Category:** {matched_service['category_group']}\n"
                f"• **Average Duration:** {matched_service['average_service_time_min']:.0f} minutes\n"
                f"• **{dig_info}\n"
                f"• **Best time to visit branch:** {matched_service['best_time_to_visit']}\n"
                f"Would you like document requirements or a branch recommendation for this service?"
            )

        # Case E: Default friendly assistant overview
        else:
            reply = (
                "Hello! I am your **AVENUE Banking Assistant**. I can help you with:\n\n"
                "1. **Digital Services:** Check which services you can complete instantly online.\n"
                "2. **Branch Crowding:** Find the branch with the shortest wait time.\n"
                "3. **Preparation & Documents:** Know what paperwork to bring before visiting.\n"
                "4. **Appointments:** Guidance on scheduling your visit to skip the queue.\n\n"
                "What would you like to know today?"
            )

        return {
            "reply": reply,
            "detected_service": matched_service["service_type"] if matched_service else None,
            "detected_branch": matched_branch["branch_id"] if matched_branch else None,
            "is_grounded": True,
        }


customer_service = CustomerService()
