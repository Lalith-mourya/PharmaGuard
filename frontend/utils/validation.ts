export interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

export const validateVcfFile = async (file: File): Promise<ValidationResult> => {
    // 1. File Size Limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
        return {
            isValid: false,
            error: "File size exceeds 5MB limit. Please upload a smaller VCF file."
        };
    }

    // 2. VCF Format Validation
    // Read only the first 2KB to check headers avoid reading the whole file
    const CHUNK_SIZE = 10 * 1024; // 10KB to cover larger headers
    const chunk = file.slice(0, CHUNK_SIZE);

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                resolve({ isValid: false, error: "Unable to read file." });
                return;
            }

            const lines = text.split('\n');

            // Relaxed validation: Check for VCF indicators anywhere in the first chunk
            // Some VCFs might not have ## at the very top or might use different versioning tags.
            // We'll check for "##" OR "#CHROM" OR just tab-separated structure with chromosome references.

            const hasMetaHeader = text.includes('##');
            const hasChromHeader = text.includes('#CHROM');
            const looksLikeVariantData = lines.some(line => {
                const parts = line.split('\t');
                // Basic VCF has at least 5 columns: CHROM POS ID REF ALT
                return parts.length >= 5 && !line.startsWith('#');
            });

            if (!hasMetaHeader && !hasChromHeader && !looksLikeVariantData) {
                resolve({
                    isValid: false,
                    error: "Invalid VCF format. File does not appear to contain genomic data headers (## or #CHROM)."
                });
            } else {
                resolve({ isValid: true, error: null });
            }
        };

        reader.onerror = () => {
            resolve({ isValid: false, error: "Error reading file." });
        };

        reader.readAsText(chunk);
    });
};
