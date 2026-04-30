// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";

// function ResumeUpload() {
//   // ================= CORE =================
//   const [file, setFile] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(null);

//   const [analysis, setAnalysis] = useState(null);
//   const [jobDesc, setJobDesc] = useState("");
//   const [matchResult, setMatchResult] = useState(null);

//   const [chat, setChat] = useState([]);
//   const [userMsg, setUserMsg] = useState("");

//   const [score, setScore] = useState(0);
//   const [decision, setDecision] = useState("");
//   const [feedback, setFeedback] = useState(null);
//   const [skills, setSkills] = useState(null);

//   const [persona, setPersona] = useState("friendly");
//   const [role, setRole] = useState("Frontend Developer");
//   const [company, setCompany] = useState("Google");

//   const [isListening, setIsListening] = useState(false);
//   const [isAIThinking, setIsAIThinking] = useState(false);

//   // userId ek baar banao aur store karo
//   const userIdRef = useRef("user_" + Date.now());

//   // ================= REFS =================
//   const videoRef = useRef(null);
//   const chatEndRef = useRef(null);
//   const [cameraOn, setCameraOn] = useState(false);

//   const API = "http://localhost:5000";

//   // ================= SAFE CHECK =================
//   const hasResume = () => Boolean(uploadedFile?.text);

//   // ================= AUTO SCROLL =================
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat]);

//   // ================= CAMERA =================
//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       videoRef.current.srcObject = stream;
//       setCameraOn(true);
//     } catch {
//       alert("Camera not allowed");
//     }
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject;
//     stream?.getTracks().forEach((t) => t.stop());
//     setCameraOn(false);
//   };

//   // ================= SCORE DECISION =================
//   const makeDecision = (s) => {
//     if (s >= 80) return "🟢 Hired";
//     if (s >= 60) return "🟡 Maybe";
//     return "🔴 Rejected";
//   };

//   // ================= SPEECH =================
//   const speak = (text) => {
//     const msg = new SpeechSynthesisUtterance(text);
//     msg.rate = persona === "strict" ? 1.1 : 1;
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(msg);
//   };

//   const startListening = () => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) return alert("Speech not supported");

//     const rec = new SR();
//     rec.lang = "en-US";
//     rec.onstart = () => setIsListening(true);
//     rec.onend = () => setIsListening(false);
//     rec.onresult = (e) => setUserMsg(e.results[0][0].transcript);
//     rec.start();
//   };

//   // ================= UPLOAD =================
//   const uploadResume = async () => {
//     if (!file) return alert("Select file first");

//     try {
//       const form = new FormData();
//       form.append("resume", file);

//       // ✅ STEP 1: Resume upload — yeh route exist karta hai
//       const res = await axios.post(`${API}/api/resume/upload`, form);
//       const resumeData = res.data.resume;

//       setUploadedFile(resumeData);
//       setAnalysis(null);
//       setMatchResult(null);
//       setChat([]);
//       setScore(0);
//       setDecision("");
//       setFeedback(null);
//       setSkills(null);

//       // ✅ STEP 2: Interview start karo
//       startInterview(resumeData.text);

//     } catch (err) {
//       console.error("Upload error:", err);
//       alert("Upload failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ================= START INTERVIEW =================
//   const startInterview = async (resumeText) => {
//     try {
//       setIsAIThinking(true);

//       // ✅ SAHI ROUTE: /api/interview/start
//       const res = await axios.post(`${API}/api/interview/start`, {
//         userId: userIdRef.current,
//         role: role,
//         language: "JavaScript",
//         company: company,
//       });

//       const question = res.data.question;
//       setSkills(res.data.skills);

//       setChat([{ role: "assistant", content: question }]);
//       speak(question);

//     } catch (err) {
//       console.error("Interview start error:", err);
//       alert("Interview start failed: " + (err.response?.data?.error || err.message));
//     }

//     setIsAIThinking(false);
//   };

//   // ================= SEND MESSAGE =================
//   const sendMessage = async () => {
//     if (!userMsg.trim() || !hasResume()) return;

//     const newChat = [...chat, { role: "user", content: userMsg }];
//     setChat(newChat);
//     setUserMsg("");
//     setIsAIThinking(true);

//     try {
//       // ✅ SAHI ROUTE: /api/interview/answer
//       const res = await axios.post(`${API}/api/interview/answer`, {
//         userId: userIdRef.current,
//         answer: userMsg,
//       });

//       const { nextQuestion, score: newScore, feedback: fb, skills: sk } = res.data;

//       // Score aur decision update
//       setScore(newScore);
//       setDecision(makeDecision(newScore));
//       setFeedback(fb);
//       setSkills(sk);

//       const updatedChat = [
//         ...newChat,
//         { role: "assistant", content: nextQuestion },
//       ];

//       setChat(updatedChat);
//       speak(nextQuestion);

//     } catch (err) {
//       console.error("Answer error:", err);
//     }

//     setIsAIThinking(false);
//   };

//   // ================= ANALYZE RESUME =================
//   // Note: /api/analyze-resume exist nahi karta, isliye
//   // interview report use karte hain
//   const analyzeResume = async () => {
//     if (!hasResume()) return alert("Pehle resume upload karo");

//     try {
//       // ✅ SAHI ROUTE: /api/interview/report
//       const res = await axios.post(`${API}/api/interview/report`, {
//         userId: userIdRef.current,
//       });

//       setAnalysis(res.data || null);
//     } catch (err) {
//       console.error("Analyze error:", err);
//       alert("Analysis failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ================= JOB MATCH =================
//   // Note: /api/job-match exist nahi karta abhi
//   // Temporary: skills ke basis pe match dikhao
//   const matchJob = async () => {
//     if (!hasResume()) return alert("Pehle resume upload karo");
//     if (!jobDesc.trim()) return alert("Job description likho");

//     try {
//       // ✅ Agar job-match route exist karta ho to yeh use karo
//       // Abhi ke liye interview report se skills match karte hain
//       const res = await axios.post(`${API}/api/interview/report`, {
//         userId: userIdRef.current,
//       });

//       // Simple keyword match
//       const jdLower = jobDesc.toLowerCase();
//       const skillKeys = Object.keys(res.data.skills || {});
//       const matched = skillKeys.filter(s => jdLower.includes(s));

//       setMatchResult({
//         matchedSkills: matched,
//         totalSkills: skillKeys.length,
//         matchPercent: Math.round((matched.length / skillKeys.length) * 100),
//         level: res.data.level,
//         avgScore: res.data.avgScore,
//       });

//     } catch (err) {
//       console.error("Job match error:", err);
//       alert("Job match failed: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ================= UI =================
//   return (
//     <div className="min-h-screen bg-black text-white p-6">

//       <h1 className="text-3xl font-bold text-center mb-6">
//         🚀 AI Interview System
//       </h1>

