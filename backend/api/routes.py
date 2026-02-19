from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, List
import shutil
import os
import tempfile
from datetime import datetime

from pharma_guard.core.vcf_parser import VCFParser
from pharma_guard.core.cpic_logic import calculate_phenotypes, analyze_risk
from pharma_guard.core.llm_service import LLMService

from pharma_guard.models.schemas import (
    AnalysisResponse, 
    RiskAssessment, 
    PharmacogenomicProfile, 
    ClinicalRecommendation,
    Phenotype
)

router = APIRouter()

@router.post("/analyze", response_model=List[AnalysisResponse])
async def analyze_genomics(
    file: UploadFile = File(...), 
    drug_name: str = Form(...)
):
    """
    Analyzes a VCF file and a drug name (or comma-separated list) to predict pharmacogenomic risk.
    """
    
    # 1. Save Uploaded File Temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".vcf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    try:
        # 2. Parse VCF (Once)
        vcf_parser = VCFParser(tmp_path)
        genotypes = vcf_parser.parse()
        detections = vcf_parser.get_detections()
        
        # 3. Calculate CPIC Phenotypes (Once)
        phenotypes = calculate_phenotypes(genotypes)
        
        # Parse drug names
        drugs = [d.strip() for d in drug_name.split(",") if d.strip()]
        results = []

        llm_service = LLMService() 

        for drug in drugs:
            # 4. Drug-Gene Risk Analysis
            risk_label, severity, confidence, gene = analyze_risk(drug, phenotypes)
            
            # 5. Prepare Data for LLM Explanation
            primary_phenotype = phenotypes.get(gene, Phenotype.UNKNOWN)
            diplotype_list = genotypes.get(gene, ["?", "?"])
            primary_diplotype = "/".join(diplotype_list)
            
            # 6. Generate LLM Explanation
            explanation = llm_service.generate_explanation(
                gene=gene,
                drug=drug,
                phenotype=primary_phenotype,
                diplotype=primary_diplotype,
                risk=risk_label,
                severity=severity.value
            )
            
            # Generate Clinical Recommendation
            recommendation_text = llm_service.generate_clinical_recommendation(
                gene=gene,
                drug=drug,
                phenotype=primary_phenotype,
                diplotype=primary_diplotype,
                risk=risk_label,
                severity=severity.value
            )

            # 7. Construct Response
            response = AnalysisResponse(
                patient_id="PATIENT_001",
                drug=drug,
                timestamp=datetime.now(),
                risk_assessment=RiskAssessment(
                    risk_label=risk_label,
                    confidence_score=confidence,
                    severity=severity
                ),
                pharmacogenomic_profile=PharmacogenomicProfile(
                    primary_gene=gene,
                    diplotype=primary_diplotype,
                    phenotype=primary_phenotype,
                    detected_variants=detections
                ),
                clinical_recommendation=ClinicalRecommendation(
                    action=recommendation_text,
                    cpic_alignment=True
                ),
                llm_generated_explanation=explanation,
                quality_metrics=vcf_parser.quality_metrics
            )
            results.append(response)
        
        return results

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
    finally:
        # Cleanup temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
