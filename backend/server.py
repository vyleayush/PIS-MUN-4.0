from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi import UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import resend
import base64

from seed_data import UNGA_ROSTER, UN_ROSTER, AIPPM_ROSTER

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email config
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ORGANIZER_EMAIL = os.environ.get('ORGANIZER_EMAIL', 'paramountinternationalmun.26@gmail.com')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'paramountinternationalmun.26@gmail.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Mun0910@')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev_secret')
FRONTEND_URL = os.environ.get('FRONTEND_URL', '')

BASE_FEE = 2000

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("paramount")

app = FastAPI(title="Paramount International MUN API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ----------------------------- Models -----------------------------
class Portfolio(BaseModel):
    name: str
    party: Optional[str] = None
    status: Literal["available", "reserved", "allotted"] = "available"
    delegate: Optional[str] = None


class CommitteePref(BaseModel):
    committee: Optional[str] = None
    portfolio: Optional[str] = None


class RegistrationCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str
    email: EmailStr
    phone: str
    school: str
    city: Optional[str] = ""
    experience: str
    awards: Optional[str] = ""
    is_delegation: bool = False
    delegation_size: Optional[int] = None
    dietary: Optional[str] = ""
    heard_from: Optional[str] = ""
    preference1: CommitteePref
    preference2: Optional[CommitteePref] = None
    preference3: Optional[CommitteePref] = None
    referral_code: Optional[str] = ""
    id_card: Optional[str] = ""
    payment_screenshot: Optional[str] = ""
    accepted_terms: bool = False


class AdminLogin(BaseModel):
    email: str
    password: str


class RegistrationStatusUpdate(BaseModel):
    payment_status: Optional[Literal["pending", "verified", "rejected"]] = None
    admin_note: Optional[str] = None


class CommitteeUpdate(BaseModel):
    chair: Optional[str] = None
    eb: Optional[str] = None
    difficulty: Optional[str] = None
    handbook_link: Optional[str] = None
    tag: Optional[str] = None


class PortfolioUpdate(BaseModel):
    status: Literal["available", "reserved", "allotted"]
    delegate: Optional[str] = None


class ReferralCodeCreate(BaseModel):
    code: str
    discount: int = 500
    active: bool = True
    label: Optional[str] = ""


class ReferralCodeUpdate(BaseModel):
    discount: Optional[int] = None
    active: Optional[bool] = None
    label: Optional[str] = None


# ----------------------------- Helpers -----------------------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


def make_ref_id():
    return "PMUN-" + uuid.uuid4().hex[:6].upper()


def make_token():
    payload = {"sub": ADMIN_EMAIL, "role": "admin", "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def require_admin(cred: HTTPAuthorizationCredentials = Depends(security)):
    if cred is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(cred.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


async def send_email(to: str, subject: str, html: str):
    if not resend.api_key:
        logger.warning("No RESEND_API_KEY set; skipping email to %s", to)
        return {"ok": False, "error": "no_api_key", "to": to}
    params = {"from": f"Paramount MUN <{SENDER_EMAIL}>", "to": [to], "subject": subject, "html": html}
    try:
        res = await asyncio.to_thread(resend.Emails.send, params)
        return {"ok": True, "id": res.get("id"), "to": to}
    except Exception as e:
        logger.error("Email send failed to %s: %s", to, str(e))
        return {"ok": False, "error": str(e), "to": to}


def committee_public(doc: dict):
    portfolios = doc.get("portfolios", [])
    open_count = sum(1 for p in portfolios if p.get("status") == "available")
    return {
        "id": doc["id"],
        "slug": doc["slug"],
        "name": doc["name"],
        "full_name": doc["full_name"],
        "agenda": doc["agenda"],
        "tag": doc.get("tag", ""),
        "chair": doc.get("chair", "TBA"),
        "eb": doc.get("eb", "TBA"),
        "difficulty": doc.get("difficulty", "TBA"),
        "handbook_link": doc.get("handbook_link", ""),
        "order": doc.get("order", 0),
        "open_count": open_count,
        "total_count": len(portfolios),
        "portfolios": [
            {"name": p["name"], "party": p.get("party"), "status": p.get("status", "available")}
            for p in portfolios
        ],
    }


# ----------------------------- Email templates -----------------------------
def wrap_email(inner: str):
    return f"""
    <div style="background:#070A0F;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#0E1426;border:1px solid #1E2A44;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #1E2A44;">
          <div style="font-size:11px;letter-spacing:3px;color:#C7A35A;text-transform:uppercase;">Paramount International MUN</div>
          <div style="font-size:12px;color:#9A98A0;margin-top:4px;">9–10 October 2026 · Paramount International School</div>
        </td></tr>
        <tr><td style="padding:28px;color:#F2F0EA;font-size:14px;line-height:1.7;">{inner}</td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #1E2A44;color:#6E7280;font-size:11px;">
          This is an automated message from Paramount International MUN.
        </td></tr>
      </table>
    </div>"""


def organizer_email_html(reg: dict):
    p1 = reg.get("preference1", {}) or {}
    p2 = reg.get("preference2", {}) or {}
    p3 = reg.get("preference3", {}) or {}
    rows = [
        ("Reference ID", reg["reference_id"]),
        ("Name", reg["full_name"]),
        ("Email", reg["email"]),
        ("Phone", reg["phone"]),
        ("School / College", reg["school"]),
        ("City", reg.get("city", "")),
        ("Experience", reg.get("experience", "")),
        ("Awards / Notable MUNs", reg.get("awards", "") or "—"),
        ("Delegation", f"Yes ({reg.get('delegation_size') or '?'})" if reg.get("is_delegation") else "No"),
        ("Heard from", reg.get("heard_from", "") or "—"),
        ("Preference 1", f"{p1.get('committee','—')} — {p1.get('portfolio','') or 'Any'}"),
        ("Preference 2", f"{p2.get('committee','—')} — {p2.get('portfolio','') or 'Any'}"),
        ("Preference 3", f"{p3.get('committee','—')} — {p3.get('portfolio','') or 'Any'}"),
        ("Referral code", reg.get("referral_code", "") or "—"),
        ("ID card uploaded", "Yes" if reg.get("id_card") else "No"),
        ("Fee tier", f"₹{reg['fee']} ({reg['fee_tier']})"),
        ("Payment status", reg["payment_status"]),
    ]
    tr = "".join(
        f"<tr><td style='padding:6px 0;color:#9A98A0;width:42%;vertical-align:top;'>{k}</td>"
        f"<td style='padding:6px 0;color:#F2F0EA;'>{v}</td></tr>" for k, v in rows
    )
    admin_link = f"{FRONTEND_URL}/admin" if FRONTEND_URL else "/admin"
    inner = (
        f"<h2 style='margin:0 0 14px;color:#F2F0EA;font-size:18px;'>New Registration</h2>"
        f"<table width='100%' style='font-size:13px;'>{tr}</table>"
        f"<div style='margin-top:20px;padding:14px 16px;background:#1A1710;border:1px solid #3A2F18;border-radius:10px;'>"
        f"<div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Allot this delegate</div>"
        f"<p style='color:#C9C6BC;margin:6px 0 10px;font-size:13px;'>Open the live matrix to verify payment/ID and allot a portfolio. Confirming a country there removes it from the public registration form instantly.</p>"
        f"<a href='{admin_link}' style='display:inline-block;background:#C7A35A;color:#070A0F;text-decoration:none;font-weight:600;font-size:13px;padding:9px 16px;border-radius:8px;'>Open Live Matrix →</a>"
        f"</div>"
    )
    return wrap_email(inner)


def delegate_email_html(reg: dict):
    inner = f"""
      <h2 style='margin:0 0 8px;color:#F2F0EA;font-size:20px;'>You're on the list.</h2>
      <p style='color:#C9C6BC;margin:0 0 18px;'>Thanks for registering for Paramount International MUN, {reg['full_name'].split(' ')[0]}. Your submission has been received and is now with our organizing committee.</p>
      <div style='background:#121A2F;border:1px solid #1E2A44;border-radius:12px;padding:16px 18px;margin:0 0 18px;'>
        <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Your Reference ID</div>
        <div style='font-size:22px;color:#F2F0EA;letter-spacing:1px;margin-top:4px;font-family:monospace;'>{reg['reference_id']}</div>
      </div>
      <p style='color:#C9C6BC;margin:0 0 6px;'><strong style='color:#F2F0EA;'>Delegate fee:</strong> ₹{reg['fee']}</p>
      <p style='color:#C9C6BC;margin:0 0 18px;'>Your fee includes the full delegate kit — pad file, ID card, pen, notepad, and meals across both conference days.</p>
      <div style='background:#1A1710;border:1px solid #3A2F18;border-radius:12px;padding:14px 16px;'>
        <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Please note</div>
        <p style='color:#C9C6BC;margin:6px 0 0;'>All registrations are <strong style='color:#F2F0EA;'>non-refundable</strong>. If you can't make it, you may transfer your spot to another delegate (subject to organizer re-verification). We'll confirm your committee allotment after payment verification.</p>
      </div>
      <p style='color:#9A98A0;margin:18px 0 0;font-size:12px;'>See you on 9–10 October 2026 at Paramount International School.</p>
    """
    return wrap_email(inner)


# ----------------------------- Public routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "Paramount International MUN API"}


@api_router.get("/committees")
async def get_committees():
    docs = await db.committees.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return [committee_public(d) for d in docs]


@api_router.get("/committees/{slug}")
async def get_committee(slug: str):
    doc = await db.committees.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Committee not found")
    return committee_public(doc)


@api_router.post("/referral/validate")
async def validate_referral(payload: dict):
    code = (payload.get("code") or "").strip().upper()
    if not code:
        return {"valid": False}
    rec = await db.referral_codes.find_one({"code": code, "active": True}, {"_id": 0})
    if rec:
        return {"valid": True, "label": rec.get("label", "")}
    return {"valid": False}


async def _compute_fee(code: Optional[str]):
    code = (code or "").strip().upper()
    if not code:
        return BASE_FEE, "Standard", None
    rec = await db.referral_codes.find_one({"code": code, "active": True}, {"_id": 0})
    if rec:
        return BASE_FEE - int(rec.get("discount", 500)), "Paramount (referral)", code
    return BASE_FEE, "Standard", None


@api_router.post("/registrations")
async def create_registration(payload: RegistrationCreate):
    if not payload.accepted_terms:
        raise HTTPException(status_code=400, detail="You must accept the terms to register.")

    fee, tier, applied_code = await _compute_fee(payload.referral_code)
    reg = payload.model_dump()
    reg["id"] = str(uuid.uuid4())
    reg["reference_id"] = make_ref_id()
    reg["fee"] = fee
    reg["fee_tier"] = tier
    reg["applied_referral"] = applied_code
    reg["payment_status"] = "pending"
    reg["admin_note"] = ""
    # Ensure payment_screenshot key exists (may be empty)
    reg["payment_screenshot"] = reg.get("payment_screenshot") or ""
    reg["created_at"] = now_iso()

    await db.registrations.insert_one(dict(reg))
    if applied_code:
        await db.referral_codes.update_one({"code": applied_code}, {"$inc": {"usage_count": 1}})

    # Fire emails (best-effort)
    org = await send_email(ORGANIZER_EMAIL, f"New MUN Registration — {reg['reference_id']} ({reg['full_name']})", organizer_email_html(reg))
    dele = await send_email(reg["email"], f"Registration received — Paramount International MUN ({reg['reference_id']})", delegate_email_html(reg))
    email_status = {"organizer": org["ok"], "delegate": dele["ok"]}
    await db.registrations.update_one({"id": reg["id"]}, {"$set": {"email_status": email_status}})

    return {
        "ok": True,
        "reference_id": reg["reference_id"],
        "email_status": email_status,
    }


# ----------------------------- Payment screenshot upload -----------------------------
@api_router.post("/registrations/{ref}/screenshot")
async def upload_registration_screenshot(ref: str, file: UploadFile = File(...)):
    # Accept image uploads only
    if not (file.content_type and file.content_type.startswith("image/")):
        raise HTTPException(status_code=400, detail="Only image uploads are accepted")
    try:
        content = await file.read()
        data_url = f"data:{file.content_type};base64," + base64.b64encode(content).decode()
        res = await db.registrations.update_one({"reference_id": ref}, {"$set": {"payment_screenshot": data_url}})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Registration not found")
        doc = await db.registrations.find_one({"reference_id": ref}, {"_id": 0})
        return {"ok": True, "registration": doc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------- Admin routes -----------------------------
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.email.strip().lower() == ADMIN_EMAIL.strip().lower() and payload.password == ADMIN_PASSWORD:
        return {"token": make_token(), "email": ADMIN_EMAIL}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@api_router.get("/admin/me")
async def admin_me(_=Depends(require_admin)):
    return {"email": ADMIN_EMAIL, "role": "admin"}


@api_router.get("/admin/stats")
async def admin_stats(_=Depends(require_admin)):
    total = await db.registrations.count_documents({})
    pending = await db.registrations.count_documents({"payment_status": "pending"})
    verified = await db.registrations.count_documents({"payment_status": "verified"})
    rejected = await db.registrations.count_documents({"payment_status": "rejected"})
    return {"total": total, "pending": pending, "verified": verified, "rejected": rejected}


@api_router.get("/admin/registrations")
async def admin_registrations(_=Depends(require_admin)):
    docs = await db.registrations.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return docs


@api_router.patch("/admin/registrations/{reg_id}")
async def update_registration(reg_id: str, payload: RegistrationStatusUpdate, _=Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.registrations.update_one({"id": reg_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    doc = await db.registrations.find_one({"id": reg_id}, {"_id": 0})
    return doc


@api_router.get("/admin/committees")
async def admin_committees(_=Depends(require_admin)):
    docs = await db.committees.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return docs


@api_router.patch("/admin/committees/{slug}")
async def admin_update_committee(slug: str, payload: CommitteeUpdate, _=Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.committees.update_one({"slug": slug}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Committee not found")
    doc = await db.committees.find_one({"slug": slug}, {"_id": 0})
    return committee_public(doc)


@api_router.patch("/admin/committees/{slug}/portfolios")
async def admin_update_portfolio(slug: str, payload: dict, _=Depends(require_admin)):
    name = payload.get("name")
    new_status = payload.get("status")
    delegate = payload.get("delegate")
    if not name or new_status not in ("available", "reserved", "allotted"):
        raise HTTPException(status_code=400, detail="Invalid portfolio update")
    doc = await db.committees.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Committee not found")
    portfolios = doc.get("portfolios", [])
    found = False
    for p in portfolios:
        if p["name"] == name:
            p["status"] = new_status
            p["delegate"] = delegate
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    await db.committees.update_one({"slug": slug}, {"$set": {"portfolios": portfolios}})
    doc2 = await db.committees.find_one({"slug": slug}, {"_id": 0})
    return committee_public(doc2)


@api_router.get("/admin/referral-codes")
async def admin_list_codes(_=Depends(require_admin)):
    docs = await db.referral_codes.find({}, {"_id": 0}).sort("code", 1).to_list(500)
    return docs


@api_router.post("/admin/referral-codes")
async def admin_create_code(payload: ReferralCodeCreate, _=Depends(require_admin)):
    code = payload.code.strip().upper()
    existing = await db.referral_codes.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Code already exists")
    doc = {
        "id": str(uuid.uuid4()),
        "code": code,
        "discount": payload.discount,
        "active": payload.active,
        "label": payload.label or "",
        "usage_count": 0,
        "created_at": now_iso(),
    }
    await db.referral_codes.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api_router.patch("/admin/referral-codes/{code}")
async def admin_update_code(code: str, payload: ReferralCodeUpdate, _=Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.referral_codes.update_one({"code": code.strip().upper()}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    doc = await db.referral_codes.find_one({"code": code.strip().upper()}, {"_id": 0})
    return doc


@api_router.delete("/admin/referral-codes/{code}")
async def admin_delete_code(code: str, _=Depends(require_admin)):
    await db.referral_codes.delete_one({"code": code.strip().upper()})
    return {"ok": True}


# ----------------------------- Seed -----------------------------
COMMITTEE_DEFS = [
    {
        "slug": "unga",
        "name": "UNGA",
        "full_name": "United Nations General Assembly",
        "agenda": "Code of War: Reimagining Global Frameworks for Artificial Intelligence in Modern Combat, Including Cyber Warfare, Surveillance Systems, and the Prevention of Misuse by State and Non-State Actors.",
        "tag": "Flagship · Advanced agenda",
        "roster": [{"name": c} for c in UNGA_ROSTER],
        "order": 1,
    },
    {
        "slug": "aippm",
        "name": "AIPPM",
        "full_name": "All India Political Parties Meet",
        "agenda": "Deliberation on Electoral Reforms with Special Emphasis on Criminalization of Politics and Transparency.",
        "tag": "High-energy · Indian politics",
        "roster": [{"name": p["name"], "party": p.get("party")} for p in AIPPM_ROSTER],
        "order": 2,
    },
    {
        "slug": "who",
        "name": "WHO",
        "full_name": "World Health Organization",
        "agenda": "Combating the rise of lifestyle diseases among youth and working class (obesity, hypertension, etc).",
        "tag": "Specialized agency",
        "roster": [{"name": c} for c in UN_ROSTER],
        "order": 3,
    },
    {
        "slug": "uncsw",
        "name": "UNCSW",
        "full_name": "UN Commission on the Status of Women",
        "agenda": "Promoting Gender Equality in the Digital Age with Special Emphasis on Bridging the Digital Gender Divide & role of Pink Tax.",
        "tag": "Specialized · Gender & tech",
        "roster": [{"name": c} for c in UN_ROSTER],
        "order": 4,
    },
    {
        "slug": "unhrc",
        "name": "UNHRC",
        "full_name": "UN Human Rights Council",
        "agenda": "Ensuring Human Rights while Expanding National Digital Identity Systems.",
        "tag": "Rights & digital identity",
        "roster": [{"name": c} for c in UN_ROSTER],
        "order": 5,
    },
]


async def seed_data():
    count = await db.committees.count_documents({})
    if count == 0:
        for c in COMMITTEE_DEFS:
            portfolios = []
            for r in c["roster"]:
                portfolios.append({
                    "name": r["name"],
                    "party": r.get("party"),
                    "status": "available",
                    "delegate": None,
                })
            doc = {
                "id": str(uuid.uuid4()),
                "slug": c["slug"],
                "name": c["name"],
                "full_name": c["full_name"],
                "agenda": c["agenda"],
                "tag": c["tag"],
                "chair": "TBA",
                "eb": "TBA",
                "difficulty": "TBA",
                "handbook_link": "/handbook",
                "order": c["order"],
                "portfolios": portfolios,
            }
            await db.committees.insert_one(doc)
        logger.info("Seeded %d committees", len(COMMITTEE_DEFS))

    rc_count = await db.referral_codes.count_documents({})
    if rc_count == 0:
        await db.referral_codes.insert_one({
            "id": str(uuid.uuid4()),
            "code": "PARAMOUNT500",
            "discount": 500,
            "active": True,
            "label": "Paramount International School students",
            "usage_count": 0,
            "created_at": now_iso(),
        })
        logger.info("Seeded default referral code")


@app.on_event("startup")
async def on_startup():
    await seed_data()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
