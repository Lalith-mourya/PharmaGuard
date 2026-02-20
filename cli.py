import warnings
warnings.filterwarnings("ignore")

import argparse
import sys
import os
import json
from datetime import datetime

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
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
except ImportError as e:
    print(json.dumps({"error": f"Import Error: {e}", "path": sys.path}, indent=2))
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="PharmaGuard CLI - Pharmacogenomic Risk Prediction")
    parser.add_argument("--vcf", required=True, help="Path to VCF file")
    parser.add_argument("--drug", required=True, help="Drug name to analyze")
    parser.add_argument("--key", help="Groq API Key (optional, can use env var GROQ_API_KEY)")
    
    args = parser.parse_args()
    
    # 1. Validate File
    if not os.path.exists(args.vcf):
        print(json.dumps({"error": f"File not found: {args.vcf}"}, indent=2))
        sys.exit(1)
        
    try:
        # 3. Initialize Services
        llm_service = LLMService(api_key=args.key)
        
        # 4. Parse VCF
        vcf_parser = VCFParser(args.vcf)
        genotypes = vcf_parser.parse()
        detections = vcf_parser.get_detections()
        
        # 5. Calculate CPIC Phenotypes
        phenotypes = calculate_phenotypes(genotypes)
        
        # Parse drug names
        drugs = [d.strip() for d in args.drug.split(",") if d.strip()]
        results = []

        for drug in drugs:
            # 6. Analyze Risk
            risk_label, severity, confidence, gene = analyze_risk(drug, phenotypes)
            
            # 7. Prepare Data for LLM/Output
            primary_phenotype = phenotypes.get(gene, Phenotype.UNKNOWN)
            diplotype_list = genotypes.get(gene, ["?", "?"])
            primary_diplotype = "/".join(diplotype_list)
            
            # 8. Generate Explanation
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

            # 9. Construct Response Object
            response = AnalysisResponse(
                patient_id="CLI_USER",
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
            results.append(response.model_dump())

        # 10. Print JSON list to stdout
        print(json.dumps(results, indent=2, default=str))
        
    except Exception as e:
        import traceback
        err_msg = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(err_msg, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
