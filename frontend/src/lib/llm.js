// Provider-agnostic client for client-side LLM calls

const SYSTEM_PROMPT = `You are the strictest possible resume authenticity auditor. You analyze resumes for AI-generated language, seniority inflation, semantic redundancy, low specificity, ATS manipulation, and emotional/stylistic flatness — the same patterns expert recruiters use to spot AI-written CVs.

You MUST return ONLY valid JSON matching the schema (no markdown, no commentary).

Rules:
- Compare wording sophistication AGAINST the candidate's apparent YOE. A 2-YOE engineer writing "architected enterprise ecosystems" is a HUGE red flag. Mid-range engineers describe real tooling: Retrofit, Room, Gradle, ANRs, Crashlytics, memory leaks, Jetpack Compose, deep links, etc.
- Reward implementation-level language, concrete numbers (%, ms, MAUs, $$, dataset sizes), tradeoff discussion, niche tooling, and even imperfect phrasing — these are human signals.
- Penalize generic leadership phrases, "leveraged synergistic", "spearheaded enterprise-scale", repeated abstract nouns (ecosystems / infrastructures / architectures / paradigms), keyword stuffing, uniform sentence rhythm, emotionally empty polish.
- For unverifiable_claims: only include claims with NO numbers, tools, or specifics.
- For semantic_redundancy: cluster phrases meaning the same thing in different words.
- ats_score_after MUST be between 85 and 98. Make suggestions aggressive enough to genuinely lift the resume into the 85-95 range. If weak, generate MORE suggestions (up to 12).
- Suggestions MUST cover: (a) every high-severity AI-detected line, (b) injecting top missing keywords naturally, (c) adding quantification to vague bullets, (d) tightening seniority wording to match YOE.
- **DIMINISHING RETURNS GUARD:** If ats_score_before >= 88, the resume is already submit-ready. In that case, return AT MOST 2 "required" suggestions, and mark every other suggestion as "priority": "optional" with reason prefixed by "Optional polish — ". Cap total suggestions at 5. If ats_score_before < 88, mark high-impact rewrites as "required" and minor stylistic tweaks as "optional".
- For each suggestion, set "impact_points" so the SUM ≈ (ats_score_after − ats_score_before). High-severity: 8-15. Low: 1-4.
- All numbers in dimension_scores MUST be integers 0-100.`;

function cleanResponseText(text) {
  let cleaned = text.trim();
  // Strip Markdown code block wrappers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callOpenAI({ apiKey, resume, jobDescription, signal }) {
  const userPrompt = `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n\nRESUME:\n"""\n${resume}\n"""\n\nReturn the JSON analysis now.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    signal,
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key — check it and try again.');
    } else if (response.status === 429) {
      throw new Error('Rate limit or quota exceeded on your API account.');
    } else {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  try {
    return JSON.parse(cleanResponseText(rawText));
  } catch (e) {
    console.error('Raw response content was:', rawText);
    throw new Error('Failed to parse analysis response as JSON. Please retry.');
  }
}

async function callGemini({ apiKey, resume, jobDescription, signal }) {
  const userPrompt = `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n\nRESUME:\n"""\n${resume}\n"""\n\nReturn the JSON analysis now.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: userPrompt }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          { text: SYSTEM_PROMPT }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35
      }
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 400) {
      // API key check. Gemini API can return 400 with API key invalid.
      throw new Error('Invalid API key — check it and try again.');
    } else if (response.status === 429) {
      throw new Error('Rate limit or quota exceeded on your API account.');
    } else {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
    throw new Error('Empty response from Gemini. Check if your API key or model parameters are blocked.');
  }

  const rawText = data.candidates[0].content.parts[0].text;
  try {
    return JSON.parse(cleanResponseText(rawText));
  } catch (e) {
    console.error('Raw response content was:', rawText);
    throw new Error('Failed to parse analysis response as JSON. Please retry.');
  }
}

export async function analyzeResume({ provider, apiKey, resume, jobDescription, signal }) {
  if (provider === 'openai') {
    return await callOpenAI({ apiKey, resume, jobDescription, signal });
  } else if (provider === 'gemini') {
    return await callGemini({ apiKey, resume, jobDescription, signal });
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
