/**
 * Resume ATS Checker — Core Logic
 */
const COMMON_SECTIONS = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications', 'achievements'];
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','of','in','for','on','with','at','by','to','from','and','but','or','not','no','so','if','as','it','its','this','that','these','those','i','me','my','we','our','you','your','he','she','they','their','them','who','what','which','when','where','how','all','each','every','any','few','more','most','some','such','than','too','very']);

function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s\-\+\#\.]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a,b) => b[1] - a[1]).map(([word]) => word);
}

function findMatches(resumeKeywords, jobKeywords) {
  const resumeSet = new Set(resumeKeywords);
  const matched = jobKeywords.filter(k => resumeSet.has(k));
  const missing = jobKeywords.filter(k => !resumeSet.has(k));
  return { matched, missing };
}

function checkSections(resumeText) {
  const lower = resumeText.toLowerCase();
  return COMMON_SECTIONS.map(s => ({ section: s, found: lower.includes(s) }));
}

function countWords(text) { if (!text) return 0; return text.trim().split(/\s+/).filter(w => w.length > 0).length; }

function calculateScore(matched, missing, sections, wordCount) {
  const keywordScore = missing.length + matched.length > 0 ? (matched.length / (matched.length + missing.length)) * 50 : 0;
  const sectionScore = (sections && sections.length > 0) ? (sections.filter(s => s.found).length / sections.length) * 30 : 0;
  const lengthScore = wordCount >= 300 && wordCount <= 800 ? 20 : wordCount >= 200 ? 15 : wordCount >= 100 ? 10 : 5;
  return Math.min(100, Math.round(keywordScore + sectionScore + lengthScore));
}

function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function generateTips(matched, missing, sections, wordCount) {
  const tips = [];
  const missingSections = sections.filter(s => !s.found);
  if (missingSections.length > 0) tips.push(`Add these missing sections: ${missingSections.map(s => s.section).join(', ')}`);
  if (missing.length > 5) tips.push(`Your resume is missing ${missing.length} important keywords from the job description. Try incorporating them naturally.`);
  if (missing.length > 0 && missing.length <= 5) tips.push(`Add these keywords: ${missing.slice(0, 5).join(', ')}`);
  if (wordCount < 200) tips.push('Your resume seems too short. Aim for 300-800 words.');
  if (wordCount > 1000) tips.push('Your resume may be too long. Try to keep it concise (300-800 words).');
  if (matched.length > 0) tips.push(`Great job! You matched ${matched.length} keywords from the job description.`);
  tips.push('Use standard section headings like "Experience", "Education", "Skills".');
  tips.push('Avoid images, tables, and special characters — ATS systems often can\'t parse them.');
  tips.push('Use standard fonts and simple formatting for best ATS compatibility.');
  return tips;
}

function analyzeResume() {
  if (typeof document === 'undefined') return;
  const resumeEl = document.getElementById('resume-text');
  const jobEl = document.getElementById('job-desc');
  if (!resumeEl || !jobEl) return;
  
  const resumeText = resumeEl.value || '';
  const jobDesc = jobEl.value || '';
  if (!resumeText.trim() || !jobDesc.trim()) return;

  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDesc).slice(0, 30);
  const { matched, missing } = findMatches(resumeKeywords, jobKeywords);
  const sections = checkSections(resumeText);
  const wordCount = countWords(resumeText);
  const score = calculateScore(matched, missing, sections, wordCount);

  renderResults(score, matched, missing, sections, wordCount);
}

function renderResults(score, matched, missing, sections, wordCount) {
  if (typeof document === 'undefined') return;
  const results = document.getElementById('results');
  if (results) results.classList.remove('hidden');
  const circle = document.getElementById('score-circle');
  const value = document.getElementById('score-value');
  if (circle) circle.className = 'score-circle ' + getScoreClass(score);
  if (value) value.textContent = score;

  const statsRow = document.getElementById('stats-row');
  if (statsRow) {
    const sectionsFound = sections.filter(s => s.found).length;
    statsRow.innerHTML = `
      <div class="card mini-stat"><div class="val">${matched.length}</div><div class="lab">Keywords Matched</div></div>
      <div class="card mini-stat"><div class="val" style="color:var(--color-error)">${missing.length}</div><div class="lab">Keywords Missing</div></div>
      <div class="card mini-stat"><div class="val">${sectionsFound}/${sections.length}</div><div class="lab">Sections Found</div></div>
      <div class="card mini-stat"><div class="val">${wordCount}</div><div class="lab">Word Count</div></div>`;
  }

  const matchGrid = document.getElementById('keyword-matches');
  if (matchGrid) matchGrid.innerHTML = matched.map(k => `<span class="keyword-chip found">✓ ${k}</span>`).join('');
  const missGrid = document.getElementById('keyword-missing');
  if (missGrid) missGrid.innerHTML = missing.map(k => `<span class="keyword-chip missing">✗ ${k}</span>`).join('');

  const tips = generateTips(matched, missing, sections, wordCount);
  const tipsList = document.getElementById('tips-list');
  if (tipsList) tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMMON_SECTIONS, STOP_WORDS, extractKeywords, findMatches, checkSections, countWords, calculateScore, getScoreClass, generateTips, analyzeResume, renderResults };
}
