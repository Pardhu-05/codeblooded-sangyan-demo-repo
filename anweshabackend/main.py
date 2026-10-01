
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from phishing_detector.ocr import extract_text, find_urls


app = FastAPI(
    title="SANGYAN Shield API",
    description="Investor Safety and Resilience Engine API",
    version="1.1.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "message": "SANGYAN Shield API is running"
    }


# --------------------------------------------------
# SCREENSHOT ANALYSIS
# --------------------------------------------------

@app.post("/api/v1/analyze")
async def analyze_screenshot(
    image: UploadFile = File(...)
):

    print("\n" + "=" * 60)
    print("SANGYAN SHIELD OCR ANALYSIS")
    print("=" * 60)

    print("Filename:", image.filename)
    print("Content type:", image.content_type)

    # Read screenshot bytes
    image_bytes = await image.read()

    MAX_IMAGE_SIZE = 10 * 1024 * 1024

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB upload limit."
        )

    print("Image size:", len(image_bytes), "bytes")

    # Convert uploaded bytes into a PIL image
    try:
        screenshot = Image.open(BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or unsupported image."
        )

    print("Image dimensions:", screenshot.size)

    # --------------------------------------------------
    # OCR EXTRACTION
    # --------------------------------------------------

    print("Starting OCR extraction...")

    try:
        extracted_text = extract_text(
            screenshot,
            box=None,
            langs=("en",)
        )

    except Exception as error:
        print("OCR error:", type(error).__name__)

        raise HTTPException(
            status_code=500,
            detail="Unable to extract text from the uploaded image."
        )

    extracted_text = extracted_text.strip()

    detected_urls = find_urls(extracted_text)

    print("OCR completed.")
    print("Extracted characters:", len(extracted_text))
    print("Detected URLs:", len(detected_urls))

    # --------------------------------------------------
    # DEMO SAFETY ANALYSIS
    # --------------------------------------------------
    # These findings are still placeholders.
    # Actual rule-based detection will be integrated next.

    result = {
        "status": "success",

        "extracted_text": extracted_text,

        "detected_urls": detected_urls,

        "analysis_mode": "ocr_with_demo_findings",

        "risk": {
            "level": "HIGH_ATTENTION",
            "score": 8
        },

        "signals": [
            {
                "category": "content",
                "severity": "high",
                "title": "Demo: Guaranteed return claim",
                "description": (
                    "This is a placeholder finding. "
                    "It has not yet been verified against "
                    "the extracted screenshot text."
                )
            },
            {
                "category": "behavior",
                "severity": "medium",
                "title": "Demo: Urgency indicator",
                "description": (
                    "This is a placeholder finding. "
                    "Actual urgency detection is not yet enabled."
                )
            }
        ],

        "explanation": (
            "OCR extraction completed. Safety findings are "
            "currently demo placeholders and should not be "
            "treated as a verified risk assessment."
        ),

        "verification": [
            "Verify the source independently.",
            "Do not share OTPs, passwords, or sensitive information.",
            "Check official investor-protection resources."
        ]
    }

    print("=" * 60)
    print("OCR ANALYSIS COMPLETE")
    print("=" * 60)

    return result