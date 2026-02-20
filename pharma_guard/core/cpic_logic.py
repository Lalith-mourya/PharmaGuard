from typing import List, Dict, Tuple
from pharma_guard.models.schemas import RiskLabel, Severity, Phenotype

# 1. Allele Activity Scores (CPIC Aligned)

CYP2D6_ACTIVITY = {
    "*1": 1.0, "*2": 1.0, "*33": 1.0, "*35": 1.0, # Normal
    "*10": 0.5, "*17": 0.5, "*29": 0.5, "*41": 0.5, # Decreased
    "*3": 0.0, "*4": 0.0, "*5": 0.0, "*6": 0.0, # No Function
    "*1XN": 2.0, "*2XN": 2.0 # Increased
}

CYP2C19_ACTIVITY = {
    "*1": 1.0, # Normal
    "*17": 2.0, # Increased
    "*2": 0.0, "*3": 0.0 # No Function
}

CYP2C9_ACTIVITY = {
    "*1": 1.0,
    "*2": 0.5,
    "*3": 0.0
}

# SLCO1B1: *5, *15, *17 have reduced function. *1 is normal.
SLCO1B1_ACTIVITY = {
    "*1": 1.0,
    "*5": 0.0, "*15": 0.0, "*17": 0.0 # Simplified: No function / Reduced
}

# TPMT: *1=Normal, *2,*3A,*3B,*3C,*4 = No Function
TPMT_ACTIVITY = {
    "*1": 1.0,
    "*2": 0.0, "*3A": 0.0, "*3B": 0.0, "*3C": 0.0, "*4": 0.0
}

# DPYD: *1=Normal, *2A,*13 = No Function, *9A = Reduced
DPYD_ACTIVITY = {
    "*1": 1.0,
    "*2A": 0.0, "*13": 0.0, 
    "*9A": 0.5
}


# 2. Phenotype Calculation Logic

def calculate_activity_score(alleles: List[str], gene_activity_map: Dict[str, float]) -> float:
    score = 0.0
    for allele in alleles:
        val = gene_activity_map.get(allele, 1.0) 
        score += val
    return score

def get_phenotype_cyp2d6(alleles: List[str]) -> Phenotype:
    score = calculate_activity_score(alleles, CYP2D6_ACTIVITY)
    if score == 0: return Phenotype.PM
    if 0 < score < 1.0: return Phenotype.PM
    if score == 0.5: return Phenotype.IM
    if 1.0 <= score <= 2.0: return Phenotype.NM
    if score > 2.0: return Phenotype.URM
    return Phenotype.UNKNOWN

def get_phenotype_cyp2c19(alleles: List[str]) -> Phenotype:
    c17 = alleles.count("*17")
    no_func = alleles.count("*2") + alleles.count("*3")
    
    if c17 == 0 and no_func == 0: return Phenotype.NM
    if c17 == 1 and no_func == 0: return Phenotype.RM
    if c17 == 2 and no_func == 0: return Phenotype.URM
    if c17 == 0 and no_func == 1: return Phenotype.IM
    if c17 == 0 and no_func == 2: return Phenotype.PM
    if c17 == 1 and no_func == 1: return Phenotype.IM
    return Phenotype.UNKNOWN

def get_phenotype_cyp2c9(alleles: List[str]) -> Phenotype:
    score = calculate_activity_score(alleles, CYP2C9_ACTIVITY)
    if score >= 2.0: return Phenotype.NM
    if 1.0 <= score < 2.0: return Phenotype.IM
    if score < 1.0: return Phenotype.PM
    return Phenotype.UNKNOWN

def get_phenotype_slco1b1(alleles: List[str]) -> Phenotype:
    # Simplified: Any reduced function allele -> Reduced Function
    score = calculate_activity_score(alleles, SLCO1B1_ACTIVITY)
    # *1/*1 = 2.0 -> Normal Function
    # *1/*5 = 1.0 -> Decreased Function
    # *5/*5 = 0.0 -> Poor Function
    if score >= 2.0: return Phenotype.NM
    if 0 < score < 2.0: return Phenotype.IM # Often called "Decreased Function"
    if score == 0: return Phenotype.PM # Often called "Poor Function"
    return Phenotype.UNKNOWN

def get_phenotype_tpmt(alleles: List[str]) -> Phenotype:
    score = calculate_activity_score(alleles, TPMT_ACTIVITY)
    # *1/*1 (2.0) -> Normal
    # *1/*3A (1.0) -> Intermediate
    # *3A/*3A (0.0) -> Poor
    if score >= 2.0: return Phenotype.NM
    if 0 < score < 2.0: return Phenotype.IM
    if score == 0: return Phenotype.PM
    return Phenotype.UNKNOWN

