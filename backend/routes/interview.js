// // 



















// const express = require("express");
// const router = express.Router();
// const Groq = require("groq-sdk");

// const Interview = require("../models/Interview");
// const Profile = require("../models/Profile");

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// // ================= MEMORY =================
// let sessions = {};

// // ================= RESUME → SKILLS EXTRACTOR =================
// async function extractSkillsFromResume(resumeText, role) {
//   try {
//     const res = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [
//         {
//           role: "system",
//           content: `You are a technical resume parser. 
// Analyze the resume and return ONLY a valid JSON object — no explanation, no markdown, no extra text.
// The JSON must start with { and end with }.
// IMPORTANT: All text values (strengths, weaknesses, improvement, idealAnswer) MUST be in English only. No other language.`,
//         },
//         {
//           role: "user",
//           content: `Parse this resume for the role: "${role}"

// Resume:
// """
// ${resumeText.slice(0, 3000)}
// """

// Instructions:
// - Identify ONLY the skills actually present in this resume
// - Give each skill a starting score (0-100) based on how strong/experienced they appear
// - Score 70-90 = explicitly mentioned with projects/experience
// - Score 40-69 = mentioned but limited experience  
// - Score 10-39 = barely mentioned or implied
// - Include ONLY relevant technical skills (max 8 skills)
// - Skill names must be lowercase, no spaces (e.g. "reactjs", "machinelearning", "python")
// - ALL text values must be in English only

// Return ONLY this JSON format (no extra keys):
// {
//   "skills": {
//     "<skillname>": <score>,
//     "<skillname>": <score>
//   },
//   "summary": "<2 line summary of candidate profile>",
//   "experienceLevel": "<fresher|junior|mid|senior>",
//   "primaryStack": "<main tech stack e.g. MERN, Python/ML, Java/Spring>"
// }`,
//         },
//       ],
//     });

//     let raw = res.choices[0].message.content.trim();
//     console.log("📄 RESUME PARSE RAW:", raw);

//     let parsed = null;
//     try {
//       parsed = JSON.parse(raw);
//     } catch {
//       const match = raw.match(/\{[\s\S]*\}/);
//       if (match) parsed = JSON.parse(match[0]);
//     }

//     if (parsed && parsed.skills && Object.keys(parsed.skills).length > 0) {
//       console.log("✅ Extracted skills from resume:", parsed.skills);
//       return parsed;
//     }
//   } catch (err) {
//     console.error("❌ Resume skill extraction error:", err.message);
//   }

//   // Fallback if AI parse fails
//   console.log("⚠️ Using role-based fallback skills");
//   return getRoleBasedFallback(role);
// }

// // ================= ROLE-BASED FALLBACK =================
// function getRoleBasedFallback(role) {
//   const r = (role || "").toLowerCase();

//   if (r.includes("machine learning") || r.includes("ml") || r.includes("data scientist")) {
//     return {
//       skills: { python: 50, machinelearning: 50, deeplearning: 50, statistics: 50, pandas: 50 },
//       summary: "ML/Data Science candidate",
//       experienceLevel: "junior",
//       primaryStack: "Python/ML",
//     };
//   }
//   if (r.includes("frontend")) {
//     return {
//       skills: { html: 50, css: 50, javascript: 50, reactjs: 50, uiux: 50 },
//       summary: "Frontend developer candidate",
//       experienceLevel: "junior",
//       primaryStack: "React/JS",
//     };
//   }
//   if (r.includes("backend")) {
//     return {
//       skills: { nodejs: 50, expressjs: 50, databases: 50, restapi: 50, systemdesign: 50 },
//       summary: "Backend developer candidate",
//       experienceLevel: "junior",
//       primaryStack: "Node.js/Express",
//     };
//   }
//   if (r.includes("devops") || r.includes("cloud")) {
//     return {
//       skills: { docker: 50, kubernetes: 50, cicd: 50, aws: 50, linux: 50 },
//       summary: "DevOps/Cloud candidate",
//       experienceLevel: "junior",
//       primaryStack: "DevOps/AWS",
//     };
//   }
//   if (r.includes("android")) {
//     return {
//       skills: { kotlin: 50, java: 50, android: 50, jetpackcompose: 50, firebase: 50 },
//       summary: "Android developer candidate",
//       experienceLevel: "junior",
//       primaryStack: "Android/Kotlin",
//     };
//   }
//   return {
//     skills: { javascript: 50, nodejs: 50, reactjs: 50, databases: 50, systemdesign: 50 },
//     summary: "Full stack developer candidate",
//     experienceLevel: "junior",
//     primaryStack: "Full Stack",
//   };
// }

