export const analyzeData = async (formData: FormData) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const rawError = await response.text();
        let errorMessage = rawError || 'Analysis failed';
        try {
            const errorData = JSON.parse(rawError);
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {
            // Already handled: errorMessage defaults to raw text if JSON parse fails
        }
        throw new Error(errorMessage);
    }

    return response.json();
};
