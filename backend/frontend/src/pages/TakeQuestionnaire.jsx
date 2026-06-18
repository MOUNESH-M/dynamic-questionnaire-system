import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api, { 
  questionnaireApi, 
  responseApi, 
  questionApi, 
  optionApi, 
  ruleApi 
} from "../services/api";

/**
 * Routing Engine: Evaluates rules to determine the next question.
 */
/**
 * Upgraded Routing Engine: Supports TEXT/NUMBER rules and explicit "SUBMIT" endpoints.
 */
/**
 * X-RAY ROUTING ENGINE
 */
function resolveNextQuestionId(question, allQuestions, answerValue) {
  console.log("================ ROUTING X-RAY ================");
  console.log(`1. Current Question: "${question.questionText}"`);
  console.log(`2. Answer Value Selected:`, answerValue);
  
  const rules = question.rules || [];
  console.log(`3. Rules attached to this question:`, rules);

  if (rules.length === 0) {
    console.warn("⚠️ NO RULES FOUND! The app will fall back to sequential order.");
  }

  let nextId = null;

  if (question.questionType === "SINGLE_CHOISE") {
    const rule = rules.find((r) => {
      const match = String(r.optionId) === String(answerValue);
      console.log(`   -> Checking Rule: Does [${r.optionId}] match [${answerValue}]? ${match ? "✅ YES!" : "❌ NO"}`);
      return match;
    });
    if (rule) nextId = rule.nextQuestionId || rule.next_question_id;
  } 
  else if (question.questionType === "MULTIPLE_CHOISE") {
    const selected = answerValue || [];
    for (const optId of selected) {
      const rule = rules.find((r) => String(r.optionId) === String(optId));
      if (rule) {
        nextId = rule.nextQuestionId || rule.next_question_id;
        break; 
      }
    }
  }
  else if (question.questionType === "TEXT" || question.questionType === "NUMBER") {
    const rule = rules.find((r) => r.optionId === "ANY");
    console.log(`   -> Checking for 'ANY' rule for Text/Number... Found? ${rule ? "✅ YES!" : "❌ NO"}`);
    if (rule) nextId = rule.nextQuestionId || rule.next_question_id;
  }

  console.log("4. Decision: Target Next ID is:", nextId || "NULL (Falling back to next in list)");
  console.log("===============================================");

  if (nextId) {
    if (nextId === "SUBMIT") return "SUBMIT"; 
    return nextId; 
  }

  // FALLBACK: Sequential order
  const currentId = question._id || question.id;
  const currentIndex = allQuestions.findIndex((q) => String(q._id || q.id) === String(currentId));

  if (currentIndex !== -1 && currentIndex + 1 < allQuestions.length) {
    const nextQuestion = allQuestions[currentIndex + 1];
    return nextQuestion._id || nextQuestion.id;
  }

  return "SUBMIT"; 
}