//       {/* CAMERA */}
//       <div className="flex flex-col items-center mt-4">
//         <video
//           ref={videoRef}
//           autoPlay
//           className="w-96 h-64 bg-gray-800 rounded"
//         />
//         <div className="flex gap-3 mt-2">
//           {!cameraOn ? (
//             <button
//               onClick={startCamera}
//               className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
//             >
//               Start Camera
//             </button>
//           ) : (
//             <button
//               onClick={stopCamera}
//               className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
//             >
//               Stop Camera
//             </button>
//           )}
//         </div>
//       </div>

//       {/* SETTINGS ROW */}
//       <div className="flex gap-4 justify-center mt-4 flex-wrap">
//         {/* Persona */}
//         <select
//           className="text-black p-2 rounded"
//           value={persona}
//           onChange={(e) => setPersona(e.target.value)}
//         >
//           <option value="friendly">Friendly AI</option>
//           <option value="strict">Strict AI</option>
//         </select>

//         {/* Role */}
//         <select
//           className="text-black p-2 rounded"
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//         >
//           <option value="Frontend Developer">Frontend Developer</option>
//           <option value="Backend Developer">Backend Developer</option>
//           <option value="Full Stack Developer">Full Stack Developer</option>
//           <option value="Data Scientist">Data Scientist</option>
//           <option value="DevOps Engineer">DevOps Engineer</option>
//           <option value="Machine Learning">Machine Learning</option>
//           <option value="Cloud Engineer">Cloud Engineer</option>
//         </select>

//         {/* Company */}
//         <select
//           className="text-black p-2 rounded"
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//         >
//           <option value="Google">Google</option>
//           <option value="Amazon">Amazon</option>
//           <option value="Microsoft">Microsoft</option>
//           <option value="Meta">Meta</option>
//           <option value="Apple">Apple</option>
//           <option value="Oracle">Oracle</option>
          
//         </select>
//       </div>

//       {/* SCORE */}
//       <div className="text-center mt-4 bg-white/10 p-3 rounded">
//         <p className="text-xl font-bold">Score: {score}</p>
//         <p className="text-lg">{decision}</p>
//       </div>

//       {/* SKILLS */}
//       {skills && (
//         <div className="bg-white/10 p-3 mt-3 rounded">
//           <p className="font-bold mb-2">📊 Skills:</p>
//           <div className="flex flex-wrap gap-2">
//             {Object.entries(skills).map(([skill, val]) => (
//               <span
//                 key={skill}
//                 className="bg-blue-500/30 px-3 py-1 rounded-full text-sm"
//               >
//                 {skill}: {val}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* UPLOAD */}
//       <div className="bg-white/10 p-4 mt-4 rounded">
//         <p className="font-bold mb-2">📄 Resume Upload</p>
//         <input
//           type="file"
//           accept=".pdf,.txt,.docx"
//           onChange={(e) => setFile(e.target.files[0])}
//           className="mb-2 block"
//         />
//         <div className="flex gap-3 mt-2">
//           <button
//             onClick={uploadResume}
//             className="px-5 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow-lg hover:shadow-blue-400/50 hover:scale-105 transition-all duration-300"
//           >
//             Upload & Start Interview
//           </button>
//           <button
//             onClick={analyzeResume}
//             className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold shadow-lg hover:shadow-pink-400/50 hover:scale-105 transition-all duration-300"
//           >
//             Analyze Resume
//           </button>
//         </div>
//       </div>

//       {/* ANALYSIS RESULT */}
//        {analysis && ( 
//    //     <div className="bg-green-500/20 p-3 mt-3 rounded">
//    //       <p className="font-bold mb-1">📈 Analysis Report:</p>
//    //       <p>Total Interviews: {analysis.totalInterviews}</p>
//    //       <p>Avg Score: {analysis.avgScore}</p>
//    //       <p>Best Score: {analysis.bestScore}</p>
//    //      <p>Level: {analysis.level}</p>
//    //    </div>
//    //  )} 
       
//         <pre className="bg-green-500/20 p-2 mt-2 rounded text-xs"> {JSON.stringify(analysis, null, 2)} </pre> )} 

  
//       {/* JOB MATCH */}
//       <div className="bg-white/10 p-4 mt-4 rounded">
//         <p className="font-bold mb-2">💼 Job Match</p>
//         <textarea
//           className="w-full text-black p-2 rounded"
//           rows={3}
//           placeholder="Job description paste karo..."
//           value={jobDesc}
//           onChange={(e) => setJobDesc(e.target.value)}
//         />
//         <button
//           onClick={matchJob}
//           className="mt-2 px-5 py-2 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:shadow-green-400/50 hover:scale-105 transition-all duration-300"
//         >
//           Match Job
//         </button>
//       </div>

//       {/* JOB MATCH RESULT */}
//       {matchResult && (
//         <div className="bg-blue-500/20 p-3 mt-3 rounded">
//           <p className="font-bold mb-1">🎯 Match Result:</p>
//           <p>Match: {matchResult.matchPercent}%</p>
//           <p>Matched Skills: {matchResult.matchedSkills.join(", ") || "None"}</p>
//           <p>Level: {matchResult.level}</p>
//           <p>Avg Score: {matchResult.avgScore}</p>
//         </div>
//       )}

//       {/* CHAT */}
//       <div className="bg-white/10 p-4 mt-4 rounded">
//         <p className="font-bold mb-2">🤖 Interview Chat</p>
//         <div className="h-60 overflow-y-auto space-y-2">
//           {chat.map((m, i) => (
//             <div
//               key={i}
//               className={`p-2 rounded ${
//                 m.role === "assistant"
//                   ? "bg-blue-500/20 text-blue-200"
//                   : "bg-white/10 text-white text-right"
//               }`}
//             >
//               <b>{m.role === "assistant" ? "🤖 AI" : "👤 You"}:</b> {m.content}
//             </div>
//           ))}
//           <div ref={chatEndRef} />
//         </div>

//         {isAIThinking && (
//           <p className="text-yellow-400 mt-1">🤖 AI thinking...</p>
//         )}
//         {isListening && (
//           <p className="text-red-400 mt-1">🎤 Listening...</p>
//         )}

//         <input
//           className="w-full text-black p-2 mt-2 rounded"
//           placeholder="Apna jawab likho..."
//           value={userMsg}
//           onChange={(e) => setUserMsg(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />

//         <div className="flex gap-3 mt-2">
//           <button
//             onClick={startListening}
//             className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:shadow-red-400/50 hover:scale-105 transition-all duration-300"
//           >
//             🎤 Speak
//           </button>
//           <button
//             onClick={sendMessage}
//             className="px-5 py-2 rounded-xl bg-violet-500 text-white font-semibold shadow-lg hover:shadow-violet-400/50 hover:scale-105 transition-all duration-300"
//           >
//             Send
//           </button>
//         </div>
//       </div>

