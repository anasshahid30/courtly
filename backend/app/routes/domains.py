from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["domains"])

DOMAINS = [
    {"id": "contract", "name": "Contract law"},
    {"id": "commercial-recovery", "name": "Commercial recovery"},
    {"id": "company-law", "name": "Company law"},
]


@router.get("/domains")
def list_domains():
    return DOMAINS
