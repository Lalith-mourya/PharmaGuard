import os
import sys
import json
from openai import OpenAI
from pharma_guard.core.config import settings
from pharma_guard.models.schemas import LLMExplanation, RiskLabel, Phenotype

class LLMService:
    def __init__(self, api_key: str = None):
        self.client = None
        
        # Prioritize passed key, then settings
        key = api_key or settings.GROQ_API_KEY
        
        if key:
            try:
                self.client = OpenAI(
                    api_key=key,
                    base_url="https://api.groq.com/openai/v1"
                )
                self.model_name = "llama-3.3-70b-versatile" # Using a supported model on Groq
            except Exception as e:
                print(f"DEBUG: Failed to configure Groq/OpenAI client: {e}", file=sys.stderr)

    def generate_explanation(self, 
                             gene: str, 
                             drug: str, 
                             phenotype: Phenotype, 
                             diplotype: str, 
                             risk: RiskLabel, 
                             severity: str) -> LLMExplanation:
        
        prompt = f"""
        You are a Clinical Pharmacogenomics Assistant.
        Generate a structured clinical explanation for the following result.
        
        STRICT RULES:
        1. Adhere to the provided risk ({risk.value}) and phenotype ({phenotype.value}). 
        2. DO NOT change the risk label.
        3. Output MUST be valid JSON with keys: "summary", "biological_mechanism", "clinical_implication", "dosing_rationale".
        
        Parameters:
        - Gene: {gene}
        - Drug: {drug}
        - Diplotype: {diplotype}
        - Phenotype: {phenotype.value}
        - Computed Risk: {risk.value}
        - Severity: {severity}
        """
        
        # Mock response if no client (for local logic verification without credits)
        if not self.client:
            return LLMExplanation(
                summary=f"Patient is a {phenotype.value} of {gene}, leading to {risk.value} usage of {drug}.",
                biological_mechanism="Explanation unavailable (No Groq API Key).",
                clinical_implication=f"Analysis suggests {risk.value} outcome.",
                dosing_rationale="Based on CPIC guidelines for this phenotype."
            )

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
                response_format={"type": "json_object"},
            )
            
            text = chat_completion.choices[0].message.content
            data = json.loads(text)
            
            return LLMExplanation(
                summary=data.get("summary", "Summary unavailable."),
                biological_mechanism=data.get("biological_mechanism", "Mechanism unavailable."),
                clinical_implication=data.get("clinical_implication", "Implication unavailable."),
                dosing_rationale=data.get("dosing_rationale", "Rationale unavailable.")
            )
            
        except Exception as e:
            print(f"DEBUG: Groq API Error: {e}", file=sys.stderr)
            return LLMExplanation(
                summary=f"Analysis for {drug} ({phenotype.value}).",
                biological_mechanism="Explanation unavailable due to API error.",
                clinical_implication=f"Risk: {risk.value}",
                dosing_rationale="Consult CPIC guidelines."
            )

    def generate_clinical_recommendation(self,
                                         gene: str,
                                         drug: str,
                                         phenotype: Phenotype,
                                         diplotype: str,
                                         risk: RiskLabel,
                                         severity: str) -> str:
        
        prompt = f"""
        You are a Clinical Pharmacogenomics Decision Support Assistant.

        Your task is to generate ONLY a clinically actionable recommendation for drug therapy.

        STRICT RULES:

        1. You MUST follow the provided phenotype and risk exactly.
        2. You MUST NOT change or reinterpret the risk.
        3. You MUST NOT mention CPIC guidelines explicitly.
        4. You MUST NOT say "Consult guidelines."
        5. The recommendation must be clear, direct, and actionable.
        6. The output MUST be valid JSON.
        7. The ONLY allowed JSON key is:
           - recommendation_action

        Clinical Context:

        Gene: {gene}
        Drug: {drug}
        Diplotype: {diplotype}
        Phenotype: {phenotype.value}
        Computed Risk: {risk.value}
        Severity: {severity}

        Guidance:

        - If Risk = Safe → Recommend standard dosing.
        - If Risk = Adjust Dosage → Recommend dose modification or enhanced monitoring.
        - If Risk = Ineffective → Recommend alternative therapy.
        - If Risk = Toxic → Recommend avoiding the drug.
        - If Risk = Unknown → Recommend caution and further evaluation.

        Return ONLY valid JSON.
        """
        
        # Mock response if no client
        if not self.client:
            return f"Recommendation unavailable (No API). Default action: Consult guidelines for {phenotype.value}."

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model_name,
                response_format={"type": "json_object"},
            )
            
            text = chat_completion.choices[0].message.content
            data = json.loads(text)
            
            return data.get("recommendation_action", "Recommendation unavailable.")
            
        except Exception as e:
            print(f"DEBUG: Groq API Error (Recommendation): {e}", file=sys.stderr)
            return "Recommendation unavailable due to API error."
