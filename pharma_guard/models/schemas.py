from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict
from enum import Enum
from datetime import datetime

class RiskLabel(str, Enum):
    SAFE = "Safe"
    ADJUST_DOSAGE = "Adjust Dosage"
    TOXIC = "Toxic"
    INEFFECTIVE = "Ineffective"
    UNKNOWN = "Unknown"

class Severity(str, Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class Phenotype(str, Enum):
    PM = "PM"  # Poor Metabolizer
    IM = "IM"  # Intermediate Metabolizer
    NM = "NM"  # Normal Metabolizer
    RM = "RM"  # Rapid Metabolizer
    URM = "URM" # Ultra-Rapid Metabolizer
    UNKNOWN = "Unknown"

class Detection(BaseModel):
    rsid: str
    star_allele: str

class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str = Field(..., example="*1/*4")
    phenotype: Phenotype
    detected_variants: List[Detection]

class RiskAssessment(BaseModel):
    risk_label: RiskLabel
    confidence_score: float
    severity: Severity

class ClinicalRecommendation(BaseModel):
    action: str
    cpic_alignment: bool = True

class LLMExplanation(BaseModel):
    summary: str
    biological_mechanism: str
    clinical_implication: str
    dosing_rationale: str

class QualityMetrics(BaseModel):
    vcf_parsing_success: bool
    gene_detected: bool

class AnalysisResponse(BaseModel):
    patient_id: str
    drug: str
    timestamp: datetime
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics

class AnalysisRequest(BaseModel):
    # Depending on how file upload is handled, this might not be used directly in body
    # but drug name is. File will be form-data
    drug_name: str
