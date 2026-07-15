"""
seed_data.py — Seeds the database with demo data.

Contains:
  - 1 admin user (demo@bharatseva.ai / Admin@12345)
  - 2 demo citizen users
  - 25+ real Indian government schemes across all categories
  - Feature flags
  - KB source records

This data is also used as RAG source material in Prompt 4 — keep consistent.
Run: python seed_data.py (from /backend)
Also called automatically by create_app() when DB is empty.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

import bcrypt


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


# ── Scheme data ───────────────────────────────────────────────────────────────

SCHEMES = [
    # ── FARMER ────────────────────────────────────────────────────────────────
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "category": "farmer",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Provides income support of ₹6,000 per year in three equal instalments "
            "to all landholding farmer families in India. Amount transferred directly "
            "to Aadhaar-linked bank accounts."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["farmer"]},
                {"field": "land_holding_ha", "operator": "lte", "value": 2},
            ],
            "exclusions": [
                {"field": "occupation", "operator": "in", "values": ["government_employee"]},
                {"field": "annual_income", "operator": "gt", "value": 200000},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Land ownership record (Khatoni)", "mandatory": True},
            {"name": "Bank passbook (Aadhaar-linked)", "mandatory": True},
        ]),
        "application_url": "https://pmkisan.gov.in",
        "deadline": "2025-12-31",
        "source_name": "PM-KISAN Official Portal",
        "source_url": "https://pmkisan.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Ministry of Agriculture & Farmers Welfare, Krishi Bhavan, New Delhi",
        "office_contact": "1800-180-1551",
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना",
        "category": "farmer",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Crop insurance scheme providing financial support to farmers suffering crop "
            "loss/damage due to unforeseen events like natural calamities, pests & diseases. "
            "Premium rate: 2% for Kharif, 1.5% for Rabi, 5% for commercial crops."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [{"field": "occupation", "operator": "in", "values": ["farmer"]}],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Sowing certificate", "mandatory": True},
            {"name": "Land records", "mandatory": True},
            {"name": "Bank account details", "mandatory": True},
        ]),
        "application_url": "https://pmfby.gov.in",
        "deadline": "2025-07-31",
        "source_name": "PMFBY Official Portal",
        "source_url": "https://pmfby.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Agriculture Department, State Headquarters",
        "office_contact": "1800-200-7710",
    },
    {
        "name": "Kisan Credit Card (KCC) Scheme",
        "name_hi": "किसान क्रेडिट कार्ड योजना",
        "category": "farmer",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Provides short-term credit support to farmers for their agricultural operations "
            "at concessional interest rates. Covers crop cultivation, post-harvest expenses, "
            "and allied activities. Interest subvention of 2% + additional 3% for prompt repayment."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [{"field": "occupation", "operator": "in", "values": ["farmer"]}],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Land records", "mandatory": True},
            {"name": "Passport-size photographs", "mandatory": True},
        ]),
        "application_url": "https://www.nabard.org/content1.aspx?id=591",
        "deadline": None,
        "source_name": "NABARD KCC Guidelines",
        "source_url": "https://www.nabard.org",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Nearest bank branch (Nationalised / Co-operative / RRB)",
        "office_contact": "1800-200-0013",
    },
    # ── SCHOLARSHIP ───────────────────────────────────────────────────────────
    {
        "name": "National Scholarship Portal (NSP) — Post-Matric Scholarship (SC)",
        "name_hi": "राष्ट्रीय छात्रवृत्ति पोर्टल — पोस्ट-मैट्रिक छात्रवृत्ति (SC)",
        "category": "scholarship",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Post-matric scholarship for SC students pursuing studies beyond class 10. "
            "Covers tuition fees + maintenance allowance. Family annual income ≤ ₹2.5 lakh."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "category", "operator": "in", "values": ["sc"]},
                {"field": "occupation", "operator": "in", "values": ["student"]},
                {"field": "annual_income", "operator": "lte", "value": 250000},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Caste certificate (SC)", "mandatory": True},
            {"name": "Income certificate", "mandatory": True},
            {"name": "Previous year marksheet", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://scholarships.gov.in",
        "deadline": "2025-11-30",
        "source_name": "National Scholarship Portal",
        "source_url": "https://scholarships.gov.in",
        "last_verified_date": "2025-06-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Social Welfare Department, State Capital",
        "office_contact": "0120-6619540",
    },
    {
        "name": "Central Sector Scheme of Scholarships for College & University Students",
        "category": "scholarship",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Merit-based scholarship for students in regular degree programmes. "
            "₹10,000–₹20,000 per year. Must be in top 20 percentile in 12th board exams. "
            "Family income ≤ ₹4.5 lakh per annum."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["student"]},
                {"field": "annual_income", "operator": "lte", "value": 450000},
                {"field": "merit_percentile", "operator": "gte", "value": 80},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Class 12 marksheet", "mandatory": True},
            {"name": "Income certificate", "mandatory": True},
            {"name": "College admission proof", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://scholarships.gov.in",
        "deadline": "2025-10-31",
        "source_name": "Department of Higher Education, MoE",
        "source_url": "https://scholarships.gov.in",
        "last_verified_date": "2025-05-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Ministry of Education, Shastri Bhavan, New Delhi",
        "office_contact": "011-23382012",
    },
    {
        "name": "Pragati Scholarship for Girls (AICTE)",
        "category": "scholarship",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Scholarship for girl students enrolled in AICTE-approved technical institutions. "
            "₹30,000 per year + ₹2,000 per month. One girl child per family, family income ≤ ₹8 lakh."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "gender", "operator": "eq", "value": "female"},
                {"field": "occupation", "operator": "in", "values": ["student"]},
                {"field": "annual_income", "operator": "lte", "value": 800000},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Income certificate", "mandatory": True},
            {"name": "Admission letter from AICTE institution", "mandatory": True},
            {"name": "Marksheet", "mandatory": True},
        ]),
        "application_url": "https://www.aicte-india.org/bureaus/pgati",
        "deadline": "2025-09-30",
        "source_name": "AICTE Pragati Scholarship",
        "source_url": "https://www.aicte-india.org",
        "last_verified_date": "2025-05-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "AICTE Headquarters, Nelson Mandela Marg, New Delhi",
        "office_contact": "011-29581000",
    },
    # ── SENIOR CITIZEN ────────────────────────────────────────────────────────
    {
        "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "name_hi": "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना",
        "category": "senior_citizen",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Monthly pension for BPL senior citizens aged 60+. ₹200/month for age 60-79, "
            "₹500/month for age 80+. States may top up; many states provide ₹1,000-₹2,000/month."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "age", "operator": "gte", "value": 60},
                {"field": "bpl_card", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Age proof (Birth certificate / Aadhaar)", "mandatory": True},
            {"name": "BPL card / Ration card", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://nsap.nic.in",
        "deadline": None,
        "source_name": "National Social Assistance Programme",
        "source_url": "https://nsap.nic.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Block Development Office / Gram Panchayat",
        "office_contact": "1800-111-555",
    },
    {
        "name": "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
        "name_hi": "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना",
        "category": "senior_citizen",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Monthly pension of ₹300 for BPL widows aged 40-79. States supplement with additional amounts. "
            "Kerala: ₹1,600/month. Rajasthan: ₹1,000/month. Direct bank transfer."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "gender", "operator": "eq", "value": "female"},
                {"field": "age", "operator": "gte", "value": 40},
                {"field": "marital_status", "operator": "eq", "value": "widow"},
                {"field": "bpl_card", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Husband's death certificate", "mandatory": True},
            {"name": "BPL card", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://nsap.nic.in",
        "deadline": None,
        "source_name": "National Social Assistance Programme",
        "source_url": "https://nsap.nic.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Block Development Office",
        "office_contact": "1800-111-555",
    },
    {
        "name": "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PMJAY)",
        "name_hi": "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना",
        "category": "senior_citizen",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Health cover of ₹5 lakh per family per year for secondary and tertiary hospitalisation. "
            "Covers 1,500+ medical packages. Cashless treatment at 25,000+ empanelled hospitals nationwide."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "OR",
            "rules": [
                {"field": "secc_listed", "operator": "eq", "value": True},
                {"field": "ration_card_type", "operator": "in", "values": ["AAY", "PHH"]},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Ration card", "mandatory": False},
            {"name": "PMJAY e-card (generated online)", "mandatory": False},
        ]),
        "application_url": "https://pmjay.gov.in",
        "deadline": None,
        "source_name": "Ayushman Bharat PMJAY Official",
        "source_url": "https://pmjay.gov.in",
        "last_verified_date": "2025-05-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Common Service Centre / Empanelled Hospital",
        "office_contact": "14555",
    },
    # ── WOMEN ─────────────────────────────────────────────────────────────────
    {
        "name": "MUDRA Loan — Mahila Udyam Nidhi",
        "name_hi": "मुद्रा ऋण — महिला उद्यम निधि",
        "category": "women",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Collateral-free loans for women entrepreneurs under PMMY. "
            "Shishu: up to ₹50,000. Kishore: ₹50,001–₹5 lakh. Tarun: ₹5–₹10 lakh. "
            "Interest subvention of 2% for women borrowers under Shishu and Kishore categories."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "gender", "operator": "eq", "value": "female"},
                {"field": "occupation", "operator": "in", "values": ["msme_owner", "self_employed"]},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "PAN Card", "mandatory": True},
            {"name": "Business plan / project report", "mandatory": True},
            {"name": "Udyam registration (if available)", "mandatory": False},
        ]),
        "application_url": "https://www.mudra.org.in",
        "deadline": None,
        "source_name": "MUDRA Official Portal",
        "source_url": "https://www.mudra.org.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Nearest PSU / NBFC / MFI branch",
        "office_contact": "1800-180-1111",
    },
    {
        "name": "Mahila Shakti Kendra Scheme",
        "category": "women",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Empowers rural women through community engagement and provision of livelihood support, "
            "digital literacy, skill development, health and nutrition awareness."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [{"field": "gender", "operator": "eq", "value": "female"}],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Bank account details", "mandatory": True},
        ]),
        "application_url": "https://wcd.nic.in",
        "deadline": None,
        "source_name": "Ministry of Women & Child Development",
        "source_url": "https://wcd.nic.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "District Women & Child Development Office",
        "office_contact": "011-23388611",
    },
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "name_hi": "प्रधानमंत्री मातृ वंदना योजना",
        "category": "women",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Maternity benefit of ₹5,000 in three instalments for the first live birth. "
            "Compensates wage loss for pregnant and lactating mothers in the unorganised sector."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "gender", "operator": "eq", "value": "female"},
                {"field": "pregnancy_status", "operator": "eq", "value": "first_child"},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "MCP card (Mother & Child Protection card)", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://pmmvy.wcd.gov.in",
        "deadline": None,
        "source_name": "PMMVY Official Portal",
        "source_url": "https://pmmvy.wcd.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Anganwadi Centre / CDPO Office",
        "office_contact": "011-23385346",
    },
    # ── DISABILITY ────────────────────────────────────────────────────────────
    {
        "name": "Scheme for Assistance to Disabled Persons (ADIP Scheme)",
        "category": "disability",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Provides assistive devices (aids & appliances) to persons with disabilities to restore "
            "functional capability. Wheelchairs, tricycles, hearing aids, white canes, crutches etc. "
            "Income limit: ₹20,000/month (₹15,000 for free devices)."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "disability_status", "operator": "ne", "value": "none"},
                {"field": "monthly_income", "operator": "lte", "value": 20000},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Disability certificate (40%+ disability)", "mandatory": True},
            {"name": "Income proof", "mandatory": True},
        ]),
        "application_url": "https://alimco.in",
        "deadline": None,
        "source_name": "ALIMCO / DEPwD",
        "source_url": "https://disabilityaffairs.gov.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "District Disability Rehabilitation Centre",
        "office_contact": "0512-2770873",
    },
    {
        "name": "National Handicapped Finance & Development Corporation (NHFDC) Loans",
        "category": "disability",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Concessional loans for persons with disabilities for self-employment, education, "
            "and professional/technical courses. Interest rate 5% for women, 6% for men. "
            "Maximum loan: ₹50 lakh for micro-enterprise."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "disability_status", "operator": "ne", "value": "none"},
                {"field": "age", "operator": "gte", "value": 18},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Disability certificate", "mandatory": True},
            {"name": "Project report / business plan", "mandatory": True},
            {"name": "Income proof", "mandatory": True},
        ]),
        "application_url": "https://nhfdc.nic.in",
        "deadline": None,
        "source_name": "NHFDC Official",
        "source_url": "https://nhfdc.nic.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "State Channelising Agency / NHFDC Regional Office",
        "office_contact": "0124-2847800",
    },
    # ── STARTUP ───────────────────────────────────────────────────────────────
    {
        "name": "Startup India — DPIIT Recognition",
        "name_hi": "स्टार्टअप इंडिया — DPIIT मान्यता",
        "category": "startup",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "DPIIT recognition enables startups to access tax benefits (3-year income tax exemption), "
            "self-certification under labour and environmental laws, faster IP filing at reduced cost, "
            "and eligibility for government procurement without prior turnover criteria."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "business_type", "operator": "in", "values": ["pvt_ltd", "llp", "partnership"]},
                {"field": "years_since_incorporation", "operator": "lte", "value": 10},
                {"field": "annual_turnover", "operator": "lte", "value": 100000000},
                {"field": "not_formed_by_splitting", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Certificate of Incorporation", "mandatory": True},
            {"name": "PAN of entity", "mandatory": True},
            {"name": "Brief description of innovative product/service", "mandatory": True},
        ]),
        "application_url": "https://www.startupindia.gov.in",
        "deadline": None,
        "source_name": "Startup India Official Portal",
        "source_url": "https://www.startupindia.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "DPIIT, Udyog Bhavan, New Delhi",
        "office_contact": "1800-115-565",
    },
    {
        "name": "NIDHI Prayas (NSF) — NSTEDB Prototype Fund",
        "category": "startup",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Grants up to ₹10 lakh per innovation-driven startup for proof-of-concept prototype development. "
            "Supports early-stage tech startups at incubation centres. Rolling applications."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["startup_founder"]},
                {"field": "at_incubator", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Proof of incubation at NIDHI-TBI", "mandatory": True},
            {"name": "Technology description", "mandatory": True},
            {"name": "Project plan", "mandatory": True},
        ]),
        "application_url": "https://nidhi.dst.gov.in",
        "deadline": "2025-08-31",
        "source_name": "DST NIDHI Programme",
        "source_url": "https://nidhi.dst.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Department of Science & Technology, New Delhi",
        "office_contact": "011-26590404",
    },
    {
        "name": "Atal Innovation Mission (AIM) — Atal Incubation Centre",
        "category": "startup",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Provides grant-in-aid of up to ₹10 crore to host institutes for setting up "
            "world-class incubation facilities. Startups at AICs receive seed grants, "
            "mentorship, and infrastructure support."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [{"field": "occupation", "operator": "in", "values": ["startup_founder"]}],
        }),
        "required_documents_json": json.dumps([
            {"name": "DPIIT recognition certificate", "mandatory": False},
            {"name": "Business plan", "mandatory": True},
            {"name": "Founder KYC", "mandatory": True},
        ]),
        "application_url": "https://aim.gov.in",
        "deadline": None,
        "source_name": "Atal Innovation Mission",
        "source_url": "https://aim.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "NITI Aayog, Sansad Marg, New Delhi",
        "office_contact": "011-23096563",
    },
    # ── MSME ──────────────────────────────────────────────────────────────────
    {
        "name": "Udyam Registration (MSME)",
        "name_hi": "उद्यम पंजीकरण (MSME)",
        "category": "msme",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Free online MSME registration that unlocks priority sector lending, "
            "collateral-free loans (CGTMSE), government procurement preference, "
            "delayed payment protection, and subsidies. Mandatory for all MSMEs to access benefits."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "OR",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["msme_owner", "startup_founder"]},
                {"field": "has_business", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card of proprietor/partner/director", "mandatory": True},
            {"name": "PAN Card of entity", "mandatory": True},
            {"name": "GSTIN (if applicable)", "mandatory": False},
        ]),
        "application_url": "https://udyamregistration.gov.in",
        "deadline": None,
        "source_name": "Udyam Registration Portal",
        "source_url": "https://udyamregistration.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "District Industries Centre",
        "office_contact": "1800-111-955",
    },
    {
        "name": "Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE)",
        "category": "msme",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Provides collateral-free credit guarantee to banks/NBFCs for loans to MSMEs. "
            "Guarantee cover: 75–85% of loan amount up to ₹2 crore. "
            "No third-party guarantee required. Annual guarantee fee payable by borrower."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["msme_owner"]},
                {"field": "udyam_registered", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Udyam registration certificate", "mandatory": True},
            {"name": "Business financials (last 2 years)", "mandatory": True},
            {"name": "Loan application to bank", "mandatory": True},
        ]),
        "application_url": "https://www.cgtmse.in",
        "deadline": None,
        "source_name": "CGTMSE Official",
        "source_url": "https://www.cgtmse.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "SIDBI / Participating Bank branch",
        "office_contact": "022-22180040",
    },
    {
        "name": "MSME Competitive Lean Scheme (MCLS)",
        "category": "msme",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Government subsidises 80% cost of lean manufacturing consultant fees for MSMEs "
            "to improve productivity, reduce waste, and become globally competitive. "
            "Clusters of 10 MSMEs implement lean practices together."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [{"field": "occupation", "operator": "in", "values": ["msme_owner"]}],
        }),
        "required_documents_json": json.dumps([
            {"name": "Udyam registration", "mandatory": True},
            {"name": "GST registration", "mandatory": False},
        ]),
        "application_url": "https://msme.gov.in",
        "deadline": None,
        "source_name": "Ministry of MSME",
        "source_url": "https://msme.gov.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "MSME Development Institute (District)",
        "office_contact": "011-23063288",
    },
    # ── STATE SCHEMES ──────────────────────────────────────────────────────────
    {
        "name": "Karnataka Elevate 2024 — Startup Grant",
        "category": "startup",
        "state_or_all_india": "KA",
        "description": (
            "Karnataka government seed grant of up to ₹50 lakh for innovative startups. "
            "Open to DPIIT-recognised startups with Karnataka HQ. "
            "Annual competition — applications typically open May–July."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "state", "operator": "eq", "value": "Karnataka"},
                {"field": "dpiit_recognised", "operator": "eq", "value": True},
                {"field": "occupation", "operator": "in", "values": ["startup_founder"]},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "DPIIT recognition letter", "mandatory": True},
            {"name": "Certificate of Incorporation", "mandatory": True},
            {"name": "Pitch deck", "mandatory": True},
            {"name": "Audited financials (if > 2 years old)", "mandatory": False},
        ]),
        "application_url": "https://elevate.karnataka.gov.in",
        "deadline": "2025-07-31",
        "source_name": "Karnataka Startup Cell",
        "source_url": "https://elevate.karnataka.gov.in",
        "last_verified_date": "2025-05-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Karnataka Startup Cell, KIADB, Bengaluru",
        "office_contact": "080-22239406",
    },
    {
        "name": "Tamil Nadu Women Entrepreneur Development Scheme",
        "category": "women",
        "state_or_all_india": "TN",
        "description": (
            "Subsidises 25% of project cost (max ₹7.5 lakh) for women-owned MSMEs in Tamil Nadu. "
            "Applicable to manufacturing units. Must employ ≥ 60% women workers."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "state", "operator": "eq", "value": "Tamil Nadu"},
                {"field": "gender", "operator": "eq", "value": "female"},
                {"field": "occupation", "operator": "in", "values": ["msme_owner"]},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Udyam registration", "mandatory": True},
            {"name": "Project report", "mandatory": True},
            {"name": "Land / rental documents for unit", "mandatory": True},
        ]),
        "application_url": "https://www.msmeonline.tn.gov.in",
        "deadline": None,
        "source_name": "TN Industries Dept",
        "source_url": "https://www.msmeonline.tn.gov.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Tamil Nadu Small Industries Development Corporation, Chennai",
        "office_contact": "044-28252355",
    },
    {
        "name": "Maharashtra Divyangjan Welfare Scheme (Samajik Suraksha)",
        "category": "disability",
        "state_or_all_india": "MH",
        "description": (
            "Monthly pension of ₹600 for persons with 40%+ disability in Maharashtra. "
            "Additional ₹500 for severe disability (80%+). Applications through District Social Welfare Office."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "state", "operator": "eq", "value": "Maharashtra"},
                {"field": "disability_status", "operator": "ne", "value": "none"},
                {"field": "disability_pct", "operator": "gte", "value": 40},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Disability certificate (40%+)", "mandatory": True},
            {"name": "Domicile certificate of Maharashtra", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://sjsa.maharashtra.gov.in",
        "deadline": None,
        "source_name": "Maharashtra Social Justice Dept",
        "source_url": "https://sjsa.maharashtra.gov.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "District Social Welfare Office, Maharashtra",
        "office_contact": "022-22025251",
    },
    {
        "name": "Bihar Student Credit Card Scheme",
        "category": "scholarship",
        "state_or_all_india": "BR",
        "description": (
            "Education loan of up to ₹4 lakh at 4% interest (1% for women/differently-abled) "
            "for students from Bihar pursuing higher education. Repayment begins 1 year after completing studies."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "state", "operator": "eq", "value": "Bihar"},
                {"field": "occupation", "operator": "in", "values": ["student"]},
                {"field": "age", "operator": "lte", "value": 25},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Class 12 marksheet", "mandatory": True},
            {"name": "Domicile certificate of Bihar", "mandatory": True},
            {"name": "Admission letter", "mandatory": True},
        ]),
        "application_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
        "deadline": None,
        "source_name": "Bihar Student Credit Card Portal",
        "source_url": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "District Registration Counselling Centre, Bihar",
        "office_contact": "1800-3456-444",
    },
    {
        "name": "Rajasthan Samajik Suraksha Pension (Widow / Old Age)",
        "category": "senior_citizen",
        "state_or_all_india": "RJ",
        "description": (
            "State pension for widows and elderly above 55 years in Rajasthan. "
            "₹750/month for age 55-74, ₹1,000/month for 75+. "
            "Janaadhaar-linked; applied at E-mitra kiosk or gram panchayat."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "state", "operator": "eq", "value": "Rajasthan"},
                {"field": "age", "operator": "gte", "value": 55},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Janaadhaar card", "mandatory": True},
            {"name": "Age proof", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://sje.rajasthan.gov.in",
        "deadline": None,
        "source_name": "Rajasthan Social Justice Dept",
        "source_url": "https://sje.rajasthan.gov.in",
        "last_verified_date": "2025-03-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "E-mitra kiosk / Block Social Welfare Office",
        "office_contact": "1800-180-6268",
    },
    {
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
        "name_hi": "प्रधानमंत्री जीवन ज्योति बीमा योजना",
        "category": "other",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Life insurance cover of ₹2 lakh for death due to any cause. "
            "Annual premium: ₹436 (auto-debited from bank account). "
            "Age: 18–50 years. Linked to bank account, Aadhaar-linked not mandatory."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "age", "operator": "gte", "value": 18},
                {"field": "age", "operator": "lte", "value": 50},
                {"field": "has_bank_account", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Bank account details", "mandatory": True},
            {"name": "Aadhaar Card or other ID", "mandatory": True},
        ]),
        "application_url": "https://jansuraksha.gov.in",
        "deadline": "2025-05-31",
        "source_name": "Jan Suraksha Portal",
        "source_url": "https://jansuraksha.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Nearest bank branch",
        "office_contact": "1800-180-1111",
    },
    {
        "name": "PM SVANidhi — PM Street Vendor's AtmaNirbhar Nidhi",
        "category": "msme",
        "state_or_all_india": "ALL_INDIA",
        "description": (
            "Collateral-free working capital loans for street vendors impacted by COVID-19. "
            "₹10,000 (1st loan), ₹20,000 (2nd), ₹50,000 (3rd) on timely repayment. "
            "7% interest subsidy; digital transactions incentive ₹1,200/year."
        ),
        "eligibility_rules_json": json.dumps({
            "logic": "AND",
            "rules": [
                {"field": "occupation", "operator": "in", "values": ["self_employed", "msme_owner"]},
                {"field": "vendor_certificate", "operator": "eq", "value": True},
            ],
        }),
        "required_documents_json": json.dumps([
            {"name": "Aadhaar Card", "mandatory": True},
            {"name": "Vendor ID certificate from ULB", "mandatory": True},
            {"name": "Bank passbook", "mandatory": True},
        ]),
        "application_url": "https://pmsvanidhi.mohua.gov.in",
        "deadline": None,
        "source_name": "PM SVANidhi Portal",
        "source_url": "https://pmsvanidhi.mohua.gov.in",
        "last_verified_date": "2025-04-01",
        "kb_version": "2025-Q2-v1",
        "office_address": "Urban Local Body / Common Service Centre",
        "office_contact": "1800-11-1979",
    },
]

# ── Feature flags seed data ────────────────────────────────────────────────────

FEATURE_FLAGS = [
    {"flag_name": "ai_copilot",          "enabled": 1, "description": "AI Citizen Copilot goal-planning feature"},
    {"flag_name": "document_ai",         "enabled": 1, "description": "AI document extraction and verification"},
    {"flag_name": "multilingual_ai",     "enabled": 1, "description": "Auto-translate AI responses to user language"},
    {"flag_name": "semantic_search",     "enabled": 0, "description": "Enable embedding-based semantic scheme search (Phase 2)"},
    {"flag_name": "proactive_reminders", "enabled": 0, "description": "Proactive deadline reminders via scheduler"},
    {"flag_name": "csc_operator_mode",   "enabled": 0, "description": "CSC operator assisted mode"},
]

# ── KB sources ─────────────────────────────────────────────────────────────────

KB_SOURCES = [
    {"source_name": "PM-KISAN Portal", "source_url": "https://pmkisan.gov.in", "category": "farmer", "version": "2025-Q2-v1", "document_count": 3, "last_verified_date": "2025-04-01"},
    {"source_name": "National Scholarship Portal", "source_url": "https://scholarships.gov.in", "category": "scholarship", "version": "2025-Q2-v1", "document_count": 8, "last_verified_date": "2025-05-01"},
    {"source_name": "NSAP Pension Portal", "source_url": "https://nsap.nic.in", "category": "senior_citizen", "version": "2025-Q2-v1", "document_count": 4, "last_verified_date": "2025-03-01"},
    {"source_name": "MUDRA Official Portal", "source_url": "https://www.mudra.org.in", "category": "women", "version": "2025-Q2-v1", "document_count": 2, "last_verified_date": "2025-04-01"},
    {"source_name": "Startup India Portal", "source_url": "https://www.startupindia.gov.in", "category": "startup", "version": "2025-Q2-v1", "document_count": 5, "last_verified_date": "2025-04-01"},
    {"source_name": "Udyam Registration Portal", "source_url": "https://udyamregistration.gov.in", "category": "msme", "version": "2025-Q2-v1", "document_count": 2, "last_verified_date": "2025-04-01"},
    {"source_name": "DEPwD Disability Portal", "source_url": "https://disabilityaffairs.gov.in", "category": "disability", "version": "2025-Q2-v1", "document_count": 3, "last_verified_date": "2025-03-01"},
]


# ── Seeding functions ─────────────────────────────────────────────────────────

def seed_users(bcrypt_cost: int = 12) -> None:
    from models.user import User
    from models.citizen_profile import CitizenProfile
    from app.extensions import db

    # Demo admin
    if not User.query.filter_by(email="admin@bharatseva.ai").first():
        pw = bcrypt.hashpw(b"Admin@12345", bcrypt.gensalt(rounds=bcrypt_cost)).decode()
        admin = User(id=_uuid(), email="admin@bharatseva.ai", password_hash=pw, role="admin")
        db.session.add(admin)
        db.session.flush()
        print(f"  ✓ Admin user created: admin@bharatseva.ai / Admin@12345")

    # Demo citizen — Ramesh
    if not User.query.filter_by(email="ramesh@demo.ai").first():
        pw = bcrypt.hashpw(b"Citizen@123", bcrypt.gensalt(rounds=bcrypt_cost)).decode()
        u = User(id=_uuid(), email="ramesh@demo.ai", password_hash=pw, role="citizen")
        db.session.add(u)
        db.session.flush()
        p = CitizenProfile(
            user_id=u.id, full_name="Ramesh Kumar", state="Bihar", district="Patna",
            occupation="farmer", income_band="below_1L", category="general", age=42,
            gender="male", disability_status="none", education_level="primary",
            preferred_language="hi",
        )
        p.refresh_completeness()
        db.session.add(p)
        print(f"  ✓ Demo citizen: ramesh@demo.ai / Citizen@123")

    # Demo citizen — Priya
    if not User.query.filter_by(email="priya@demo.ai").first():
        pw = bcrypt.hashpw(b"Citizen@123", bcrypt.gensalt(rounds=bcrypt_cost)).decode()
        u = User(id=_uuid(), email="priya@demo.ai", password_hash=pw, role="citizen")
        db.session.add(u)
        db.session.flush()
        p = CitizenProfile(
            user_id=u.id, full_name="Priya Panda", state="Odisha", district="Bhubaneswar",
            occupation="student", income_band="1L_3L", category="obc", age=19,
            gender="female", disability_status="none", education_level="secondary",
            preferred_language="en",
        )
        p.refresh_completeness()
        db.session.add(p)
        print(f"  ✓ Demo citizen: priya@demo.ai / Citizen@123")

    db.session.commit()


def seed_schemes() -> None:
    from models.scheme import Scheme
    from app.extensions import db

    existing = {s.name for s in Scheme.query.all()}
    added = 0
    for s_data in SCHEMES:
        if s_data["name"] not in existing:
            scheme = Scheme(
                id=_uuid(),
                created_at=_now(),
                updated_at=_now(),
                **s_data,
            )
            db.session.add(scheme)
            added += 1
    db.session.commit()
    print(f"  ✓ {added} schemes seeded ({Scheme.query.count()} total)")


def seed_feature_flags() -> None:
    from models.feature_flag import FeatureFlag
    from app.extensions import db

    for ff in FEATURE_FLAGS:
        existing = FeatureFlag.query.filter_by(flag_name=ff["flag_name"]).first()
        if not existing:
            flag = FeatureFlag(
                id=_uuid(),
                flag_name=ff["flag_name"],
                enabled=ff["enabled"],
                description=ff["description"],
                updated_at=_now(),
            )
            db.session.add(flag)
    db.session.commit()
    print(f"  ✓ Feature flags seeded")


def seed_kb_sources() -> None:
    from models.kb_source import KbSource
    from app.extensions import db

    existing = {s.source_name for s in KbSource.query.all()}
    for src in KB_SOURCES:
        if src["source_name"] not in existing:
            kb = KbSource(
                id=_uuid(),
                state_or_all_india="ALL_INDIA",
                ingest_status="INGESTED",
                created_at=_now(),
                updated_at=_now(),
                **src,
            )
            db.session.add(kb)
    db.session.commit()
    print(f"  ✓ KB sources seeded")


def run() -> None:
    print("\n🌱 Running seed_data...")
    seed_users()
    seed_schemes()
    seed_feature_flags()
    seed_kb_sources()
    print("✅ Seed complete.\n")


if __name__ == "__main__":
    import os
    import sys
    from dotenv import load_dotenv

    # Allow running directly: python seed_data.py
    sys.path.insert(0, os.path.dirname(__file__))
    load_dotenv()
    from app import create_app
    app = create_app()
    with app.app_context():
        run()
