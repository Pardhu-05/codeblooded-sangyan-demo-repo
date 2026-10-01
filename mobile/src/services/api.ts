import { fetch } from "expo/fetch";
import { File } from "expo-file-system";

// Keep this address aligned with the laptop running FastAPI.
// Change it if the laptop's local IP address changes.
const API_BASE_URL = "http://192.168.29.197:8000";

export interface AnalysisSignal {
  category: string;
  severity: string;
  title: string;
  description: string;
}

export interface AnalysisResult {
  status: string;
  extracted_text?: string;
  detected_urls: string[];
  analysis_mode?: string;
  risk: {
    level: string;
    score: number;
  };
  signals: AnalysisSignal[];
  explanation: string;
  verification: string[];
}

export async function sendScreenshotForAnalysis(
  imageUri: string,
  fileName: string,
  mimeType: string
): Promise<AnalysisResult> {
  const imageFile = new File(imageUri);
  const formData = new FormData();

  formData.append(
    "image",
    imageFile as unknown as Blob,
    fileName || "screenshot.jpg"
  );

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const responseText = await response.text();
  let data: unknown;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error("The backend returned an unreadable response.");
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `HTTP ${response.status}`;
    throw new Error(`Screenshot analysis failed: ${detail}`);
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("The backend response has an unexpected format.");
  }

  const result = data as AnalysisResult;
  if (
    !result.risk ||
    !Array.isArray(result.signals) ||
    !Array.isArray(result.verification)
  ) {
    throw new Error("The backend response is missing required analysis fields.");
  }

  // Preserve the existing function signature; the uploaded File carries its URI.
  void mimeType;
  return result;
}