//       {/* FEEDBACK */}
//       {feedback && (
//         <div className="bg-white/10 p-4 mt-4 rounded space-y-1">
//           <p className="font-bold text-lg">📋 Last Answer Feedback:</p>
//           <p>💬 Communication: {feedback.communication}/100</p>
//           <p>⚙️ Technical: {feedback.technical}/100</p>
//           <p>💪 Confidence: {feedback.confidence}/100</p>
//           <p>✅ Strengths: {feedback.strengths}</p>
//           <p>⚠️ Weaknesses: {feedback.weaknesses}</p>
//           <p>📈 Improvement: {feedback.improvement}</p>
//           <p className="text-green-300">💡 Ideal Answer: {feedback.idealAnswer}</p>
//         </div>
//       )}

//     </div>
//   );
// }

// export default ResumeUpload; 























import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// ─── GLASSMORPHISM + DARK THEME ───────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050810;
    --bg2: #090d1a;
    --glass: rgba(255,255,255,0.04);
    --glass2: rgba(255,255,255,0.08);
    --border: rgba(255,255,255,0.08);
    --accent: #6366f1;
    --accent2: #8b5cf6;
    --cyan: #06b6d4;
    --green: #10b981;
    --red: #ef4444;
    --yellow: #f59e0b;
    --text: #e2e8f0;
    --muted: #64748b;
  }

  body { font-family: 'Space Grotesk', sans-serif; background: var(--bg); color: var(--text); }

  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.1) 0%, transparent 60%);
    padding: 24px 16px;
    max-width: 900px;
    margin: 0 auto;
  }

  h1.title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 800;
    text-align: center;
    background: linear-gradient(135deg, #a5b4fc, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .subtitle { text-align: center; color: var(--muted); font-size: 0.85rem; margin-bottom: 28px; }

  .card {
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    backdrop-filter: blur(12px);
    transition: border-color 0.3s;
  }
  .card:hover { border-color: rgba(99,102,241,0.3); }

  .card-title {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* BUTTONS */
  .btn {
    padding: 10px 20px;
    border-radius: 10px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    border: none;
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
  .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
  .btn-danger:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(239,68,68,0.4); }
  .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
  .btn-green:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.4); }
  .btn-cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; }
  .btn-cyan:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(6,182,212,0.4); }
  .btn-ghost { background: var(--glass2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.12); }

  /* SELECTS & INPUTS */
  select, input[type="number"] {
    background: var(--glass2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 9px 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s;
  }
  select:focus, input[type="number"]:focus { border-color: var(--accent); }
  select option { background: #1e1e2e; }

  textarea, .chat-input {
    background: var(--glass2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    padding: 10px 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    outline: none;
    width: 100%;
    resize: vertical;
    transition: border-color 0.2s;
  }
  textarea:focus, .chat-input:focus { border-color: var(--accent); }
  textarea::placeholder, .chat-input::placeholder { color: var(--muted); }

  /* SCORE RING */
  .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .score-val {
    position: absolute;
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    background: linear-gradient(135deg, #a5b4fc, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* CHAT BUBBLES */
  .bubble-ai {
    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 0 14px 14px 14px;
    padding: 12px 16px;
    font-size: 0.88rem;
    line-height: 1.5;
  }
  .bubble-user {
    background: var(--glass2);
    border: 1px solid var(--border);
    border-radius: 14px 14px 0 14px;
    padding: 12px 16px;
    font-size: 0.88rem;
    text-align: right;
    line-height: 1.5;
  }

  /* SKILL TAGS */
  .skill-tag {
    background: rgba(6,182,212,0.12);
    border: 1px solid rgba(6,182,212,0.25);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--cyan);
  }

  /* PROGRESS BAR */
  .progress-bar {
    height: 6px;
    background: var(--glass2);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s ease;
  }

  /* STAT CARD */
  .stat {
    background: var(--glass2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    flex: 1;
    min-width: 120px;
  }
  .stat-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; }
  .stat-label { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

  /* FILE INPUT */
  .file-area {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .file-area:hover { border-color: var(--accent); color: var(--text); background: rgba(99,102,241,0.05); }
  .file-area.has-file { border-color: var(--green); color: var(--green); background: rgba(16,185,129,0.05); }

  /* VIDEO */
  video {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: 12px;
    background: #0d1117;
  }

  /* TABS */
  .tab { padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 0.83rem; font-weight: 600; border: none; background: transparent; color: var(--muted); transition: all 0.2s; }
  .tab.active { background: var(--glass2); color: var(--text); border: 1px solid var(--border); }

  /* TIMER */
  .timer-badge {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 6px 14px;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fca5a5;
  }
  .timer-badge.warn { color: var(--red); background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.5); }

  /* SECTION DIVIDER */
  .divider { height: 1px; background: var(--border); margin: 20px 0; }

  /* REPORT SECTION */
  .report-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
  .report-row:last-child { border-bottom: none; }

  /* TOOLTIP / BADGE */
  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .badge-green { background: rgba(16,185,129,0.2); color: #34d399; }
  .badge-yellow { background: rgba(245,158,11,0.2); color: #fbbf24; }
  .badge-red { background: rgba(239,68,68,0.2); color: #f87171; }
  .badge-blue { background: rgba(99,102,241,0.2); color: #a5b4fc; }

  /* THINKING DOTS */
  @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); display: inline-block; animation: blink 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  /* PULSE */
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  .pulse { animation: pulse 2s infinite; }

  /* SECTION HEADER */
  .section-icon { font-size: 1.1rem; }

  /* FLEX UTILS */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .flex-wrap { flex-wrap: wrap; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .mb-2 { margin-bottom: 8px; }
  .w-full { width: 100%; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-muted { color: var(--muted); font-size: 0.8rem; }
  .text-green { color: #34d399; }
  .text-red { color: #f87171; }
  .text-yellow { color: #fbbf24; }
  .text-cyan { color: var(--cyan); }
  .text-accent { color: #a5b4fc; }
  .bold { font-weight: 700; }
  .font-sm { font-size: 0.83rem; }

  input[type="file"] { display: none; }

  @media (max-width: 600px) {
    .app { padding: 16px 12px; }
    .stat { min-width: 90px; }
  }
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const getDecision = (s) => {
  if (s >= 80) return { label: "Hired 🟢", cls: "badge-green" };
  if (s >= 60) return { label: "Maybe 🟡", cls: "badge-yellow" };
  return { label: "Rejected 🔴", cls: "badge-red" };
};

const ScoreRing = ({ score, size = 120 }) => {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className="score-val">{score}</span>
    </div>
  );
};

const ProgressBar = ({ val, color = "#6366f1" }) => (
  <div className="progress-bar" style={{ marginTop: 4 }}>
    <div className="progress-fill" style={{ width: `${val}%`, background: color }} />
  </div>
);

const ThinkingDots = () => (
  <div className="flex gap-2 items-center" style={{ padding: "8px 0" }}>
    <span className="dot" /><span className="dot" /><span className="dot" />
    <span className="text-muted" style={{ fontSize: "0.78rem" }}>AI is thinking…</span>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [chat, setChat] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [skills, setSkills] = useState(null);
  const [persona, setPersona] = useState("friendly");
  const [role, setRole] = useState("Frontend Developer");
  const [company, setCompany] = useState("Google");
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [activeTab, setActiveTab] = useState("interview"); // interview | report | match | resume

  // ── Settings ──
  const [questionLimit, setQuestionLimit] = useState(10);
  const [timeLimitMin, setTimeLimitMin] = useState(30);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [interviewDone, setInterviewDone] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const userIdRef = useRef("user_" + Date.now());
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const API = "http://localhost:5000";

  const hasResume = () => Boolean(uploadedFile?.text);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ── Timer ──
  useEffect(() => {
    if (interviewStarted && !interviewDone) {
      setTimeLeft(timeLimitMin * 60);
    }
  }, [interviewStarted]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      endInterview();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const formatTime = (s) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── Camera ──
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch { alert("Camera not allowed"); }
  };
  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    setCameraOn(false);
  };

  // ── Speech ──
  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = persona === "strict" ? 1.1 : 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech not supported");
    const rec = new SR();
    rec.lang = "en-US";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setUserMsg(e.results[0][0].transcript);
    rec.start();
  };

  // ── Upload ──
  const uploadResume = async () => {
    if (!file) return alert("Select a file first");
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("userId", userIdRef.current);
      const res = await axios.post(`${API}/api/resume/upload`, form);
      const resumeData = res.data.resume;
      setUploadedFile(resumeData);
      setAnalysis(null); setMatchResult(null); setChat([]);
      setScore(0); setFeedback(null); setSkills(null);
      setQuestionsAsked(0); setInterviewDone(false); setFinalReport(null);
      setInterviewStarted(false);
      alert("✅ Resume uploaded! Now configure settings and start interview.");
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  // ── Start Interview ──
  const startInterview = async () => {
    if (!hasResume()) return alert("Upload resume first");
    try {
      setIsAIThinking(true);
      setInterviewDone(false); setFinalReport(null); setQuestionsAsked(0);
      const res = await axios.post(`${API}/api/interview/start`, {
        userId: userIdRef.current, role, language: "JavaScript", company,
      });
      const question = res.data.question;
      setSkills(res.data.skills);
      setChat([{ role: "assistant", content: question }]);
      setQuestionsAsked(1);
      setInterviewStarted(true);
      speak(question);
    } catch (err) {
      alert("Interview start failed: " + (err.response?.data?.error || err.message));
    }
    setIsAIThinking(false);
  };

  // ── Send Answer ──
  const sendMessage = async () => {
    if (!userMsg.trim() || !hasResume() || interviewDone) return;
    const newChat = [...chat, { role: "user", content: userMsg }];
    setChat(newChat); setUserMsg(""); setIsAIThinking(true);
    try {
      const res = await axios.post(`${API}/api/interview/answer`, {
        userId: userIdRef.current, answer: userMsg,
      });
      const { nextQuestion, score: newScore, feedback: fb, skills: sk } = res.data;
      setScore(newScore); setFeedback(fb); setSkills(sk);
      const nextQ = questionsAsked + 1;
      setQuestionsAsked(nextQ);
      if (nextQ >= questionLimit) {
        setChat([...newChat, { role: "assistant", content: "✅ All questions done! Generating your report..." }]);
        endInterview();
      } else {
        setChat([...newChat, { role: "assistant", content: nextQuestion }]);
        speak(nextQuestion);
      }
    } catch (err) { console.error(err); }
    setIsAIThinking(false);
  };

  // ── End Interview ──
  const endInterview = async () => {
    clearTimeout(timerRef.current);
    setInterviewDone(true);
    setInterviewStarted(false);
    window.speechSynthesis.cancel();
    try {
      const res = await axios.post(`${API}/api/interview/report`, { userId: userIdRef.current });
      setFinalReport(res.data);
      setActiveTab("report");
    } catch (err) { console.error("Report fetch error:", err); }
  };

  // ── Analyze Resume ──
  // const analyzeResume = async () => {
  //   if (!hasResume()) return alert("Upload resume first");
  //   try {
  //     const res = await axios.post(`${API}/api/interview/report`, { userId: userIdRef.current });
  //     setAnalysis(res.data);
  //   } catch (err) { alert("Analysis failed: " + (err.response?.data?.message || err.message)); }
  // };
  

  const analyzeResume = async () => {
    if (!hasResume()) return alert("Upload resume first");
    setIsAIThinking(true);
    try {
      const res = await axios.post(`${API}/api/interview/analyze-resume`, {
        userId: userIdRef.current,
      });
      setAnalysis(res.data);
    } catch (err) {
      alert("Analysis failed: " + (err.response?.data?.error || err.message));
    }
    setIsAIThinking(false);
  };
  // ── Job Match ──
  // const matchJob = async () => {
  //   if (!hasResume()) return alert("Upload resume first");
  //   if (!jobDesc.trim()) return alert("Paste job description first");
  //   try {
  //     const res = await axios.post(`${API}/api/interview/report`, { userId: userIdRef.current });
  //     const jdLower = jobDesc.toLowerCase();
  //     const skillKeys = Object.keys(res.data.skills || {});
  //     const matched = skillKeys.filter(s => jdLower.includes(s.toLowerCase()));
  //     const missingKeywords = ["leadership", "agile", "communication", "problem solving", "teamwork"]
  //       .filter(k => jdLower.includes(k) && !skillKeys.includes(k));
  //     const atsScore = Math.round((matched.length / Math.max(skillKeys.length, 1)) * 100);
  //     setMatchResult({
  //       matchedSkills: matched, missingSkills: missingKeywords,
  //       totalSkills: skillKeys.length, matchPercent: atsScore,
  //       level: res.data.level, avgScore: res.data.avgScore,
  //       recommendation: atsScore >= 70 ? "Strong match – apply now!" : atsScore >= 40 ? "Partial match – tailor your resume" : "Low match – skill gap identified",
  //       improvements: matched.length < 3 ? ["Add more relevant keywords", "Include project descriptions", "Quantify achievements"] : ["Highlight key achievements", "Add measurable impact numbers"],
  //     });
  //   } catch (err) { alert("Job match failed: " + (err.response?.data?.message || err.message)); }
  // };   
  

  const matchJob = async () => {
    if (!hasResume()) return alert("Upload resume first");
    if (!jobDesc.trim()) return alert("Paste job description first");
    setIsAIThinking(true);
    try {
      const res = await axios.post(`${API}/api/interview/match-jd`, {
        userId: userIdRef.current,
        jobDescription: jobDesc,
      });
      setMatchResult(res.data);
    } catch (err) {
      alert("Job match failed: " + (err.response?.data?.error || err.message));
    }
    setIsAIThinking(false);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const decision = getDecision(score);

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ── HEADER ── */}
        <h1 className="title">⚡ AI Interview System</h1>
        <p className="subtitle">Adaptive · Real-time · Resume-aware · Detailed Reports</p>

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {["interview", "report", "match", "resume"].map(t => (
            <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "interview" ? "🎤 Interview" : t === "report" ? "📊 Report" : t === "match" ? "💼 Job Match" : "📄 Resume"}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
            TAB: INTERVIEW
        ════════════════════════════════════════════ */}
        {activeTab === "interview" && (
          <>
            {/* Camera */}
            <div className="card">
              <div className="card-title"><span className="section-icon">📹</span> Camera</div>
              <video ref={videoRef} autoPlay muted />
              <div className="flex gap-2 mt-2">
                {!cameraOn
                  ? <button className="btn btn-ghost" onClick={startCamera}>▶ Start Camera</button>
                  : <button className="btn btn-danger" onClick={stopCamera}>⏹ Stop Camera</button>
                }
              </div>
            </div>

            {/* Upload */}
            <div className="card">
              <div className="card-title"><span className="section-icon">📄</span> Upload Resume</div>
              <label
                className={`file-area ${file ? "has-file" : ""}`}
                onClick={() => fileInputRef.current.click()}
              >
                {file ? `✅ ${file.name}` : "Click to upload — PDF, DOCX, TXT"}
              </label>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx"
                onChange={e => setFile(e.target.files[0])} />
              <button className="btn btn-primary mt-3 w-full" onClick={uploadResume}>
                ⬆ Upload Resume
              </button>
              {uploadedFile && (
                <p className="text-muted mt-2">✅ Resume loaded: <span className="text-green">{uploadedFile.name || "Resume"}</span></p>
              )}
            </div>

            {/* Settings */}
            <div className="card">
              <div className="card-title"><span className="section-icon">⚙️</span> Interview Settings</div>
              <div className="flex gap-3 flex-wrap">
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div className="text-muted mb-2">Persona</div>
                  <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full">
                    <option value="friendly">😊 Friendly</option>
                    <option value="strict">😤 Strict</option>
                    <option value="mentor">🎓 Mentor</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div className="text-muted mb-2">Role</div>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full">
                    {["Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","DevOps Engineer","Machine Learning Engineer","Cloud Engineer","Android Developer","iOS Developer","QA Engineer"].map(r =>
                      <option key={r}>{r}</option>
                    )}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div className="text-muted mb-2">Company</div>
                  <select value={company} onChange={e => setCompany(e.target.value)} className="w-full">
                    {["Google","Amazon","Microsoft","Meta","Apple","Netflix","Flipkart","Infosys","TCS","Wipro","Startup"].map(c =>
                      <option key={c}>{c}</option>
                    )}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div className="text-muted mb-2">Questions (#)</div>
                  <input type="number" min={3} max={30} value={questionLimit}
                    onChange={e => setQuestionLimit(Number(e.target.value))} className="w-full" />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div className="text-muted mb-2">Time Limit (min)</div>
                  <input type="number" min={5} max={120} value={timeLimitMin}
                    onChange={e => setTimeLimitMin(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <button
                className={`btn btn-primary w-full mt-3`}
                onClick={startInterview}
                disabled={!hasResume() || isAIThinking}
              >
                🚀 Start Interview
              </button>
            </div>

            {/* Live Score + Timer */}
            {interviewStarted && (
              <div className="card">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <ScoreRing score={score} size={100} />
                  <div className="flex gap-3 flex-wrap" style={{ flex: 1, justifyContent: "center" }}>
                    <div className="stat">
                      <div className="stat-val" style={{ color: "#a5b4fc" }}>{questionsAsked}/{questionLimit}</div>
                      <div className="stat-label">Questions</div>
                    </div>
                    <div className="stat">
                      <div className={`timer-badge ${timeLeft !== null && timeLeft < 60 ? "warn" : ""}`}>
                        {formatTime(timeLeft)}
                      </div>
                      <div className="stat-label" style={{ marginTop: 6 }}>Time Left</div>
                    </div>
                    <div className="stat">
                      <div className="stat-val"><span className={`badge ${decision.cls}`}>{decision.label}</span></div>
                      <div className="stat-label">Status</div>
                    </div>
                  </div>
                  <button className="btn btn-danger" onClick={endInterview}>⏹ End Interview</button>
                </div>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="card">
                <div className="card-title">📊 Skill Tracker</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {Object.entries(skills).map(([sk, val]) => (
                    <div key={sk}>
                      <div className="flex justify-between font-sm" style={{ marginBottom: 4 }}>
                        <span>{sk}</span>
                        <span className="text-cyan">{val}%</span>
                      </div>
                      <ProgressBar val={val} color={val >= 70 ? "#10b981" : val >= 40 ? "#f59e0b" : "#ef4444"} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="card">
              <div className="card-title">🤖 Interview Chat</div>
              <div style={{ minHeight: 200, maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
                {chat.length === 0 && (
                  <p className="text-muted text-center" style={{ marginTop: 40 }}>Upload resume & start interview to begin</p>
                )}
                {chat.map((m, i) => (
                  <div key={i} className={m.role === "assistant" ? "bubble-ai" : "bubble-user"}>
                    <div className="text-muted" style={{ fontSize: "0.7rem", marginBottom: 4 }}>
                      {m.role === "assistant" ? "🤖 Interviewer" : "👤 You"}
                    </div>
                    {m.content}
                  </div>
                ))}
                {isAIThinking && <ThinkingDots />}
                {isListening && <p style={{ color: "#f87171", fontSize: "0.82rem" }}>🎤 Listening…</p>}
                <div ref={chatEndRef} />
              </div>
              <div className="divider" />
              <textarea
                className="chat-input"
                rows={3}
                placeholder={interviewDone ? "Interview finished." : "Type your answer here…"}
                value={userMsg}
                onChange={e => setUserMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                disabled={interviewDone}
              />
              <div className="flex gap-2 mt-2">
                <button className="btn btn-danger" onClick={startListening} disabled={interviewDone}>🎤 Speak</button>
                <button className="btn btn-primary" onClick={sendMessage} disabled={interviewDone || !userMsg.trim()}>Send ↩</button>
              </div>
            </div>

            {/* Last Answer Feedback */}
            {feedback && (
              <div className="card">
                <div className="card-title">📋 Last Answer Feedback</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { label: "💬 Communication", val: feedback.communication, color: "#6366f1" },
                    { label: "⚙️ Technical", val: feedback.technical, color: "#06b6d4" },
                    { label: "💪 Confidence", val: feedback.confidence, color: "#10b981" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between font-sm" style={{ marginBottom: 4 }}>
                        <span>{label}</span><span style={{ color }}>{val}/100</span>
                      </div>
                      <ProgressBar val={val} color={color} />
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <div style={{ display: "grid", gap: 8, fontSize: "0.83rem" }}>
                  <div><span className="text-green bold">✅ Strengths: </span>{feedback.strengths}</div>
                  <div><span className="text-yellow bold">⚠️ Weaknesses: </span>{feedback.weaknesses}</div>
                  <div><span className="text-accent bold">📈 Improvement: </span>{feedback.improvement}</div>
                  <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <span className="text-green bold">💡 Ideal Answer: </span>{feedback.idealAnswer}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════
            TAB: REPORT  (shown after interview ends)
        ════════════════════════════════════════════ */}
        {activeTab === "report" && (
          <>
            {!finalReport && !interviewDone && (
              <div className="card text-center" style={{ padding: 40 }}>
                <p className="text-muted">Complete the interview first to see your full report.</p>
              </div>
            )}
            {finalReport && (
              <>
                {/* Hero score */}
                <div className="card text-center">
                  <div className="card-title" style={{ justifyContent: "center" }}>🏆 Final Interview Report</div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <ScoreRing score={finalReport.avgScore ?? score} size={140} />
                  </div>
                  <span className={`badge ${getDecision(finalReport.avgScore ?? score).cls}`} style={{ fontSize: "0.85rem", padding: "6px 18px" }}>
                    {getDecision(finalReport.avgScore ?? score).label}
                  </span>
                  <div className="flex gap-3 mt-3 flex-wrap" style={{ justifyContent: "center" }}>
                    <div className="stat text-center"><div className="stat-val text-accent">{finalReport.totalInterviews ?? questionsAsked}</div><div className="stat-label">Questions Answered</div></div>
                    <div className="stat text-center"><div className="stat-val text-green">{finalReport.bestScore ?? score}</div><div className="stat-label">Best Score</div></div>
                    <div className="stat text-center"><div className="stat-val" style={{ color: "#f59e0b" }}>{finalReport.level ?? "Intermediate"}</div><div className="stat-label">Level</div></div>
                  </div>
                </div>

                {/* Skills breakdown */}
                {finalReport.skills && (
                  <div className="card">
                    <div className="card-title">📊 Skill-wise Breakdown</div>
                    {Object.entries(finalReport.skills).map(([sk, val]) => (
                      <div key={sk} style={{ marginBottom: 12 }}>
                        <div className="flex justify-between font-sm" style={{ marginBottom: 4 }}>
                          <span>{sk}</span>
                          <span className={val >= 70 ? "text-green" : val >= 40 ? "text-yellow" : "text-red"}>{val}%</span>
                        </div>
                        <ProgressBar val={val} color={val >= 70 ? "#10b981" : val >= 40 ? "#f59e0b" : "#ef4444"} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Issues & Improvements */}
                <div className="card">
                  <div className="card-title">🔧 Issues & How to Fix</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {(finalReport.issues ?? ["Weak system design answers", "Missed edge cases in algorithms"]).map((issue, i) => (
                      <div key={i} style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, padding: "12px 14px" }}>
                        <div className="text-red bold font-sm">⚠ Issue {i + 1}: {issue}</div>
                        <div className="text-muted" style={{ marginTop: 6, fontSize: "0.8rem" }}>
                          Fix: {(finalReport.fixes ?? ["Practice LLD on Grokking the System Design Interview", "Solve 20 LeetCode problems on Trees & Graphs"])[i] ?? "Review fundamentals and practice regularly"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvement suggestions */}
                <div className="card">
                  <div className="card-title">📈 Improvement Plan</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(finalReport.improvements ?? [
                      "🔵 Take a DSA course on LeetCode / GFG",
                      "🟣 Build 2 end-to-end projects with the target tech stack",
                      "🟢 Practice mock interviews on Pramp or Interviewing.io",
                      "🟡 Write a tech blog to improve communication",
                    ]).map((tip, i) => (
                      <div key={i} style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: "0.84rem" }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS Score */}
                <div className="card">
                  <div className="card-title">📝 ATS Readiness Score</div>
                  <div className="flex items-center gap-4">
                    <ScoreRing score={finalReport.atsScore ?? 65} size={90} />
                    <div>
                      <div className="bold">Resume Keyword Density</div>
                      <p className="text-muted font-sm" style={{ marginTop: 4 }}>
                        {finalReport.atsScore >= 70
                          ? "Strong ATS match – your resume keywords align well."
                          : "Add role-specific keywords to improve recruiter visibility."}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary w-full" onClick={() => {
                  const blob = new Blob([JSON.stringify(finalReport, null, 2)], { type: "application/json" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                  a.download = "interview_report.json"; a.click();
                }}>⬇ Download Full Report (JSON)</button>
              </>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════
            TAB: JOB MATCH
        ════════════════════════════════════════════ */}
        {/* {activeTab === "match" && (
          <div className="card">
            <div className="card-title">💼 Job Description Match & ATS Analysis</div>
            {!hasResume() && <p className="text-muted font-sm">⚠ Upload resume first to use this feature.</p>}
            <textarea rows={5} placeholder="Paste the job description here…" value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            <button className="btn btn-green w-full mt-3" onClick={matchJob} disabled={!hasResume()}>🔍 Analyze Match</button>

            {matchResult && (
              <>
                <div className="divider" />
                <div className="flex items-center gap-4 mt-2">
                  <ScoreRing score={matchResult.matchPercent} size={100} />
                  <div>
                    <div className="bold" style={{ fontSize: "1rem" }}>ATS Match: {matchResult.matchPercent}%</div>
                    <p className="text-muted font-sm" style={{ marginTop: 4 }}>{matchResult.recommendation}</p>
                    <span className={`badge mt-2 ${matchResult.matchPercent >= 70 ? "badge-green" : matchResult.matchPercent >= 40 ? "badge-yellow" : "badge-red"}`}>
                      {matchResult.matchPercent >= 70 ? "Strong" : matchResult.matchPercent >= 40 ? "Moderate" : "Weak"} Match
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="card-title">✅ Matched Skills</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {matchResult.matchedSkills.length > 0
                      ? matchResult.matchedSkills.map(s => <span key={s} className="skill-tag">{s}</span>)
                      : <span className="text-muted font-sm">No exact matches found</span>}
                  </div>
                </div>

                {matchResult.missingSkills?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title" style={{ color: "#f87171" }}>❌ Missing / Gap Keywords</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchResult.missingSkills.map(s => (
                        <span key={s} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", color: "#f87171" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="card-title">💡 Improvements to Boost Match</div>
                  {matchResult.improvements.map((tip, i) => (
                    <div key={i} style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 8, padding: "9px 13px", marginBottom: 8, fontSize: "0.83rem" }}>
                      {i + 1}. {tip}
                    </div>
                  ))}
                </div>

                <div className="report-row mt-3">
                  <span className="text-muted">Candidate Level</span>
                  <span className="badge badge-blue">{matchResult.level}</span>
                </div>
                <div className="report-row">
                  <span className="text-muted">Avg Interview Score</span>
                  <span className="bold">{matchResult.avgScore}</span>
                </div>
              </>
            )}
          </div>
        )} */}      


        {activeTab === "match" && (
          <div className="card">
            <div className="card-title">💼 Job Description Match & ATS Analysis</div>
            {!hasResume() && <p className="text-muted font-sm">⚠ Upload resume first to use this feature.</p>}
            <textarea rows={5} placeholder="Paste the job description here…" value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            <button className="btn btn-green w-full mt-3" onClick={matchJob} disabled={!hasResume() || isAIThinking}>
              {isAIThinking ? <><span className="dot"/><span className="dot"/><span className="dot"/> &nbsp;AI Analyzing…</> : "🔍 Analyze Match"}
            </button>

            {matchResult && (
              <>
                <div className="divider" />
                <div className="flex items-center gap-4 mt-2">
                  <ScoreRing score={matchResult.atsScore} size={100} />
                  <div>
                    <div className="bold" style={{ fontSize: "1rem" }}>ATS Match: {matchResult.atsScore}%</div>
                    <p className="text-muted font-sm" style={{ marginTop: 4 }}>{matchResult.recommendation}</p>
                    <span className={`badge mt-2 ${matchResult.atsScore >= 70 ? "badge-green" : matchResult.atsScore >= 40 ? "badge-yellow" : "badge-red"}`}>
                      {matchResult.matchLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-3" style={{ display: "grid", gap: 10 }}>
                  {[
                    { label: "🎯 Role Alignment", val: matchResult.roleAlignment ?? 0, color: "#6366f1" },
                    { label: "📅 Experience Alignment", val: matchResult.experienceAlignment ?? 0, color: "#06b6d4" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between font-sm" style={{ marginBottom: 4 }}>
                        <span>{label}</span><span style={{ color }}>{val}%</span>
                      </div>
                      <ProgressBar val={val} color={color} />
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="card-title">✅ Matched Skills</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {matchResult.matchedSkills?.length > 0
                      ? matchResult.matchedSkills.map(s => <span key={s} className="skill-tag">{s}</span>)
                      : <span className="text-muted font-sm">No exact matches found</span>}
                  </div>
                </div>

                {matchResult.matchedKeywords?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title">🔑 Matched Keywords</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchResult.matchedKeywords.map(k => (
                        <span key={k} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", color: "#34d399" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {matchResult.missingSkills?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title" style={{ color: "#f87171" }}>❌ Missing Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchResult.missingSkills.map(s => (
                        <span key={s} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", color: "#f87171" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {matchResult.missingKeywords?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title" style={{ color: "#fbbf24" }}>⚠️ Missing Keywords</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchResult.missingKeywords.map(k => (
                        <span key={k} style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", color: "#fbbf24" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {matchResult.strengthsForRole?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title">💪 Your Strengths for This Role</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {matchResult.strengthsForRole.map((s, i) => (
                        <div key={i} style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 8, padding: "9px 13px", fontSize: "0.83rem" }}>✅ {s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {matchResult.tailoringTips?.length > 0 && (
                  <div className="mt-3">
                    <div className="card-title">✍️ Add These to Your Resume</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {matchResult.tailoringTips.map((tip, i) => (
                        <div key={i} style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "9px 13px", fontSize: "0.83rem" }}>🔵 {tip}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="card-title">💡 Improvements to Boost Match</div>
                  {matchResult.improvements?.map((tip, i) => (
                    <div key={i} style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 8, padding: "9px 13px", marginBottom: 8, fontSize: "0.83rem" }}>
                      {i + 1}. {tip}
                    </div>
                  ))}
                </div>

                <div className="report-row mt-3">
                  <span className="text-muted">Candidate Level</span>
                  <span className="badge badge-blue">{matchResult.candidateLevel || matchResult.level}</span>
                </div>
                <div className="report-row">
                  <span className="text-muted">Required Level</span>
                  <span className="badge badge-yellow">{matchResult.requiredLevel || "—"}</span>
                </div>
                <div className="report-row">
                  <span className="text-muted">Avg Interview Score</span>
                  <span className="bold">{matchResult.avgScore}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: RESUME ANALYSIS
        ════════════════════════════════════════════ */}
        {/* {activeTab === "resume" && (
          <>
            <div className="card">
              <div className="card-title">📄 Resume Analysis & Improvement</div>
              {!hasResume() && <p className="text-muted font-sm">⚠ Upload resume first.</p>}
              <button className="btn btn-cyan w-full" onClick={analyzeResume} disabled={!hasResume()}>
                🔬 Analyze My Resume
              </button>
            </div>

            {analysis && (
              <>
                <div className="card">
                  <div className="card-title">📊 Resume Report</div>
                  <div className="report-row"><span className="text-muted">Total Interviews Done</span><span className="bold">{analysis.totalInterviews}</span></div>
                  <div className="report-row"><span className="text-muted">Average Score</span><span className="bold text-accent">{analysis.avgScore}</span></div>
                  <div className="report-row"><span className="text-muted">Best Score</span><span className="bold text-green">{analysis.bestScore}</span></div>
                  <div className="report-row"><span className="text-muted">Experience Level</span><span className="badge badge-blue">{analysis.level}</span></div>
                </div>

                {analysis.skills && (
                  <div className="card">
                    <div className="card-title">⚡ Skills from Resume</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.skills).map(([sk, val]) => (
                        <div key={sk} className="skill-tag">
                          {sk} <span style={{ opacity: 0.7 }}>· {val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card-title">✏️ Resume Improvement Suggestions</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { tip: "Use action verbs (Built, Led, Optimized) to start bullet points", priority: "High" },
                      { tip: "Quantify achievements: '40% faster load time' instead of 'improved performance'", priority: "High" },
                      { tip: "Add a concise Summary/Objective section at the top", priority: "Medium" },
                      { tip: "List relevant certifications (AWS, GCP, Meta Blueprint)", priority: "Medium" },
                      { tip: "Include GitHub/portfolio link with active projects", priority: "High" },
                      { tip: "Tailor keywords to match the target job description", priority: "High" },
                      { tip: "Remove filler words and keep each bullet under 2 lines", priority: "Low" },
                    ].map(({ tip, priority }, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 13px", border: "1px solid var(--border)" }}>
                        <span className={`badge ${priority === "High" ? "badge-red" : priority === "Medium" ? "badge-yellow" : "badge-green"}`} style={{ whiteSpace: "nowrap", marginTop: 1 }}>{priority}</span>
                        <span style={{ fontSize: "0.83rem" }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">📝 ATS Optimization Tips</div>
                  <div style={{ fontSize: "0.83rem", lineHeight: 1.8, color: "#94a3b8" }}>
                    <p>• Use standard section headings: <span style={{ color: "#a5b4fc" }}>Experience, Education, Skills, Projects</span></p>
                    <p>• Avoid tables, graphics, headers/footers — ATS can't parse them</p>
                    <p>• Save as <span style={{ color: "#a5b4fc" }}>.docx or plain PDF</span> (not scanned image)</p>
                    <p>• Mirror exact keywords from job description (case-insensitive)</p>
                    <p>• Spell out acronyms at least once: <span style={{ color: "#a5b4fc" }}>React.js (React)</span></p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">🛠 Recommended Resources</div>
                  {[
                    { name: "LeetCode", desc: "DSA practice – 150 patterns", link: "https://leetcode.com", color: "#f59e0b" },
                    { name: "Grokking SD", desc: "System Design Interview prep", link: "https://www.designgurus.io", color: "#6366f1" },
                    { name: "Resume.io", desc: "ATS-friendly resume builder", link: "https://resume.io", color: "#10b981" },
                    { name: "Pramp", desc: "Mock peer interviews", link: "https://pramp.com", color: "#06b6d4" },
                  ].map(({ name, desc, link, color }) => (
                    <a key={name} href={link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "inherit" }}>
                      <div>
                        <div className="bold font-sm" style={{ color }}>{name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{desc}</div>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>→</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )} */}     
        {activeTab === "resume" && (
          <>
            <div className="card">
              <div className="card-title">📄 Resume Analysis & Improvement</div>
              {!hasResume() && <p className="text-muted font-sm">⚠ Upload resume first.</p>}
              <button className="btn btn-cyan w-full" onClick={analyzeResume} disabled={!hasResume() || isAIThinking}>
                {isAIThinking ? <><span className="dot"/><span className="dot"/><span className="dot"/> &nbsp;AI Analyzing…</> : "🔬 Analyze My Resume"}
              </button>
            </div>

            {analysis && (
              <>
                <div className="card">
                  <div className="card-title">📊 Resume Report</div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <ScoreRing score={analysis.overallScore ?? analysis.avgScore ?? 0} size={120} />
                  </div>
                  <p className="text-muted text-center font-sm" style={{ marginBottom: 16 }}>{analysis.summary}</p>
                  {analysis.formatScore !== undefined && (
                    <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: "📐 Format & Design", val: analysis.formatScore, color: "#6366f1" },
                        { label: "📝 Content Quality", val: analysis.contentScore, color: "#10b981" },
                        { label: "🔑 Keyword Density", val: analysis.keywordScore, color: "#f59e0b" },
                      ].map(({ label, val, color }) => (
                        <div key={label}>
                          <div className="flex justify-between font-sm" style={{ marginBottom: 4 }}>
                            <span>{label}</span><span style={{ color }}>{val}%</span>
                          </div>
                          <ProgressBar val={val} color={color} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="divider" />
                  <div className="report-row"><span className="text-muted">Total Interviews Done</span><span className="bold">{analysis.totalInterviews}</span></div>
                  <div className="report-row"><span className="text-muted">Average Interview Score</span><span className="bold text-accent">{analysis.avgScore}</span></div>
                  <div className="report-row"><span className="text-muted">Best Score</span><span className="bold text-green">{analysis.bestScore}</span></div>
                  <div className="report-row"><span className="text-muted">Experience Level</span><span className="badge badge-blue">{analysis.experienceLevel || analysis.level}</span></div>
                  <div className="report-row"><span className="text-muted">Primary Stack</span><span className="bold text-cyan">{analysis.primaryStack || "—"}</span></div>
                  <div className="report-row"><span className="text-muted">Years of Experience</span><span className="bold">{analysis.yearsOfExperience || "—"}</span></div>
                </div>

                {analysis.strengths?.length > 0 && (
                  <div className="card">
                    <div className="card-title">💪 Resume Strengths</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {analysis.strengths.map((s, i) => (
                        <div key={i} style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 8, padding: "10px 13px", fontSize: "0.83rem" }}>✅ {s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {(analysis.topSkillsFound?.length > 0 || analysis.skills) && (
                  <div className="card">
                    <div className="card-title">⚡ Skills from Resume</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topSkillsFound?.map(sk => (
                        <div key={sk} className="skill-tag">{sk}</div>
                      ))}
                      {!analysis.topSkillsFound && analysis.skills && Object.entries(analysis.skills).map(([sk, val]) => (
                        <div key={sk} className="skill-tag">{sk} <span style={{ opacity: 0.7 }}>· {val}%</span></div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missingSection?.length > 0 && (
                  <div className="card">
                    <div className="card-title" style={{ color: "#f87171" }}>🚫 Missing Sections in Resume</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.missingSection.map(s => (
                        <span key={s} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", color: "#f87171" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card-title">✏️ Resume Improvement Suggestions</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {analysis.improvements?.map(({ priority, issue, fix }, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 13px", border: "1px solid var(--border)" }}>
                        <span className={`badge ${priority === "High" ? "badge-red" : priority === "Medium" ? "badge-yellow" : "badge-green"}`} style={{ whiteSpace: "nowrap", marginTop: 1 }}>{priority}</span>
                        <div>
                          <div style={{ fontSize: "0.83rem", marginBottom: 4 }}>{issue}</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>💡 Fix: {fix}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.atsIssues?.length > 0 && (
                  <div className="card">
                    <div className="card-title">📝 ATS Issues Found in Your Resume</div>
                    <div style={{ display: "grid", gap: 8, fontSize: "0.83rem" }}>
                      {analysis.atsIssues.map((issue, i) => (
                        <div key={i} style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "9px 13px" }}>
                          ⚠️ {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card-title">📝 ATS Optimization Tips</div>
                  <div style={{ fontSize: "0.83rem", lineHeight: 1.8, color: "#94a3b8" }}>
                    <p>• Use standard section headings: <span style={{ color: "#a5b4fc" }}>Experience, Education, Skills, Projects</span></p>
                    <p>• Avoid tables, graphics, headers/footers — ATS can't parse them</p>
                    <p>• Save as <span style={{ color: "#a5b4fc" }}>.docx or plain PDF</span> (not scanned image)</p>
                    <p>• Mirror exact keywords from job description (case-insensitive)</p>
                    <p>• Spell out acronyms at least once: <span style={{ color: "#a5b4fc" }}>React.js (React)</span></p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">🛠 Recommended Resources</div>
                  {[
                    { name: "LeetCode", desc: "DSA practice – 150 patterns", link: "https://leetcode.com", color: "#f59e0b" },
                    { name: "Grokking SD", desc: "System Design Interview prep", link: "https://www.designgurus.io", color: "#6366f1" },
                    { name: "Resume.io", desc: "ATS-friendly resume builder", link: "https://resume.io", color: "#10b981" },
                    { name: "Pramp", desc: "Mock peer interviews", link: "https://pramp.com", color: "#06b6d4" },
                  ].map(({ name, desc, link, color }) => (
                    <a key={name} href={link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", textDecoration: "none", color: "inherit" }}>
                      <div>
                        <div className="bold font-sm" style={{ color }}>{name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{desc}</div>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>→</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ResumeUpload;