import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import QuestionCard from "../components/QuestionCard";
import ConfirmDialog from "../components/ConfirmDialog";
import api, {
  questionnaireApi,
  questionApi,
  optionApi,
  ruleApi,
} from "../services/api";

const QUESTION_TYPES = ["SINGLE_CHOISE", "MULTIPLE_CHOISE", "TEXT", "NUMBER"];

export default function QuestionnaireBuilder() {
  const { questionnaireId } = useParams();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("SINGLE_CHOISE");
  const [qIsStart, setQIsStart] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [createQError, setCreateQError] = useState("");

  const [pendingDeleteQuestion, setPendingDeleteQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // --- 1. DATA FETCHING ENGINE ---
  const refresh = useCallback(async () => {
    try {
      console.log("1. Starting Admin Data Fetch...");
      
      const questionnaireResponse = await questionnaireApi.get(questionnaireId);
      setQuestionnaire(questionnaireResponse.data);

      const timestamp = new Date().getTime();
      const questionsResponse = await api.get(`/questions/questionnaire/${questionnaireId}?t=${timestamp}`);

      const questionsArray = Array.isArray(questionsResponse.data) 
        ? questionsResponse.data 
        : (questionsResponse.data?.data || questionsResponse.data?.questions || []);

      console.log(`2. Found ${questionsArray.length} questions. Fetching rules and options...`);

      const questionsWithData = await Promise.all(
        questionsArray.map(async (question) => {
          const qId = question._id || question.id;
          let options = [];
          let rules = [];

          try {
            const optionsResponse = await api.get(`/options/question/${qId}`);
            options = Array.isArray(optionsResponse.data) ? optionsResponse.data : [];
          } catch (e) {}

          try {
            const rulesResponse = await ruleApi.getAll();
            rules = rulesResponse.data.filter((rule) => String(rule.questionId) === String(qId));
          } catch (e) {
            console.warn(`Rules fetch failed for question ${qId}`);
          }

          return { ...question, options, rules };
        })
      );

      console.log("3. Data fetch complete! Updating UI.");
      setQuestions(questionsWithData);
    } catch (err) {
      console.error("ADMIN REFRESH CRASH:", err);
      setError(err.response?.data?.detail || "Couldn't load questionnaire.");
    }
  }, [questionnaireId]);

  // --- 2. TRIGGER THE FETCH ON PAGE LOAD ---
  // If this block was missing before, that is why it was stuck loading!
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    refresh().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [refresh]);


  // --- 3. CREATE QUESTION ---
  async function handleCreateQuestion(e) {
    e.preventDefault();
    if (!qText.trim()) {
      setCreateQError("Question text is required.");
      return;
    }
    setCreatingQuestion(true);
    setCreateQError("");
    
    try {
      // NOTE: Ensure your FastAPI backend is expecting exactly these variable names
      const payload = {
        questionnaireId,
        questionText: qText.trim(),
        questionType: qType,
        isStartQuestion: qIsStart, // Corrected spelling to match standard backend schemas
      };

      await questionApi.create(payload);
      
      alert("Question created Successfully");
      await refresh();
      setQText("");
      setQType("SINGLE_CHOISE");
      setQIsStart(false);
    } catch (err) {
      console.error("FAILED TO CREATE QUESTION:", err.response?.data || err.message);
      setCreateQError(err.response?.data?.detail || "Couldn't create that question.");
    } finally {
      setCreatingQuestion(false);
    }
  }

  // --- 4. OTHER HANDLERS ---
  async function handleEditQuestion(questionId, payload) {
    await questionApi.update(questionId, payload);
    await refresh();
  }

  async function handleConfirmDeleteQuestion() {
    if (!pendingDeleteQuestion) return;
    const targetId = pendingDeleteQuestion._id || pendingDeleteQuestion.id;
    if (!targetId) return;

    setDeletingQuestion(true);
    try {
      await questionApi.remove(targetId);
      await refresh();
      setPendingDeleteQuestion(null);
    } catch (err) {
      console.error("FAILED TO DELETE:", err);
    } finally {
      setDeletingQuestion(false);
    }
  }

  async function handleAddOption(questionId, payload) {
    await optionApi.create({
      questionId,
      optionText: payload.optionText,
      displayOrder: payload.displayOrder
    });
    await refresh();
  }

  async function handleAddRule(payload) {
    await ruleApi.create(payload);
    await refresh();
  }

  async function handleDeleteOption(optionId) {
    try {
      await optionApi.remove(optionId);
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.detail || "Couldn't remove that option.");
    }
  }

  async function handleDeleteRule(ruleId) {
    try {
      await ruleApi.remove(ruleId);
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.detail || "Couldn't remove that rule.");
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await questionnaireApi.publish(questionnaireId);
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.detail || "Couldn't publish this questionnaire.");
    } finally {
      setPublishing(false);
    }
  }

  // --- 5. RENDER UI ---
  if (loading) {
    return (
      <AppLayout title="Loading…">
        <div className="loading-page">
          <span className="spinner spinner-lg" /> Loading questionnaire…
        </div>
      </AppLayout>
    );
  }

  if (error || !questionnaire) {
    return (
      <AppLayout title="Questionnaire">
        <div className="alert alert-error">{error || "Questionnaire not found."}</div>
        <Link to="/admin" className="btn btn-secondary">Back to questionnaires</Link>
      </AppLayout>
    );
  }

  const isPublished = questionnaire.status === "PUBLISHED";

  return (
    <AppLayout title="Questionnaire Builder">
      <Link to="/admin" className="builder-back">← Back to questionnaires</Link>

      <div className="builder-header">
        <div className="builder-header-title">
          <h1>{questionnaire.title}</h1>
          <span className={`badge ${isPublished ? "badge-published" : "badge-draft"}`}>
            {questionnaire.status}
          </span>
        </div>
        {!isPublished && (
          <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
            {publishing ? <span className="spinner" /> : "Publish Questionnaire"}
          </button>
        )}
      </div>

      {questionnaire.description && (
        <p className="text-muted" style={{ marginBottom: 20, fontSize: 14 }}>
          {questionnaire.description}
        </p>
      )}

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="builder-grid">
        <section>
          <div className="section-title">Questions ({questions.length})</div>
          {questions.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">？</div>
              <h3>No questions yet</h3>
              <p>Use the form to add the first question — mark it as the start question.</p>
            </div>
          ) : (
            questions.map((q) => (
              <QuestionCard
                key={q._id || q.id}
                question={q}
                allQuestions={questions}
                onEdit={handleEditQuestion}
                onDelete={(question) => setPendingDeleteQuestion(question)}
                onAddOption={handleAddOption}
                onDeleteOption={handleDeleteOption}
                onAddRule={handleAddRule}
                onDeleteRule={handleDeleteRule}
              />
            ))
          )}
        </section>

        <section>
          <div className="section-title">Create Question</div>
          <div className="card card-pad">
            <form onSubmit={handleCreateQuestion}>
              {createQError && <div className="alert alert-error">{createQError}</div>}
              <div className="field">
                <label htmlFor="q-text">Question text</label>
                <textarea
                  id="q-text"
                  className="textarea"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. Are you a student?"
                />
              </div>
              <div className="field">
                <label htmlFor="q-type">Question type</label>
                <select
                  id="q-type"
                  className="select"
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="checkbox-row" style={{ marginBottom: 18 }}>
                <input
                  id="q-start"
                  type="checkbox"
                  checked={qIsStart}
                  onChange={(e) => setQIsStart(e.target.checked)}
                />
                <label htmlFor="q-start">Start question</label>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={creatingQuestion}>
                {creatingQuestion ? <span className="spinner" /> : "Create Question"}
              </button>
            </form>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteQuestion)}
        title="Delete question?"
        message={`"${pendingDeleteQuestion?.questionText}" ...`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteQuestion}
        onCancel={() => setPendingDeleteQuestion(null)}
        loading={deletingQuestion}
      />
    </AppLayout>
  );
}