// // ================= START =================
// router.post("/start", async (req, res) => {
//   try {
//     const { userId, role, language, company = "Google", resumeText } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: "userId required" });
//     }

//     // ✅ Extract real skills from resume
//     let resumeData = getRoleBasedFallback(role);

//     if (resumeText && resumeText.trim().length > 50) {
//       // Resume text diya — parse karo
//       resumeData = await extractSkillsFromResume(resumeText, role);
//     } else {
//       // Check if resume was uploaded earlier and saved in DB
//       const existingProfile = await Profile.findOne({ userId });
//       if (existingProfile && existingProfile.resumeText && existingProfile.resumeText.length > 50) {
//         resumeData = await extractSkillsFromResume(existingProfile.resumeText, role);
//       }
//     }

//     const skills = resumeData.skills;

//     // Save resume context to profile
//     await Profile.findOneAndUpdate(
//       { userId },
//       {
//         userId,
//         skills,
//         resumeSummary: resumeData.summary,
//         experienceLevel: resumeData.experienceLevel,
//         primaryStack: resumeData.primaryStack,
//         ...(resumeText ? { resumeText } : {}),
//       },
//       { upsert: true, new: true }
//     );

//     const question = await generateQuestion({
//       role, language, company, skills,
//       weakArea: null,
//       resumeSummary: resumeData.summary,
//       primaryStack: resumeData.primaryStack,
//       experienceLevel: resumeData.experienceLevel,
//     });

//     sessions[userId] = {
//       role, language, company, skills,
//       resumeSummary: resumeData.summary,
//       primaryStack: resumeData.primaryStack,
//       experienceLevel: resumeData.experienceLevel,
//       currentQuestion: question,
//     };

//     res.json({ question, skills });
//   } catch (err) {
//     console.error("❌ Start error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ================= ANSWER =================
// router.post("/answer", async (req, res) => {
//   try {
//     const { userId, answer } = req.body;
//     const session = sessions[userId];

//     if (!session) {
//       return res.status(400).json({ error: "Start interview first" });
//     }

//     const question = session.currentQuestion;

//     // ================= AI EVALUATION =================
//     const evalRes = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [
//         {
//           role: "system",
//           content: `You are a FAANG-level technical interviewer evaluating a ${session.experienceLevel || "junior"} level ${session.primaryStack || ""} candidate.
// You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.
// The JSON must start with { and end with }.
// IMPORTANT: All text values (strengths, weaknesses, improvement, idealAnswer) MUST be in English only. No other language.`,
//         },
//         {
//           role: "user",
//           content: `Evaluate this interview answer strictly and fairly.
// Candidate stack: ${session.primaryStack || "General"}
// Available skill topics to pick from: ${Object.keys(session.skills).join(", ")}

// Return ONLY this JSON format:
// {
//   "score": <number 0-100>,
//   "topic": "<pick the MOST relevant skill from: ${Object.keys(session.skills).join(", ")}>",
//   "communication": <number 0-100>,
//   "technical": <number 0-100>,
//   "confidence": <number 0-100>,
//   "emotion": <number 0-100>,
//   "strengths": "<specific strength of this answer>",
//   "weaknesses": "<specific weakness of this answer>",
//   "improvement": "<exact steps to improve with example>",
//   "idealAnswer": "<best possible answer in simple words with example>"
// }

