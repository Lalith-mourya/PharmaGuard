# PharmaGuard - Pharmacogenomic Risk Prediction System

**PharmaGuard** is a robust, production-ready pharmacogenomic (PGx) analysis engine designed to strictly adhere to **CPIC (Clinical Pharmacogenetics Implementation Consortium)** guidelines. 

It predicts drug-gene interactions and associated risks based on patient genetic data (VCF files) using clinically deterministic logic. An LLM layer is used *only* for generating human-readable explanations, ensuring risk assessment reliability.

## Features

- **Strict Clinical Logic**: Rule-based phenotype prediction and risk assessment for 6 critical genes:
  - CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD
- **Drugs Covered**: Codeine, Clopidogrel, Warfarin, Simvastatin, Azathioprine, Fluorouracil.
- **VCF Parsing**: Extracts STAR alleles directly from annotated INFO fields.
- **Deterministic Output**: Risk labels (Safe, Adjust Dosage, etc.) are calculated via code, not AI.
- **AI Explanations**: Uses OpenAI/Gemini to explain *why* a risk exists (biological mechanism).
- **API**: FastAPI backend with strict JSON output schema.

## Architecture

- **Backend**: Python 3.10+, FastAPI
- **Logic**: Custom CPIC interpretation engine (`backend/core/cpic_logic.py`)
- **Parsing**: `pysam` for VCF processing
- **Validation**: Pydantic models for strict outputs

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd PharmaGuard
    ```

2.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Set Environment Variables**:
    Create a `.env` file or export:
    ```bash
    export OPENAI_API_KEY="sk-..."
    # or
    export GEMINI_API_KEY="AIza..."
    ```

## Usage

Start the API server:

```bash
uvicorn backend.main:app --reload
```

### Analyze Endpoint

**POST** `/analyze`

- **Form Data**:
  - `file`: Path to VCF file.
  - `drug_name`: e.g., "Codeine"

**Example Output**:

```json
{
  "drug": "CODEINE",
  "risk_assessment": {
    "risk_label": "Ineffective",
    "severity": "moderate"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "phenotype": "PM",
    "diplotype": "*4/*4"
  }
}
```

## Disclaimer

**For Research/Educational Use Only.** This tool provides predictions based on CPIC guidelines but is not a substitute for professional medical advice or clinical decision-making. Always verify results with a qualified healthcare provider.
