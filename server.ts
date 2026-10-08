import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// Helper for fallback generation
function fallbackPortfolioAssist(artistName: string, rawInput: string, currentCategory: string) {
  return {
    bio: `${artistName || 'The artist'} is an emerging creative voice focused on ${currentCategory || 'visual storytelling'}. Drawing deep inspiration from contemporary narratives, heritage, and emotional human experiences, their work bridges local cultural roots with a bold global aesthetic. Dedicated to exploring authentic identity and evolving craft.`,
    suggestedSkills: [
      currentCategory || 'Digital Art',
      'Visual Storytelling',
      'Concept Exploration',
      'Color Theory & Atmosphere',
      'Creative Direction'
    ],
    suggestedTags: [
      'Emerging Artist',
      'Contemporary Art',
      'Cultural Heritage',
      'Storytelling',
      'Global Stage'
    ],
    artistStatement: 'Art is the universal dialect of lived experience. Through my work, I aim to preserve the intimacy of local stories while inviting dialogue across borders.'
  };
}

// 1. AI Portfolio Assistant
app.post('/api/gemini/portfolio-assist', async (req, res) => {
  const { artistName, rawNotes, category, existingSkills } = req.body;

  if (!ai || !apiKey) {
    const fallback = fallbackPortfolioAssist(artistName, rawNotes, category);
    return res.json({ success: true, result: fallback, source: 'fallback' });
  }

  try {
    const prompt = `You are the ARTVERSE AI Portfolio Assistant for emerging artists aiming for the global stage.
Artist Name: ${artistName || 'Emerging Artist'}
Art Category: ${category || 'Visual Art'}
Raw Artist Notes/Idea: "${rawNotes || ''}"
Existing Skills/Style: ${existingSkills?.join(', ') || 'Emerging style'}

Generate a professional, inspiring artist portfolio package formatted as strictly valid JSON with the following structure:
{
  "bio": "A captivating, professional 2-3 paragraph artist biography suitable for international curators, galleries, and global audiences.",
  "suggestedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "suggestedTags": ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"],
  "artistStatement": "A concise, moving 1-2 sentence artist statement describing their artistic philosophy."
}
Return only JSON. Do not include markdown code block backticks if possible, or return strictly parsable JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return res.json({ success: true, result: parsed, source: 'gemini' });
  } catch (error: any) {
    console.warn('Gemini portfolio assist fallback triggered:', error?.message);
    const fallback = fallbackPortfolioAssist(artistName, rawNotes, category);
    return res.json({ success: true, result: fallback, source: 'fallback' });
  }
});

// Helper for fallback artwork assist
function fallbackArtworkAssist(draftTitle: string, rawDescription: string, categoryHint: string) {
  const title = draftTitle || (rawDescription ? 'Vibrant Echoes' : 'Transcending Horizons');
  return {
    title: title,
    description: `A striking exploration of mood, form, and texture. This piece reflects on the interplay between tradition and modern perspective, capturing a fleeting yet poignant stillness in everyday moments.`,
    tags: [
      categoryHint || 'Digital Art',
      'Contemporary',
      'Expressive',
      'Atmosphere',
      'Cultural Identity'
    ],
    suggestedCategory: categoryHint || 'Digital Art'
  };
}

// 2. AI Artwork Assistant (Description, Title & Tag Generator)
app.post('/api/gemini/artwork-assist', async (req, res) => {
  const { title, draftDescription, category, medium } = req.body;

  if (!ai || !apiKey) {
    const fallback = fallbackArtworkAssist(title, draftDescription, category);
    return res.json({ success: true, result: fallback, source: 'fallback' });
  }

  try {
    const prompt = `You are ARTVERSE's AI Artwork Assistant. Transform the creator's rough artwork details into an evocative, professional title, description, and discoverability tags.
Working Title: ${title || 'Untitled'}
Draft Description / Theme: "${draftDescription || ''}"
Category: ${category || 'Digital Art'}
Medium / Style: ${medium || 'Mixed'}

Generate strictly valid JSON:
{
  "title": "A compelling, evocative artwork title (if the current title is generic)",
  "description": "An evocative, professional 2-sentence artwork description highlighting emotion, technical nuance, and cultural or creative narrative.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "suggestedCategory": "Visual Art | Digital Art | Photography | Music | Dance | Film | Writing | 3D / Animation"
}
Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return res.json({ success: true, result: parsed, source: 'gemini' });
  } catch (error: any) {
    console.warn('Gemini artwork assist fallback triggered:', error?.message);
    const fallback = fallbackArtworkAssist(title, draftDescription, category);
    return res.json({ success: true, result: fallback, source: 'fallback' });
  }
});

