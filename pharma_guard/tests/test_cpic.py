import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from pharma_guard.core.cpic_logic import (
    calculate_activity_score, 
    get_phenotype_cyp2d6, 
    get_phenotype_cyp2c19,
    get_phenotype_cyp2c9,
    analyze_risk,
    CYP2D6_ACTIVITY,
    DRUG_RISK_MAP
)
from pharma_guard.models.schemas import Phenotype, RiskLabel, Severity

def test_cyp2d6_scoring():
    # *1/*1 -> 2.0 (NM)
    assert calculate_activity_score(["*1", "*1"], CYP2D6_ACTIVITY) == 2.0
    assert get_phenotype_cyp2d6(["*1", "*1"]) == Phenotype.NM
    
    # *4/*4 -> 0.0 (PM)
    assert calculate_activity_score(["*4", "*4"], CYP2D6_ACTIVITY) == 0.0
    assert get_phenotype_cyp2d6(["*4", "*4"]) == Phenotype.PM
    
    # *1/*4 -> 1.0 (NM)
    assert calculate_activity_score(["*1", "*4"], CYP2D6_ACTIVITY) == 1.0
    assert get_phenotype_cyp2d6(["*1", "*4"]) == Phenotype.NM

def test_cyp2c19_phenotype():
    assert get_phenotype_cyp2c19(["*1", "*1"]) == Phenotype.NM
    assert get_phenotype_cyp2c19(["*1", "*17"]) == Phenotype.RM
    assert get_phenotype_cyp2c19(["*2", "*2"]) == Phenotype.PM

def test_risk_logic_codeine():
    phenotypes = {"CYP2D6": Phenotype.PM}
    risk, sev, conf, gene = analyze_risk("CODEINE", phenotypes)
    assert risk == RiskLabel.INEFFECTIVE
    assert sev == Severity.MODERATE
    assert gene == "CYP2D6"
    
    phenotypes = {"CYP2D6": Phenotype.URM}
    risk, sev, conf, gene = analyze_risk("Codeine", phenotypes)
    assert risk == RiskLabel.TOXIC
    assert sev == Severity.CRITICAL

def test_risk_logic_warfarin():
    phenotypes = {"CYP2C9": Phenotype.NM}
    risk, sev, conf, gene = analyze_risk("Warfarin", phenotypes)
    assert risk == RiskLabel.SAFE

if __name__ == "__main__":
    try:
        test_cyp2d6_scoring()
        test_cyp2c19_phenotype()
        test_risk_logic_codeine()
        test_risk_logic_warfarin()
        print("ALL TESTS PASSED")
    except AssertionError as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
    except Exception as e:
        print(f"ERROR: {e}")
