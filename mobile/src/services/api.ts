import { fetch } from "expo/fetch";
import { File } from "expo-file-system";

const API_BASE_URL = "http://192.168.29.197:8000";

export interface Signal {
  category: string;
  severity: string;
  title: string;
  description: string;
}

export interface AnalysisResult {
  status: string;

  risk: {
    level: string;
    score: number;
  };

  signals: Signal[];

  explanation: string;

  verification: string[];
}

export async function sendScreenshotForAnalysis(
  imageUri: string,
  fileName: string = "screenshot.jpg",
  mimeType: string = "image/jpeg"
): Promise<AnalysisResult> {

  console.log("Preparing screenshot upload...");
  console.log("URI:", imageUri);
  console.log("Filename:", fileName);
  console.log("MIME:", mimeType);

  // --------------------------------------------------
  // Create an Expo File object from the selected image
  // --------------------------------------------------

  const file = new File(imageUri);

  console.log("File created successfully.");
  console.log("File URI:", file.uri);

  // --------------------------------------------------
  // Create multipart FormData
  // --------------------------------------------------

  const formData = new FormData();

  formData.append("image", file);

  console.log(
    "Sending screenshot to:",
    `${API_BASE_URL}/api/v1/analyze`
  );

  // --------------------------------------------------
  // Send request using Expo's fetch implementation
  // --------------------------------------------------

  const response = await fetch(
    `${API_BASE_URL}/api/v1/analyze`,
    {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    }
  );

  console.log("Backend HTTP status:", response.status);

  // --------------------------------------------------
  // Handle backend errors
  // --------------------------------------------------

  if (!response.ok) {

    const errorText = await response.text();

    console.error(
      "Backend returned error:",
      response.status,
      errorText
    );

    throw new Error(
      `Backend returned HTTP ${response.status}: ${errorText}`
    );
  }

  // --------------------------------------------------
  // Convert backend JSON response
  // --------------------------------------------------

  const result: AnalysisResult = await response.json();

  console.log(
    "Backend response received:",
    result
  );

  return result;
}