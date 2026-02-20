import requests
import os

# Configuration
API_URL = "http://localhost:8000/analyze"
VCF_FILE = "sample_data/patient_001.vcf"
DRUG_NAME = "Codeine,Warfarin"

def test_api():
    print(f"Testing PharmaGuard API at {API_URL}...")
    
    if not os.path.exists(VCF_FILE):
        print(f"Error: Sample file {VCF_FILE} not found!")
        return

    try:
        with open(VCF_FILE, "rb") as f:
            files = {"file": (os.path.basename(VCF_FILE), f, "text/plain")}
            data = {"drug_name": DRUG_NAME}
            
            print(f"Uploading {VCF_FILE} for drug: {DRUG_NAME}")
            response = requests.post(API_URL, files=files, data=data)
            
            if response.status_code == 200:
                print("\n✅ API Request Successful!")
                data = response.json()
                print(f"Received {len(data)} results.")
                print("Response JSON First Item:")
                print(data[0] if data else "No data")
            else:
                print(f"\n❌ API Request Failed with status: {response.status_code}")
                print(response.text)
                
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Is the backend server running?")
        print("Run 'uvicorn backend.main:app --reload' in a separate terminal first.")

if __name__ == "__main__":
    test_api()
