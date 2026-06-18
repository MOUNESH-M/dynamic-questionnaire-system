import { useState } from "react";

export default function RuleList({
  question,
  allQuestions,
  onAddRule,
  onDeleteRule
}) {
  const [showForm, setShowForm] = useState(false);
  const [optionId, setOptionId] = useState("");
  const [nextQuestionId, setNextQuestionId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = question.options || [];
  const rules = question.rules || [];

  // 1. Identify if this question takes an "ANY" rule
  const isTextOrNumber = question.questionType === "TEXT" || question.questionType === "NUMBER";

  const otherQuestions = allQuestions.filter(
    (q) => (q._id || q.id) !== (question._id || question.id)
  );

  // 2. Teach the label fetcher to read the "SUBMIT" token
  const getQuestionLabel = (id) => {
    if (id === "SUBMIT") return "🛑 End Assessment & Submit";
    const q = allQuestions.find((question) => (question._id || question.id) === id);
    return q ? q.questionText : "Unknown Question";
  };

  // 3. Teach the label fetcher to read the "ANY" token
  const getOptionLabel = (id) => {
    if (id === "ANY") return "Any Answer";
    const option = options.find((opt) => (opt._id || opt.id) === id);
    return option ? option.optionText : "Unknown Option";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 4. Force TEXT and NUMBER questions to use the "ANY" token automatically
    const finalOptionId = isTextOrNumber ? "ANY" : optionId;

    if (!finalOptionId || !nextQuestionId) {
      setError("Select option and next question/action");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onAddRule({
        questionId: question._id || question.id,
        optionId: finalOptionId,
        nextQuestionId
      });

      setOptionId("");
      setNextQuestionId("");
      setShowForm(false);
    } catch (error) {
      setError(
        error.response?.data?.detail || "Failed to create rule"
      );
    } finally {
      setSaving(false);
    }
  };

  // 5. Only block rule creation if it's a multiple choice question with NO options yet
  if (!isTextOrNumber && options.length === 0) {
    return <p className="text-muted text-sm mt-2">Create options before adding rules.</p>;
  }

  return (
    <div>
      {rules.length > 0 ? (
        <ul style={{ marginBottom: "12px", paddingLeft: "0", listStyle: "none" }}>
          {rules.map((rule) => (
            <li
              key={rule._id || rule.id}
              style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", fontSize: "14px" }}
            >
              <span style={{ fontWeight: "600" }}>
                {getOptionLabel(rule.optionId)}
              </span>
              <span>{" → "}</span>
              <span style={{ flex: 1, color: rule.nextQuestionId === "SUBMIT" ? "#e11d48" : "#2563eb" }}>
                {getQuestionLabel(rule.nextQuestionId)}
              </span>

              <button
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => onDeleteRule(rule._id || rule.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm mb-2">No rules created</p>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", marginTop: "10px" }}>
          {error && <p style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>{error}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* If it's a Text/Number question, just tell the user "Any Answer" instead of showing an empty dropdown */}
            {isTextOrNumber ? (
              <div style={{ padding: "8px", background: "#e2e8f0", borderRadius: "4px", fontSize: "14px" }}>
                <strong>Condition:</strong> Any Answer
              </div>
            ) : (
              <select
                className="select"
                value={optionId}
                onChange={(e) => setOptionId(e.target.value)}
              >
                <option value="">Select Condition Option</option>
                {options.map((option) => (
                  <option key={option._id || option.id} value={option._id || option.id}>
                    {option.optionText}
                  </option>
                ))}
              </select>
            )}

            {/* The Destination Dropdown */}
            <select
              className="select"
              value={nextQuestionId}
              onChange={(e) => setNextQuestionId(e.target.value)}
            >
              <option value="">Select Destination</option>
              
              {/* THE MAGIC SUBMIT TOKEN */}
              <option value="SUBMIT" style={{ fontWeight: "bold", color: "red" }}>
                🛑 End Assessment & Submit
              </option>
              
              {otherQuestions.map((q) => (
                <option key={q._id || q.id} value={q._id || q.id}>
                  Question: {q.questionText}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? "Saving..." : "Create Rule"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
          + Add Rule
        </button>
      )}
    </div>
  );
}