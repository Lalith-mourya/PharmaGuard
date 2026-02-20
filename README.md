🧬 Biocyberx
> AI-Powered Pharmacogenomics Intelligence Platform  
> Transforming raw genomic data into clinically actionable drug recommendations.

🌐 Live Links
🔗 Live Demo:https://pharma-guard-nu.vercel.app  
📂 GitHub Repository: https://github.com/Lalith-mourya/PharmaGuard  
🎥 LinkedIn Demo Video:  
https://www.linkedin.com/posts/thalladi-monisha-862359293_riftxpwioi-hackathon-24hourchallenge-activity-7430438378124300305-ukML  

📖 Project Overview
Biocyberx is a full-stack pharmacogenomics web application that analyzes VCF (Variant Call Format) files and translates genetic variants into:
- ✅ Diplotypes  
- ✅ Activity Scores  
- ✅ CPIC-based Phenotypes  
- ✅ Clinical Drug Recommendations  
The platform bridges genomics and clinical decision-making by converting complex genetic data into clear, actionable insights for precision medicine.

🏗 Architecture Overview
Biocyberx follows a modern serverless full-stack architecture deployed on cloud infrastructure.
1️⃣ Frontend (Client Layer)
- Built using Next.js and React
- Handles:
  - VCF file uploads
  - API requests
  - Result visualization
- Responsive and interactive UI
2️⃣ Backend (Application Layer)
- Serverless API routes
- Parses uploaded VCF files
- Extracts:
  - rsIDs
  - Genotypes
  - Gene mappings
- Computes:
  - Diplotype
  - Activity Score
  - Phenotype
3️⃣ Pharmacogenomics Engine
- Maps allele combinations using CPIC guidelines
- Calculates functional activity score
- Determines metabolizer phenotype
- Generates structured JSON response
4️⃣ Deployment Layer
- Hosted on Vercel
- GitHub integrated CI/CD
- Serverless function execution
- HTTPS secured

🛠 Tech Stack
🎨 Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion
 🧠 Backend
- Node.js
- Serverless API Routes
- Custom Pharmacogenomics Logic Engine
🧬 Data Standards
- VCF v4.2 format
- CPIC Guidelines
- GRCh38 Reference Genome
 🚀 Deployment
- Vercel (Serverless Hosting)
- GitHub Auto Deployment

⚙ Installation Instructions
📌 Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Git

🔽 Clone the Repository
bash
git clone https://github.com/Lalith-mourya/PharmaGuard.git
cd PharmaGuard📦 Install Dependencies
bash
npm install

▶ Run Development Server
bash
npm run dev
Open your browser:
http://localhost:3000
Production Build
bash
npm run build
npm start

🔌 API Documentation
 📂 Base Path
/api

1️⃣ Analyze VCF File
Endpoint
POST /api/analyze
Request Type
`multipart/form-data`
 Parameters
| Field | Type | Description          |
| ----- | ---- | -------------------- |
| file  | .vcf | Patient genomic file |

🔁 Processing Flow
1. Read VCF metadata
2. Extract rsIDs
3. Map gene variants
4. Determine diplotype
5. Calculate activity score
6. Assign phenotype
7. Return therapy recommendation

✅ Sample Response
json
{
  "gene": "CYP2C19",
  "diplotype": "*1/*2",
  "activity_score": 1.0,
  "phenotype": "Intermediate Metabolizer",
  "recommendation": "Consider alternative therapy or dose adjustment."
}

2️⃣Health Check
GET /api/health
Response
json
{
  "status": "OK"
}

 🧪 Usage Examples
📤 Frontend Upload Example
javascript
const formData = new FormData();
formData.append("file", file);

fetch("/api/analyze", {
  method: "POST",
  body: formData,
});

🖥 cURL Example
bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@sample.vcf"

🧬 Interpretation Example
If VCF contains:
rs4244285   AG
System computes:
* Diplotype → *1/*2
* Activity Score → 1.0
* Phenotype → Intermediate Metabolizer
* Drug Recommendation → Adjust therapy

🧠 Core Functional Concepts
🔹 Diplotype
Combination of two star alleles inherited from parents.
Example: *1/*2
🔹 Activity Score
Numeric functional value assigned to alleles.
Example:
* *1 = 1
* *2 = 0
  Total = 1 → Reduced metabolism
🔹 Phenotype
Clinical metabolizer classification:
* Poor Metabolizer
* Intermediate Metabolizer
* Normal Metabolizer
* Rapid Metabolizer
* Ultra-rapid Metabolizer

🚀 Deployment
Biocyberx is deployed using:
* Vercel (Serverless Infrastructure)
* Automatic CI/CD from GitHub
* Secure HTTPS
Live Application:
[https://pharma-guard-nu.vercel.app](https://pharma-guard-nu.vercel.app)

👥 Team Members
* Nisha Meela
* Monisha T
* Lalith Mourya
* Shaik Maqil Adnan

🌟 Key Features
✔ Upload and analyze VCF files
✔ Automated pharmacogenomic interpretation
✔ CPIC-based phenotype mapping
✔ Activity score calculation
✔ Clinical therapy recommendations
✔ Serverless scalable architecture
✔ Modern responsive UI
 
🔮 Future Enhancements
* Multi-gene panel expansion
* Drug interaction dashboard
* Downloadable PDF clinical report
* Integration with hospital EMR systems
* AI-powered genomic risk analysis

🏁 Conclusion
Biocyberx transforms raw genomic variation data into clinical-grade pharmacogenomic intelligence, enabling safer and more personalized drug prescriptions.
