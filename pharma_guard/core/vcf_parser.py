import os
from typing import List, Dict, Set
from pharma_guard.models.schemas import Detection, QualityMetrics

try:
    import pysam
    # Pysam is often unstable/unsupported on Windows, force fallback
    if os.name == 'nt':
        PYSAM_AVAILABLE = False
    else:
        PYSAM_AVAILABLE = True
except ImportError:
    PYSAM_AVAILABLE = False

class VCFParser:
    def __init__(self, vcf_path: str):
        self.vcf_path = vcf_path
        self.quality_metrics = QualityMetrics(vcf_parsing_success=False, gene_detected=False)

    def parse(self) -> Dict[str, List[str]]:
        """
        Parses VCF and extracts STAR alleles per gene.
        Returns: { "CYP2D6": ["*1", "*4"], ... }
        """
        if PYSAM_AVAILABLE:
            return self._parse_pysam()
        else:
            return self._parse_simple()

    def get_detections(self) -> List[Detection]:
        if PYSAM_AVAILABLE:
            return self._get_detections_pysam()
        else:
            return self._get_detections_simple()

    def _parse_pysam(self) -> Dict[str, List[str]]:
        gene_alleles: Dict[str, Set[str]] = {}
        try:
            save = pysam.set_verbosity(0)
            vcf = pysam.VariantFile(self.vcf_path)
            pysam.set_verbosity(save)
            
            self.quality_metrics.vcf_parsing_success = True
            
            for record in vcf:
                if "GENE" in record.info and "STAR" in record.info:
                    gene = record.info["GENE"][0] if isinstance(record.info["GENE"], tuple) else record.info["GENE"]
                    star = record.info["STAR"][0] if isinstance(record.info["STAR"], tuple) else record.info["STAR"]
                    
                    if gene not in gene_alleles:
                        gene_alleles[gene] = set()
                    gene_alleles[gene].add(star)
                    self.quality_metrics.gene_detected = True
            vcf.close()
            return self._construct_diplotypes(gene_alleles)
        except Exception:
            self.quality_metrics.vcf_parsing_success = False
            return {}

    def _parse_simple(self) -> Dict[str, List[str]]:
        """Fallback simple parser for Windows/No-Pysam"""
        gene_alleles: Dict[str, Set[str]] = {}
        try:
            with open(self.vcf_path, 'r') as f:
                for line in f:
                    if line.startswith("#"): continue
                    parts = line.strip().split('\t')
                    if len(parts) < 8: continue
                    
                    # INFO field is normally at index 7
                    info_str = parts[7]
                    info_dict = {}
                    for item in info_str.split(';'):
                        if '=' in item:
                            k, v = item.split('=', 1)
                            info_dict[k] = v
                    
                    if "GENE" in info_dict and "STAR" in info_dict:
                        gene = info_dict["GENE"]
                        star = info_dict["STAR"]
                        
                        if gene not in gene_alleles:
                            gene_alleles[gene] = set()
                        gene_alleles[gene].add(star)
                        self.quality_metrics.gene_detected = True
                        
            self.quality_metrics.vcf_parsing_success = True
            return self._construct_diplotypes(gene_alleles)
        except Exception:
            self.quality_metrics.vcf_parsing_success = False
            return {}

    def _get_detections_pysam(self) -> List[Detection]:
        detections = []
        try:
            vcf = pysam.VariantFile(self.vcf_path)
            for record in vcf:
                if "STAR" in record.info:
                    star = record.info["STAR"]
                    star_val = star[0] if isinstance(star, tuple) else star
                    detections.append(Detection(rsid=record.id or ".", star_allele=star_val))
            vcf.close()
        except: pass
        return detections

    def _get_detections_simple(self) -> List[Detection]:
        detections = []
        try:
            with open(self.vcf_path, 'r') as f:
                for line in f:
                    if line.startswith("#"): continue
                    parts = line.strip().split('\t')
                    if len(parts) < 8: continue
                    
                    rsid = parts[2]
                    info_str = parts[7]
                    for item in info_str.split(';'):
                        if item.startswith("STAR="):
                            star_val = item.split('=', 1)[1]
                            detections.append(Detection(rsid=rsid, star_allele=star_val))
        except: pass
        return detections

    def _construct_diplotypes(self, gene_alleles: Dict[str, Set[str]]) -> Dict[str, List[str]]:
        final_diplotypes = {}
        target_genes = ["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"]
        
        for gene in target_genes:
            alleles = sorted(list(gene_alleles.get(gene, [])))
            
            if len(alleles) == 0:
                final_diplotypes[gene] = ["*1", "*1"]
            elif len(alleles) == 1:
                final_diplotypes[gene] = [alleles[0], "*1"]
            elif len(alleles) == 2:
                final_diplotypes[gene] = alleles
            else:
                final_diplotypes[gene] = alleles[:2]
                
        return final_diplotypes