def get_phenotype_dpyd(alleles: List[str]) -> Phenotype:
    score = calculate_activity_score(alleles, DPYD_ACTIVITY)
    # Similar logic
    if score >= 2.0: return Phenotype.NM
    if 1.0 <= score < 2.0: return Phenotype.IM
    if score < 1.0: return Phenotype.PM
    return Phenotype.UNKNOWN


# 3. Drug-Gene Mapping & Risk Logic

DRUG_RISK_MAP = {
    "DATA": {
        "CODEINE": {
            "GENE": "CYP2D6",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.INEFFECTIVE, Severity.MODERATE),
                Phenotype.IM: (RiskLabel.ADJUST_DOSAGE, Severity.LOW),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE),
                Phenotype.URM: (RiskLabel.TOXIC, Severity.CRITICAL)
            }
        },
        "CLOPIDOGREL": {
            "GENE": "CYP2C19",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.INEFFECTIVE, Severity.HIGH),
                Phenotype.IM: (RiskLabel.INEFFECTIVE, Severity.MODERATE),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE),
                Phenotype.RM: (RiskLabel.SAFE, Severity.NONE),
                Phenotype.URM: (RiskLabel.SAFE, Severity.NONE)
            }
        },
        "WARFARIN": {
            "GENE": "CYP2C9",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.TOXIC, Severity.HIGH),
                Phenotype.IM: (RiskLabel.ADJUST_DOSAGE, Severity.MODERATE),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE)
            }
        },
        "SIMVASTATIN": {
            "GENE": "SLCO1B1",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.TOXIC, Severity.HIGH), # Myopathy risk
                Phenotype.IM: (RiskLabel.ADJUST_DOSAGE, Severity.MODERATE),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE)
            }
        },
        "AZATHIOPRINE": {
            "GENE": "TPMT",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.TOXIC, Severity.CRITICAL), # Life-threatening myelosuppression
                Phenotype.IM: (RiskLabel.ADJUST_DOSAGE, Severity.HIGH),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE)
            }
        },
        "FLUOROURACIL": {
            "GENE": "DPYD",
            "MAPPING": {
                Phenotype.PM: (RiskLabel.TOXIC, Severity.CRITICAL), # Fatal toxicity
                Phenotype.IM: (RiskLabel.ADJUST_DOSAGE, Severity.HIGH),
                Phenotype.NM: (RiskLabel.SAFE, Severity.NONE)
            }
        }
    }
}

def analyze_risk(drug_name: str, phenotypes: Dict[str, Phenotype]) -> Tuple[RiskLabel, Severity, float, str]:
    if not drug_name:
         return RiskLabel.UNKNOWN, Severity.NONE, 0.0, "Unknown"
         
    drug_name = drug_name.upper().strip()
    drug_data = DRUG_RISK_MAP["DATA"].get(drug_name)
    
    if not drug_data:
        return RiskLabel.UNKNOWN, Severity.NONE, 0.5, "Gene Unknown"
        
    gene = drug_data["GENE"]
    phenotype = phenotypes.get(gene, Phenotype.NM) # Default to NM if gene not in VCF (safe assumption? No, strictly report Unknown, but usually panels are targeted. Let's fallback to NM for MVP but flag it.)
    
    if gene not in phenotypes:
        # If gene was not tested/found, risk is Unknown
        return RiskLabel.UNKNOWN, Severity.NONE, 0.0, gene

    mapping = drug_data["MAPPING"].get(phenotype)
    
    if mapping:
        return mapping[0], mapping[1], 0.95, gene
        
    return RiskLabel.UNKNOWN, Severity.NONE, 0.4, gene

def calculate_phenotypes(genotypes: Dict[str, List[str]]) -> Dict[str, Phenotype]:
    results = {}
    if "CYP2D6" in genotypes:
        results["CYP2D6"] = get_phenotype_cyp2d6(genotypes["CYP2D6"])
    if "CYP2C19" in genotypes:
        results["CYP2C19"] = get_phenotype_cyp2c19(genotypes["CYP2C19"])
    if "CYP2C9" in genotypes:
        results["CYP2C9"] = get_phenotype_cyp2c9(genotypes["CYP2C9"])
    if "SLCO1B1" in genotypes:
        results["SLCO1B1"] = get_phenotype_slco1b1(genotypes["SLCO1B1"])
    if "TPMT" in genotypes:
        results["TPMT"] = get_phenotype_tpmt(genotypes["TPMT"])
    if "DPYD" in genotypes:
        results["DPYD"] = get_phenotype_dpyd(genotypes["DPYD"])
    
    return results