export default function TakeQuestionnaire() {
  const { questionnaireId } = useParams();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [answers, setAnswers] = useState({}); 
  const [responses, setResponses] = useState([]); 

  const [singleSelected, setSingleSelected] = useState("");
  const [multiSelected, setMultiSelected] = useState([]);
  const [textValue, setTextValue] = useState("");

  const [validationError, setValidationError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 1. FETCH FULL DATA ON MOUNT
  useEffect(() => {
    async function fetchFullQuestionnaire() {
      try {
        const qnRes = await questionnaireApi.get(questionnaireId);
        const questionnaireData = qnRes.data;

        const questionsRes = await questionApi.getByQuestionnaire(questionnaireId);
        
        const questionsWithData = await Promise.all(
          questionsRes.data.map(async (question) => {
            const qId = question._id || question.id;
            let options = [];
            let rules = [];

            try {
              const optionsRes = await optionApi.getByQuestion(qId);
              options = Array.isArray(optionsRes.data) ? optionsRes.data : [];
            } catch (e) { }

            try {
              const rulesRes = await ruleApi.getAll(); 
              rules = rulesRes.data.filter((r) => String(r.questionId) === String(qId));
            } catch (e) { 
              console.error("Rules fetch failed:", e.message);
            }

            return { ...question, options, rules };
          })
        );

        const fullData = { ...questionnaireData, questions: questionsWithData };
        setQuestionnaire(fullData);

        const start = questionsWithData.find((q) => q.isStarQuestion) ?? questionsWithData[0];
        if (start) {
          setCurrentQuestionId(start._id || start.id);
          setHistory([start._id || start.id]);
        }

      } catch (err) {
        setLoadError(err.response?.data?.detail || "Couldn't load this assessment.");
      } finally {
        setLoading(false);
      }
    }

    fetchFullQuestionnaire();
  }, [questionnaireId]);

  const questions = questionnaire?.questions ?? [];
  const currentQuestion = useMemo(
    () => questions.find((q) => String(q._id || q.id) === String(currentQuestionId)) || null,
    [questions, currentQuestionId]
  );

  // 2. HYDRATE STATE (Fixes text carry-over and restores answers when going back)
  useEffect(() => {
    if (!currentQuestionId || !currentQuestion) return;

    const existingAnswer = answers[currentQuestionId];

    if (currentQuestion.questionType === "SINGLE_CHOISE") {
      setSingleSelected(existingAnswer || "");
      setMultiSelected([]);
      setTextValue("");
    } else if (currentQuestion.questionType === "MULTIPLE_CHOISE") {
      setSingleSelected("");
      setMultiSelected(existingAnswer || []);
      setTextValue("");
    } else {
      setSingleSelected("");
      setMultiSelected([]);
      setTextValue(existingAnswer !== undefined ? String(existingAnswer) : "");
    }

    setValidationError("");
  }, [currentQuestionId, currentQuestion, answers]);

  function toggleMulti(optionId) {
    setMultiSelected((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  }

  // 3. HANDLE BACK BUTTON
  function handleBack() {
    if (history.length <= 1) return; 

    const newHistory = [...history];
    newHistory.pop(); // Remove current question
    const previousQuestionId = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    setCurrentQuestionId(previousQuestionId);
  }

  // 4. HANDLE NEXT BUTTON (Prevents duplicates)
  async function handleNext() {
    if (!currentQuestion) return;

    let answerValue;
    let responseEntry;
    const safeCurrentId = currentQuestion._id || currentQuestion.id;

   // --- INSIDE handleNext() ---
    
    // 1. Gather the answer
    if (currentQuestion.questionType === "SINGLE_CHOISE") {
      if (!singleSelected) { setValidationError("Choose an option."); return; }
      answerValue = singleSelected;
    } else if (currentQuestion.questionType === "MULTIPLE_CHOISE") {
      if (multiSelected.length === 0) { setValidationError("Choose at least one option."); return; }
      answerValue = multiSelected;
    } else if (currentQuestion.questionType === "NUMBER") {
      if (textValue.trim() === "" || Number.isNaN(Number(textValue))) {
        setValidationError("Enter a valid number."); return;
      }
      answerValue = Number(textValue);
    } else {
      if (!textValue.trim()) { setValidationError("Enter an answer."); return; }
      answerValue = textValue.trim();
    }

    // 2. Format exactly as FastAPI AnswerRequest expects: { questionId, answer }
    responseEntry = { 
      questionId: safeCurrentId, 
      answer: answerValue 
    };

    // 3. Update arrays (Prevent duplicates if they went Back)
    const updatedAnswers = { ...answers, [safeCurrentId]: answerValue };
    const filteredResponses = responses.filter((r) => String(r.questionId) !== String(safeCurrentId));
    const updatedResponses = [...filteredResponses, responseEntry];
    
    setAnswers(updatedAnswers);
    setResponses(updatedResponses);

    const nextId = resolveNextQuestionId(currentQuestion, questions, answerValue);

    if (nextId === "SUBMIT") {
      await finish(updatedResponses);
      return;
    }

    setHistory((prev) => [...prev, nextId]);
    setCurrentQuestionId(nextId);
  }

 async function finish(finalResponses) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        questionnaireId: questionnaireId,
        // Use a valid 24-character hex string so MongoDB doesn't reject it!
        userId: "507f1f77bcf86cd799439011", 
        answers: finalResponses
      };

      await api.post("/submissions", payload); 
      setCompleted(true);
      
    } catch (err) {
      // THIS WILL PRINT THE EXACT REASON FASTAPI REJECTED IT
      console.error("❌ SUBMISSION API CRASH:", err.response?.data || err.message);
      setSubmitError(
        err.response?.data?.detail || "Your answers couldn't be saved."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Loading…">
        <div className="loading-page">
          <span className="spinner spinner-lg" /> Loading questionnaire…
        </div>
      </AppLayout>
    );
  }

  if (loadError || !questionnaire) {
    return (
      <AppLayout title="Questionnaire">
        <div className="alert alert-error">{loadError || "Questionnaire not found."}</div>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to questionnaires
        </Link>
      </AppLayout>
    );
  }

  const progressPct = Math.min(100, Math.round((history.length / Math.max(questions.length, 1)) * 100));

  return (
    <AppLayout title={questionnaire.title}>
      <div className="take-shell" style={{ minHeight: "auto", padding: "8px 0 32px" }}>
        {!completed && (
          <div className="take-progress">
            <div className="take-progress-track">
              <div className="take-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="take-progress-label">
              Question {history.length} of ~{questions.length}
            </span>
          </div>
        )}

        {completed ? (
          <div className="card take-complete" style={{ maxWidth: 560, width: "100%" }}>
            <div className="take-complete-mark">✓</div>
            <h2>Questionnaire Completed</h2>
            <p className="text-muted" style={{ marginTop: 10 }}>
              Thanks for your responses — they've been saved.
            </p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 22 }}>
              Back to dashboard
            </Link>
          </div>
        ) : currentQuestion ? (
          <div className="card take-card">
            <div className="take-question-text">{currentQuestion.questionText}</div>

            {validationError && <div className="alert alert-error">{validationError}</div>}
            {submitError && <div className="alert alert-error">{submitError}</div>}

            {/* OPTIONS RENDERING */}
            {currentQuestion.questionType === "SINGLE_CHOISE" &&
              [...(currentQuestion.options ?? [])]
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                .map((opt, index) => {
                  const optId = opt._id || opt.id || `fallback-${index}`;
                  const displayText = typeof opt === 'string' ? opt : (opt.optionText || opt.text || `[MISSING TEXT]`);

                  return (
                    <label key={optId} className={`take-option ${String(singleSelected) === String(optId) ? "selected" : ""}`} style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name={`q-${currentQuestion._id || currentQuestion.id}`}
                        checked={String(singleSelected) === String(optId)}
                        onChange={() => setSingleSelected(optId)}
                        className="form-radio"
                      />
                      <span style={{ fontWeight: "500", color: "#333" }}>{displayText}</span>
                    </label>
                  );
                })}

            {currentQuestion.questionType === "MULTIPLE_CHOISE" &&
              [...(currentQuestion.options ?? [])]
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                .map((opt, index) => {
                  const optId = opt._id || opt.id || `fallback-${index}`;
                  const displayText = typeof opt === 'string' ? opt : (opt.optionText || opt.text || `[MISSING TEXT]`);

                  return (
                    <label key={optId} className={`take-option ${multiSelected.includes(optId) ? "selected" : ""}`} style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={multiSelected.includes(optId)}
                        onChange={() => toggleMulti(optId)}
                        className="form-checkbox"
                      />
                      <span style={{ fontWeight: "500", color: "#333" }}>{displayText}</span>
                    </label>
                  );
                })}

            {currentQuestion.questionType === "TEXT" && (
              <input
                className="input"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Type your answer…"
                autoFocus
              />
            )}

            {currentQuestion.questionType === "NUMBER" && (
              <input
                className="input"
                type="number"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter a number…"
                autoFocus
              />
            )}

            {/* DYNAMIC NAVIGATION BUTTONS */}
            <div className="take-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleBack} 
                disabled={submitting || history.length <= 1}
                style={{ visibility: history.length <= 1 ? "hidden" : "visible" }}
              >
                ← Back
              </button>

              {(() => {
                let peekAnswer;
                if (currentQuestion.questionType === "SINGLE_CHOISE") peekAnswer = singleSelected;
                else if (currentQuestion.questionType === "MULTIPLE_CHOISE") peekAnswer = multiSelected;
                else peekAnswer = textValue;

                const isLastQuestion = resolveNextQuestionId(currentQuestion, questions, peekAnswer) === "SUBMIT";

               return (
                  <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                    {submitting ? <span className="spinner" /> : (isLastQuestion ? "Submit Assessment" : "Next →")}
                  </button>
                );
              })()}
            </div>
            
          </div>
        ) : (
          <div className="card empty-state" style={{ maxWidth: 560, width: "100%" }}>
            <h3>No start question configured</h3>
            <p>This questionnaire doesn't have a start question set yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}