// Question: ${question}
// Answer: ${answer}`,
//         },
//       ],
//     });

//     // ================= PARSE =================
//     let parsed = null;
//     let raw = evalRes.choices[0].message.content.trim();
//     console.log("🤖 AI EVAL RAW:", raw);

//     try {
//       parsed = JSON.parse(raw);
//     } catch {
//       try {
//         const match = raw.match(/\{[\s\S]*\}/);
//         if (match) parsed = JSON.parse(match[0]);
//       } catch { parsed = null; }
//     }

//     // ================= FALLBACK =================
//     if (!parsed || typeof parsed.score !== "number") {
//       parsed = {
//         score: 50,
//         topic: Object.keys(session.skills)[0] || "general",
//         communication: 50, technical: 50, confidence: 50, emotion: 50,
//         strengths: "Basic attempt made",
//         weaknesses: "Answer needs more depth and clarity",
//         improvement: "Study core concepts and practice explaining them with examples",
//         idealAnswer: "Explain concept with: definition + example + use case",
//       };
//     }

//     // ================= SKILL UPDATE =================
//     // Match returned topic to actual skill key in session
//     const skillKeys = Object.keys(session.skills);
//     const topicRaw = (parsed.topic || "").toLowerCase().replace(/\s+/g, "");
//     const matchedSkill =
//       skillKeys.find(k => k === topicRaw) ||
//       skillKeys.find(k => topicRaw.includes(k) || k.includes(topicRaw)) ||
//       skillKeys[0];

//     const topic = matchedSkill;

//     if (parsed.score > 70) session.skills[topic] = Math.min(100, session.skills[topic] + 5);
//     else if (parsed.score >= 40) session.skills[topic] = Math.min(100, session.skills[topic] + 2);
//     else session.skills[topic] = Math.max(0, session.skills[topic] - 5);

//     // ================= SAVE =================
//     await Interview.findOneAndUpdate(
//       { userId },
//       {
//         userId,
//         skills: session.skills,
//         $push: { questions: question, answers: answer, scores: parsed.score },
//       },
//       { upsert: true, returnDocument: "after" }
//     );

//     let profile = await Profile.findOne({ userId });
//     if (!profile) {
//       profile = await Profile.create({
//         userId, skills: session.skills,
//         totalInterviews: 0, avgScore: 0, bestScore: 0, history: [],
//       });
//     }

//     const oldCount = profile.totalInterviews;
//     const newAvg = Math.round((profile.avgScore * oldCount + parsed.score) / (oldCount + 1));

//     profile.totalInterviews = oldCount + 1;
//     profile.avgScore = newAvg;
//     profile.bestScore = Math.max(profile.bestScore, parsed.score);
//     profile.history.push({ score: parsed.score, date: new Date() });
//     profile.skills = session.skills;
//     profile.level = newAvg > 80 ? "advanced" : newAvg > 60 ? "intermediate" : "beginner";
//     await profile.save();

//     // ================= NEXT QUESTION =================
//     const weakest = Object.keys(session.skills).reduce((a, b) =>
//       session.skills[a] < session.skills[b] ? a : b
//     );

//     const nextQuestion = await generateQuestion({
//       role: session.role, language: session.language, company: session.company,
//       skills: session.skills, weakArea: weakest,
//       resumeSummary: session.resumeSummary,
//       primaryStack: session.primaryStack,
//       experienceLevel: session.experienceLevel,
//     });

//     session.currentQuestion = nextQuestion;

//     res.json({
//       score: parsed.score,
//       nextQuestion,
//       skills: session.skills,
//       weakArea: weakest,
//       feedback: {
//         communication: parsed.communication,
//         technical: parsed.technical,
//         confidence: parsed.confidence,
//         emotion: parsed.emotion,
//         strengths: parsed.strengths,
//         weaknesses: parsed.weaknesses,
//         improvement: parsed.improvement,
//         idealAnswer: parsed.idealAnswer,
//       },
//     });