// 3. AI Artist Recommendation / Matching
app.post('/api/gemini/artist-match', async (req, res) => {
  const { query, artists } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!ai || !apiKey) {
    // Intelligent heuristic fallback
    const q = query.toLowerCase();
    const ranked = (artists || []).map((artist: any) => {
      let score = 50;
      const combined = `${artist.name} ${artist.category} ${artist.location} ${artist.bio} ${(artist.skills || []).join(' ')} ${(artist.tags || []).join(' ')}`.toLowerCase();
      
      const words = q.split(/\s+/).filter(Boolean);
      let matchCount = 0;
      for (const w of words) {
        if (combined.includes(w)) matchCount++;
      }
      
      score = Math.min(96, Math.max(68, Math.round(65 + (matchCount / (words.length || 1)) * 30)));
      return {
        artistId: artist.id,
        matchPercentage: score,
        reason: `Matches your search for "${query}" based on profile category (${artist.category}), location (${artist.location}), and creative style.`,
      };
    }).sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    return res.json({ success: true, matches: ranked.slice(0, 4), source: 'heuristic' });
  }

  try {
    const artistListSummary = (artists || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      location: a.location,
      bio: a.bio,
      skills: a.skills,
      tags: a.tags
    }));

    const prompt = `You are ARTVERSE's AI Artist Matching Engine.
User Natural Language Request: "${query}"

Available Artists:
${JSON.stringify(artistListSummary, null, 2)}

Analyze the user's intent (e.g. style, medium, theme, culture, vibe, location) and rank the top matching artists.
For each matching artist, provide:
- artistId: the exact id string
- matchPercentage: integer between 60 and 97 (platform engagement/stylistic estimate)
- reason: a concise 1-2 sentence explanation of why this artist fits the user's brief.

Format your output as strictly valid JSON:
{
  "matches": [
    {
      "artistId": "id-string",
      "matchPercentage": 92,
      "reason": "Matches your request for Indian cultural digital illustration with deep roots in local mythology."
    }
  ]
}
Return only JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return res.json({ success: true, matches: parsed.matches || [], source: 'gemini' });
  } catch (error: any) {
    console.warn('Gemini artist matching fallback triggered:', error?.message);
    // Return heuristic fallback
    const q = query.toLowerCase();
    const ranked = (artists || []).map((artist: any) => {
      const combined = `${artist.name} ${artist.category} ${artist.location} ${artist.bio} ${(artist.skills || []).join(' ')}`.toLowerCase();
      const match = combined.includes(q.split(' ')[0] || '');
      return {
        artistId: artist.id,
        matchPercentage: match ? 88 : 74,
        reason: `Recommended based on creative discipline (${artist.category}) and profile focus in ${artist.location}.`,
      };
    }).sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);

    return res.json({ success: true, matches: ranked.slice(0, 4), source: 'heuristic' });
  }
});

// 4. AI Opportunity Matching ("Find Opportunities For Me")
app.post('/api/gemini/opportunity-match', async (req, res) => {
  const { artistProfile, opportunities } = req.body;

  if (!ai || !apiKey) {
    const ranked = (opportunities || []).map((opp: any, idx: number) => {
      const matchScore = [94, 88, 82, 79, 75, 71][idx % 6];
      return {
        opportunityId: opp.id,
        matchPercentage: matchScore,
        reason: `Matches your portfolio focus in ${artistProfile?.category || 'creative arts'} and background in ${artistProfile?.location || 'regional projects'}. Strong alignment with ${opp.category}.`
      };
    });
    return res.json({ success: true, matches: ranked, source: 'heuristic' });
  }

  try {
    const oppSummary = (opportunities || []).map((o: any) => ({
      id: o.id,
      title: o.title,
      category: o.category,
      mode: o.mode,
      requirements: o.requirements,
      description: o.description
    }));

    const prompt = `You are ARTVERSE's Opportunity Matching Engine.
Artist Profile:
Name: ${artistProfile?.name || 'Artist'}
Category: ${artistProfile?.category || 'Visual Art'}
Skills: ${(artistProfile?.skills || []).join(', ')}
Bio: "${artistProfile?.bio || ''}"
Location: ${artistProfile?.location || ''}

Opportunities:
${JSON.stringify(oppSummary, null, 2)}

Match and rank each opportunity based on how well it aligns with this artist's creative discipline, technical skills, and career stage.
Return strictly valid JSON:
{
  "matches": [
    {
      "opportunityId": "id-string",
      "matchPercentage": 94,
      "reason": "Clear explanation why this grant or open call fits this artist's style and background."
    }
  ]
}
Return only JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return res.json({ success: true, matches: parsed.matches || [], source: 'gemini' });
  } catch (error: any) {
    console.warn('Gemini opportunity matching fallback triggered:', error?.message);
    const ranked = (opportunities || []).map((opp: any, idx: number) => ({
      opportunityId: opp.id,
      matchPercentage: [94, 88, 82, 78, 74, 70][idx % 6],
      reason: `Recommended based on ${artistProfile?.category || 'artistic'} experience and compatibility with ${opp.title}.`
    }));
    return res.json({ success: true, matches: ranked, source: 'heuristic' });
  }
});

// Configure Vite integration
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ARTVERSE Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
