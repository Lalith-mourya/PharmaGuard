Below is your **complete README content in plain text format**.
You can copy this directly into a `.txt` file or rename it as `README.md`.

---

🧬 BIOCYBERX
AI-Powered Pharmacogenomics Intelligence Platform
Transforming raw genomic data into clinically actionable drug recommendations.

---

🌐 LIVE LINKS

Live Demo:
[https://pharma-guard-nu.vercel.app](https://pharma-guard-nu.vercel.app)

GitHub Repository:
[https://github.com/Lalith-mourya/PharmaGuard](https://github.com/Lalith-mourya/PharmaGuard)

LinkedIn Demo Video:
[https://www.linkedin.com/posts/thalladi-monisha-862359293_riftxpwioi-hackathon-24hourchallenge-activity-7430438378124300305-ukML](https://www.linkedin.com/posts/thalladi-monisha-862359293_riftxpwioi-hackathon-24hourchallenge-activity-7430438378124300305-ukML)

---

PROJECT OVERVIEW

Biocyberx is a full-stack pharmacogenomics web application that analyzes VCF (Variant Call Format) files and translates genetic variants into:

* Diplotypes
* Activity Scores
* CPIC-based Phenotypes
* Clinical Drug Recommendations

The platform bridges genomics and clinical decision-making by converting complex genetic data into clear, actionable insights for precision medicine.

---

ARCHITECTURE OVERVIEW

Biocyberx follows a modern serverless full-stack architecture deployed on cloud infrastructure.

1. Frontend (Client Layer)

Built using Next.js and React.

Handles:

* VCF file uploads
* API requests
* Results visualization
* Responsive UI

2. Backend (Application Layer)

Serverless API routes that:

* Parse uploaded VCF files
* Extract rsIDs, genotypes, gene mappings
* Compute diplotype
* Calculate activity score
* Assign phenotype

3. Pharmacogenomics Engine

* Maps allele combinations using CPIC guidelines
* Calculates functional activity score
* Determines metabolizer phenotype
* Generates structured JSON response

4. Deployment Layer

* Hosted on Vercel
* GitHub-integrated CI/CD
* Serverless function execution
* HTTPS secured

---

TECH STACK

Frontend:

* Next.js
* React
* Tailwind CSS
* Framer Motion

Backend:

* Node.js
* Serverless API Routes
* Custom Pharmacogenomics Logic Engine

Data Standards:

* VCF v4.2
* CPIC Guidelines
* GRCh38 Reference Genome

Deployment:

* Vercel
* GitHub Auto Deployment

---

INSTALLATION INSTRUCTIONS

Prerequisites:

* Node.js (v18+ recommended)
* npm or yarn
* Git

Clone the repository:

git clone [https://github.com/Lalith-mourya/PharmaGuard.git](https://github.com/Lalith-mourya/PharmaGuard.git)
cd PharmaGuard

Install dependencies:

npm install

Run development server:

npm run dev

Open in browser:
[http://localhost:3000](http://localhost:3000)

Production build:

npm run build
npm start

---

API DOCUMENTATION

1. Analyze VCF File

Endpoint:
POST /api/analyze

Request Type:
multipart/form-data

Parameters:
Field: file
Type: .vcf
Description: Patient genomic file

Processing Flow:

1. Read VCF metadata
2. Extract rsIDs
3. Map gene variants
4. Determine diplotype
5. Calculate activity score
6. Assign phenotype
7. Generate therapy recommendation

Standard Response Format:

{
"patient_id": "PATIENT_001",
"drug": "Fluorouracil",
"timestamp": "2026-02-20T10:45:00Z",
"risk_assessment": {
"risk_label": "Adjust Dosage",
"confidence_score": 0.92,
"severity": "high"
},
"pharmacogenomic_profile": {
"primary_gene": "DPYD",
"diplotype": "*1/*2",
"phenotype": "Intermediate Metabolizer",
"detected_variants": [
{
"rsid": "rs3918290",
"gene": "DPYD",
"genotype": "A/T",
"clinical_significance": "Decreased function"
}
]
},
"clinical_recommendation": {
"dose_adjustment": "Reduce by 50%",
"alternative_drugs": ["Capecitabine"],
"monitoring_required": true,
"guideline_source": "CPIC"
},
"llm_generated_explanation": {
"summary": "Reduced DPYD activity increases toxicity risk.",
"mechanism": "Decreased enzyme function reduces drug clearance.",
"rationale": "Variant associated with impaired metabolism."
},
"quality_metrics": {
"vcf_parsing_success": true,
"variants_detected_count": 1,
"guideline_matched": true,
"confidence_reasoning_score": 0.89
}
}

2. Health Check

Endpoint:
GET /api/health

Response:

{
"status": "OK"
}

---

USAGE EXAMPLES

Frontend Upload Example (JavaScript):

const formData = new FormData();
formData.append("file", file);

fetch("/api/analyze", {
method: "POST",
body: formData,
});

cURL Example:

curl -X POST [http://localhost:3000/api/analyze](http://localhost:3000/api/analyze) 
-F "file=@sample.vcf"

Interpretation Example:

If VCF contains:
rs4244285   AG

System computes:

* Diplotype → *1/*2
* Activity Score → 1.0
* Phenotype → Intermediate Metabolizer
* Drug Recommendation → Adjust therapy

---

CORE FUNCTIONAL CONCEPTS

Diplotype:
Combination of two star alleles inherited from parents.
Example: *1/*2

Activity Score:
Numeric functional value assigned to alleles.
Example:
*1 = 1
*2 = 0
Total = 1 → Reduced metabolism

Phenotype:
Clinical metabolizer classification:

* Poor Metabolizer
* Intermediate Metabolizer
* Normal Metabolizer
* Rapid Metabolizer
* Ultra-rapid Metabolizer

---

DEPLOYMENT

Biocyberx is deployed using:

* Vercel (Serverless Infrastructure)
* Automatic CI/CD from GitHub
* Secure HTTPS

Live Application:
[https://pharma-guard-nu.vercel.app](https://pharma-guard-nu.vercel.app)

---

TEAM MEMBERS

* Nisha Meela
* Monisha T
* Lalith Mourya
* Shaik Maqil Adnan

---

KEY FEATURES

* Upload and analyze VCF files
* Automated pharmacogenomic interpretation
* CPIC-based phenotype mapping
* Activity score calculation
* Clinical therapy recommendations
* Serverless scalable architecture
* Modern responsive UI

---

FUTURE ENHANCEMENTS

* Multi-gene panel expansion
* Drug interaction dashboard
* Downloadable PDF clinical report
* Integration with hospital EMR systems
* AI-powered genomic risk analysis
----

CONCLUSION

Biocyberx transforms raw genomic variation data into clinical-grade pharmacogenomic intelligence, enabling safer and more personalized drug prescriptions.

---