//   } catch (err) {
//     console.error("❌ Answer route error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ================= REPORT =================
// router.post("/report", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     if (!userId) return res.status(400).json({ error: "userId required" });

//     const profile = await Profile.findOne({ userId });
//     if (!profile) return res.status(404).json({ message: "No profile found" });

//     res.json({
//       userId: profile.userId,
//       totalInterviews: profile.totalInterviews,
//       avgScore: profile.avgScore,
//       bestScore: profile.bestScore,
//       level: profile.level,
//       skills: profile.skills,
//       resumeSummary: profile.resumeSummary,
//       experienceLevel: profile.experienceLevel,
//       primaryStack: profile.primaryStack,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ================= RESET =================
// router.delete("/reset", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     if (!userId) return res.status(400).json({ error: "userId required" });

//     await Profile.deleteOne({ userId });
//     await Interview.deleteOne({ userId });
//     delete sessions[userId];

//     res.json({ success: true, message: "Data reset ho gaya ✅" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ================= DEBUG =================
// router.get("/debug", async (req, res) => {
//   const interviews = await Interview.find();
//   let result = [];
//   interviews.forEach((doc) => {
//     doc.scores.forEach((score) => {
//       result.push({ userId: doc.userId, score });
//     });
//   });
//   res.json(result);
// });

// // ================= QUESTION GENERATOR =================
// async function generateQuestion({ role, language, company, skills, weakArea, resumeSummary, primaryStack, experienceLevel }) {
//   const skillList = Object.entries(skills)
//     .map(([k, v]) => `${k}(${v}%)`)
//     .join(", ");

//   const res = await groq.chat.completions.create({
//     model: "llama-3.3-70b-versatile",
//     messages: [
//       {
//         role: "user",
//         content: `You are a ${company} interviewer conducting a ${role} interview.

// Candidate Profile:
// - Primary Stack: ${primaryStack || role}
// - Experience Level: ${experienceLevel || "junior"}
// - Resume Summary: ${resumeSummary || "Not provided"}
// - Current skill scores: ${skillList}
// - Focus area (weakest skill): ${weakArea || "general"}

// Rules:
// - Ask ONE specific technical question based on their ACTUAL stack
// - ML/Data Science candidate → ask Python/ML/Statistics — NEVER JavaScript or DSA
// - Frontend candidate → ask HTML/CSS/React/JavaScript
// - Backend candidate → ask Node.js/APIs/Databases
// - Match difficulty to experience level (fresher = basic concepts, senior = architecture/design)
// - Focus specifically on their weakest skill: ${weakArea}
// - Output ONLY the question — no explanation, no numbering, no preamble
// - IMPORTANT: Question must be in English only. No other language allowed.`,
//       },
//     ],
//   });

//   return res.choices[0].message.content.trim();
// }

 // module.exports = router;      

































 const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const Interview = require("../models/Interview");
const Profile = require("../models/Profile");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================= MEMORY =================
let sessions = {};

