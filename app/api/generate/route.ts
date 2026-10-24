import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || code.trim() === "") {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing on server" },
        { status: 500 }
      );
    }

    const prompt = `You are a high-precision static code analyzer (OWASP / Snyk style).
Analyze the following ${language || "TypeScript"} code for security vulnerabilities, bugs, or clean code issues.

Code to analyze:
\`\`\`
${code}
\`\`\`

Return ONLY a valid, raw JSON object (no markdown formatting, no code block backticks) using this exact structure:
{
  "score": 70,
  "summary": "Short 1-2 sentence overview of code security status",
  "critical": 1,
  "high": 0,
  "medium": 0,
  "low": 0,
  "findings": [
    {
      "id": "1",
      "title": "Short Issue Title",
      "severity": "Critical",
      "description": "Concise explanation of the vulnerability",
      "line": 1,
      "cwe": "CWE-89",
      "patch": "Suggested patch or corrected code snippet"
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error details:", result);
      return NextResponse.json(
        { error: result.error?.message || "Gemini API request failed" },
        { status: response.status }
      );
    }

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const auditData = JSON.parse(cleanedJson);

    return NextResponse.json(auditData);
  } catch (error: any) {
    console.error("Server API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze code with Gemini AI" },
      { status: 500 }
    );
  }
}