// ================= RESUME → SKILLS EXTRACTOR =================
async function extractSkillsFromResume(resumeText, role) {
  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical resume parser. 
Analyze the resume and return ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must start with { and end with }.
IMPORTANT: All text values (strengths, weaknesses, improvement, idealAnswer) MUST be in English only. No other language.`,
        },
        {
          role: "user",
          content: `Parse this resume for the role: "${role}"

Resume:
"""
${resumeText.slice(0, 3000)}
"""

Instructions:
- Identify ONLY the skills actually present in this resume
- Give each skill a starting score (0-100) based on how strong/experienced they appear
- Score 70-90 = explicitly mentioned with projects/experience
- Score 40-69 = mentioned but limited experience  
- Score 10-39 = barely mentioned or implied
- Include ONLY relevant technical skills (max 8 skills)
- Skill names must be lowercase, no spaces (e.g. "reactjs", "machinelearning", "python")
- ALL text values must be in English only

Return ONLY this JSON format (no extra keys):
{
  "skills": {
    "<skillname>": <score>,
    "<skillname>": <score>
  },
  "summary": "<2 line summary of candidate profile>",
  "experienceLevel": "<fresher|junior|mid|senior>",
  "primaryStack": "<main tech stack e.g. MERN, Python/ML, Java/Spring>"
}`,
        },
      ],
    });

    let raw = res.choices[0].message.content.trim();
    console.log("📄 RESUME PARSE RAW:", raw);

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (parsed && parsed.skills && Object.keys(parsed.skills).length > 0) {
      console.log("✅ Extracted skills from resume:", parsed.skills);
      return parsed;
    }
  } catch (err) {
    console.error("❌ Resume skill extraction error:", err.message);
  }

  console.log("⚠️ Using role-based fallback skills");
  return getRoleBasedFallback(role);
}

// ================= ROLE-BASED FALLBACK =================
function getRoleBasedFallback(role) {
  const r = (role || "").toLowerCase();

  if (r.includes("machine learning") || r.includes("ml") || r.includes("data scientist")) {
    return {
      skills: { python: 50, machinelearning: 50, deeplearning: 50, statistics: 50, pandas: 50 },
      summary: "ML/Data Science candidate",
      experienceLevel: "junior",
      primaryStack: "Python/ML",
    };
  }
  if (r.includes("frontend")) {
    return {
      skills: { html: 50, css: 50, javascript: 50, reactjs: 50, uiux: 50 },
      summary: "Frontend developer candidate",
      experienceLevel: "junior",
      primaryStack: "React/JS",
    };
  }
  if (r.includes("backend")) {
    return {
      skills: { nodejs: 50, expressjs: 50, databases: 50, restapi: 50, systemdesign: 50 },
      summary: "Backend developer candidate",
      experienceLevel: "junior",
      primaryStack: "Node.js/Express",
    };
  }
  if (r.includes("devops") || r.includes("cloud")) {
    return {
      skills: { docker: 50, kubernetes: 50, cicd: 50, aws: 50, linux: 50 },
      summary: "DevOps/Cloud candidate",
      experienceLevel: "junior",
      primaryStack: "DevOps/AWS",
    };
  }
  if (r.includes("android")) {
    return {
      skills: { kotlin: 50, java: 50, android: 50, jetpackcompose: 50, firebase: 50 },
      summary: "Android developer candidate",
      experienceLevel: "junior",
      primaryStack: "Android/Kotlin",
    };
  }
  return {
    skills: { javascript: 50, nodejs: 50, reactjs: 50, databases: 50, systemdesign: 50 },
    summary: "Full stack developer candidate",
    experienceLevel: "junior",
    primaryStack: "Full Stack",
  };
}

// ================= START =================
router.post("/start", async (req, res) => {
  try {
    const { userId, role, language, company = "Google", resumeText } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    let resumeData = getRoleBasedFallback(role);

    if (resumeText && resumeText.trim().length > 50) {
      resumeData = await extractSkillsFromResume(resumeText, role);
    } else {
      const existingProfile = await Profile.findOne({ userId });
      if (existingProfile && existingProfile.resumeText && existingProfile.resumeText.length > 50) {
        resumeData = await extractSkillsFromResume(existingProfile.resumeText, role);
      }
    }

    const skills = resumeData.skills;

    await Profile.findOneAndUpdate(
      { userId },
      {
        userId,
        skills,
        resumeSummary: resumeData.summary,
        experienceLevel: resumeData.experienceLevel,
        primaryStack: resumeData.primaryStack,
        ...(resumeText ? { resumeText } : {}),
      },
      { upsert: true, new: true }
    );

    const question = await generateQuestion({
      role, language, company, skills,
      weakArea: null,
      resumeSummary: resumeData.summary,
      primaryStack: resumeData.primaryStack,
      experienceLevel: resumeData.experienceLevel,
    });

    sessions[userId] = {
      role, language, company, skills,
      resumeSummary: resumeData.summary,
      primaryStack: resumeData.primaryStack,
      experienceLevel: resumeData.experienceLevel,
      currentQuestion: question,
    };

    res.json({ question, skills });
  } catch (err) {
    console.error("❌ Start error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ANSWER =================
router.post("/answer", async (req, res) => {
  try {
    const { userId, answer } = req.body;
    const session = sessions[userId];

    if (!session) {
      return res.status(400).json({ error: "Start interview first" });
    }

    const question = session.currentQuestion;

    const evalRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a FAANG-level technical interviewer evaluating a ${session.experienceLevel || "junior"} level ${session.primaryStack || ""} candidate.
You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must start with { and end with }.
IMPORTANT: All text values (strengths, weaknesses, improvement, idealAnswer) MUST be in English only. No other language.`,
        },
        {
          role: "user",
          content: `Evaluate this interview answer strictly and fairly.
Candidate stack: ${session.primaryStack || "General"}
Available skill topics to pick from: ${Object.keys(session.skills).join(", ")}

Return ONLY this JSON format:
{
  "score": <number 0-100>,
  "topic": "<pick the MOST relevant skill from: ${Object.keys(session.skills).join(", ")}>",
  "communication": <number 0-100>,
  "technical": <number 0-100>,
  "confidence": <number 0-100>,
  "emotion": <number 0-100>,
  "strengths": "<specific strength of this answer>",
  "weaknesses": "<specific weakness of this answer>",
  "improvement": "<exact steps to improve with example>",
  "idealAnswer": "<best possible answer in simple words with example>"
}

Question: ${question}
Answer: ${answer}`,
        },
      ],
    });

    let parsed = null;
    let raw = evalRes.choices[0].message.content.trim();
    console.log("🤖 AI EVAL RAW:", raw);

    try {
      parsed = JSON.parse(raw);
    } catch {
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch { parsed = null; }
    }

    if (!parsed || typeof parsed.score !== "number") {
      parsed = {
        score: 50,
        topic: Object.keys(session.skills)[0] || "general",
        communication: 50, technical: 50, confidence: 50, emotion: 50,
        strengths: "Basic attempt made",
        weaknesses: "Answer needs more depth and clarity",
        improvement: "Study core concepts and practice explaining them with examples",
        idealAnswer: "Explain concept with: definition + example + use case",
      };
    }

    const skillKeys = Object.keys(session.skills);
    const topicRaw = (parsed.topic || "").toLowerCase().replace(/\s+/g, "");
    const matchedSkill =
      skillKeys.find(k => k === topicRaw) ||
      skillKeys.find(k => topicRaw.includes(k) || k.includes(topicRaw)) ||
      skillKeys[0];

    const topic = matchedSkill;

    if (parsed.score > 70) session.skills[topic] = Math.min(100, session.skills[topic] + 5);
    else if (parsed.score >= 40) session.skills[topic] = Math.min(100, session.skills[topic] + 2);
    else session.skills[topic] = Math.max(0, session.skills[topic] - 5);

    await Interview.findOneAndUpdate(
      { userId },
      {
        userId,
        skills: session.skills,
        $push: { questions: question, answers: answer, scores: parsed.score },
      },
      { upsert: true, returnDocument: "after" }
    );

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = await Profile.create({
        userId, skills: session.skills,
        totalInterviews: 0, avgScore: 0, bestScore: 0, history: [],
      });
    }

    const oldCount = profile.totalInterviews;
    const newAvg = Math.round((profile.avgScore * oldCount + parsed.score) / (oldCount + 1));

    profile.totalInterviews = oldCount + 1;
    profile.avgScore = newAvg;
    profile.bestScore = Math.max(profile.bestScore, parsed.score);
    profile.history.push({ score: parsed.score, date: new Date() });
    profile.skills = session.skills;
    profile.level = newAvg > 80 ? "advanced" : newAvg > 60 ? "intermediate" : "beginner";
    await profile.save();

    const weakest = Object.keys(session.skills).reduce((a, b) =>
      session.skills[a] < session.skills[b] ? a : b
    );

    const nextQuestion = await generateQuestion({
      role: session.role, language: session.language, company: session.company,
      skills: session.skills, weakArea: weakest,
      resumeSummary: session.resumeSummary,
      primaryStack: session.primaryStack,
      experienceLevel: session.experienceLevel,
    });

    session.currentQuestion = nextQuestion;

    res.json({
      score: parsed.score,
      nextQuestion,
      skills: session.skills,
      weakArea: weakest,
      feedback: {
        communication: parsed.communication,
        technical: parsed.technical,
        confidence: parsed.confidence,
        emotion: parsed.emotion,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        improvement: parsed.improvement,
        idealAnswer: parsed.idealAnswer,
      },
    });

  } catch (err) {
    console.error("❌ Answer route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= REPORT =================
router.post("/report", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "No profile found" });

    res.json({
      userId: profile.userId,
      totalInterviews: profile.totalInterviews,
      avgScore: profile.avgScore,
      bestScore: profile.bestScore,
      level: profile.level,
      skills: profile.skills,
      resumeSummary: profile.resumeSummary,
      experienceLevel: profile.experienceLevel,
      primaryStack: profile.primaryStack,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= AI RESUME ANALYSIS (NEW) =================
router.post("/analyze-resume", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found. Upload resume first." });

    const resumeText = profile.resumeText;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: "No resume text found. Re-upload your resume." });
    }

    const aiRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert resume reviewer and career coach.
Analyze the resume and return ONLY a valid JSON object — no explanation, no markdown, no extra text.
The JSON must start with { and end with }.
All text values MUST be in English only.`,
        },
        {
          role: "user",
          content: `Analyze this resume deeply and return structured feedback.

Resume:
"""
${resumeText.slice(0, 4000)}
"""

Return ONLY this exact JSON format:
{
  "overallScore": <number 0-100, honest quality score>,
  "experienceLevel": "<fresher|junior|mid|senior>",
  "primaryStack": "<main tech stack>",
  "summary": "<2 sentence honest assessment>",
  "strengths": [
    "<specific strength found in this resume>",
    "<specific strength found in this resume>",
    "<specific strength found in this resume>"
  ],
  "improvements": [
    {
      "priority": "High",
      "issue": "<specific problem found in THIS resume>",
      "fix": "<exact actionable fix with example>"
    },
    {
      "priority": "High",
      "issue": "<specific problem found in THIS resume>",
      "fix": "<exact actionable fix with example>"
    },
    {
      "priority": "Medium",
      "issue": "<specific problem>",
      "fix": "<exact fix>"
    },
    {
      "priority": "Medium",
      "issue": "<specific problem>",
      "fix": "<exact fix>"
    },
    {
      "priority": "Low",
      "issue": "<specific problem>",
      "fix": "<exact fix>"
    }
  ],
  "atsIssues": [
    "<specific ATS problem found in this resume>",
    "<specific ATS problem found in this resume>"
  ],
  "missingSection": ["<section name if missing, e.g. Summary, Projects, Certifications>"],
  "topSkillsFound": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "yearsOfExperience": "<estimated years or fresher>",
  "formatScore": <number 0-100>,
  "contentScore": <number 0-100>,
  "keywordScore": <number 0-100>
}`,
        },
      ],
    });

    let raw = aiRes.choices[0].message.content.trim();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed) {
      return res.status(500).json({ error: "AI analysis failed. Try again." });
    }

    res.json({
      ...parsed,
      totalInterviews: profile.totalInterviews || 0,
      avgScore: profile.avgScore || 0,
      bestScore: profile.bestScore || 0,
      level: profile.level || parsed.experienceLevel || "beginner",
      skills: profile.skills || {},
    });

  } catch (err) {
    console.error("❌ Resume analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================= AI JOB DESCRIPTION MATCH (NEW) =================
router.post("/match-jd", async (req, res) => {
  try {
    const { userId, jobDescription } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: "Job description too short" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found. Upload resume first." });

    const resumeText = profile.resumeText;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: "No resume text found. Re-upload your resume." });
    }

    const aiRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert ATS system and technical recruiter.
Compare resume to job description and return ONLY a valid JSON object.
No explanation, no markdown, no extra text. Start with { end with }.
All text MUST be in English only.`,
        },
        {
          role: "user",
          content: `Analyze how well this resume matches this job description.

RESUME:
"""
${resumeText.slice(0, 3000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 2000)}
"""

Return ONLY this exact JSON:
{
  "atsScore": <number 0-100, realistic ATS match score>,
  "matchLabel": "<Strong Match|Moderate Match|Weak Match>",
  "recommendation": "<1 sentence honest recommendation>",
  "matchedSkills": ["<skill found in both resume AND JD>"],
  "missingSkills": ["<skill in JD but NOT in resume>"],
  "matchedKeywords": ["<keyword found in both>"],
  "missingKeywords": ["<important JD keyword missing from resume>"],
  "roleAlignment": <number 0-100>,
  "experienceAlignment": <number 0-100>,
  "improvements": [
    "<specific actionable tip to improve match for THIS JD>",
    "<specific actionable tip>",
    "<specific actionable tip>"
  ],
  "tailoringTips": [
    "<exact phrase or keyword to add to resume for this JD>",
    "<exact phrase or keyword to add>",
    "<exact phrase or keyword to add>"
  ],
  "strengthsForRole": ["<why candidate is good for this role>"],
  "candidateLevel": "<fresher|junior|mid|senior>",
  "requiredLevel": "<level the JD is asking for>"
}`,
        },
      ],
    });

    let raw = aiRes.choices[0].message.content.trim();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed) {
      return res.status(500).json({ error: "AI analysis failed. Try again." });
    }

    res.json({
      ...parsed,
      avgScore: profile.avgScore || 0,
      totalInterviews: profile.totalInterviews || 0,
      level: profile.level || parsed.candidateLevel || "beginner",
    });

  } catch (err) {
    console.error("❌ JD match error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================= RESET =================
router.delete("/reset", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    await Profile.deleteOne({ userId });
    await Interview.deleteOne({ userId });
    delete sessions[userId];

    res.json({ success: true, message: "Data reset ho gaya ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DEBUG =================
router.get("/debug", async (req, res) => {
  const interviews = await Interview.find();
  let result = [];
  interviews.forEach((doc) => {
    doc.scores.forEach((score) => {
      result.push({ userId: doc.userId, score });
    });
  });
  res.json(result);
});

// ================= QUESTION GENERATOR =================
async function generateQuestion({ role, language, company, skills, weakArea, resumeSummary, primaryStack, experienceLevel }) {
  const skillList = Object.entries(skills)
    .map(([k, v]) => `${k}(${v}%)`)
    .join(", ");

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a ${company} interviewer conducting a ${role} interview.

Candidate Profile:
- Primary Stack: ${primaryStack || role}
- Experience Level: ${experienceLevel || "junior"}
- Resume Summary: ${resumeSummary || "Not provided"}
- Current skill scores: ${skillList}
- Focus area (weakest skill): ${weakArea || "general"}

Rules:
- Ask ONE specific technical question based on their ACTUAL stack
- ML/Data Science candidate → ask Python/ML/Statistics — NEVER JavaScript or DSA
- Frontend candidate → ask HTML/CSS/React/JavaScript
- Backend candidate → ask Node.js/APIs/Databases
- Match difficulty to experience level (fresher = basic concepts, senior = architecture/design)
- Focus specifically on their weakest skill: ${weakArea}
- Output ONLY the question — no explanation, no numbering, no preamble
- IMPORTANT: Question must be in English only. No other language allowed.`,
      },
    ],
  });

  return res.choices[0].message.content.trim();
}

module.exports = router;