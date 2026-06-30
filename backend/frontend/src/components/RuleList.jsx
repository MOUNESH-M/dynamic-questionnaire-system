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

  // 1. Single declaration of rules
  const rules = question.rules || [];

  // 2. Identify special question types
  const isTextOrNumber = question.questionType === "TEXT" || question.questionType === "NUMBER";
  const isComplexity = question.questionType === "COMPLEXITY";

  // 3. Inject hardcoded options for complexity. Otherwise, use DB options.
  const rawOptions = isComplexity 
    ? [ { _id: "High", optionText: "High" }, { _id: "Medium", optionText: "Medium" }, { _id: "Low", optionText: "Low" } ]
    : (question.options || []);

  // --- SAFETY FILTER 1: Prevent Double-Mapping Options ---
  const usedOptionIds = rules.map(r => r.optionId);
  const availableOptions = rawOptions.filter(opt => !usedOptionIds.includes(opt._id || opt.id));

  // --- SAFETY FILTER 2: Prevent Deadlocks (Forward-Routing Only) ---
  const currentIndex = allQuestions.findIndex(q => (q._id || q.id) === (question._id || question.id));
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  
  // --- SAFETY FILTER 3: Prevent Double-Mapping Destinations ---
  const usedDestinationIds = rules.map(r => r.nextQuestionId);
  
  const availableTargetQuestions = allQuestions
    .slice(safeIndex + 1) // Deadlock Prevention: Only show questions AFTER this one
    .filter(q => !usedDestinationIds.includes(q._id || q.id)); // Remove already mapped destinations

  // Check if we have exhausted all possible rules
  const canAddMoreRules = isTextOrNumber ? rules.length === 0 : availableOptions.length > 0;

  // Label Fetchers
  const getQuestionLabel = (id) => {
    if (id === "SUBMIT") return "🛑 End Assessment & Submit";
    const q = allQuestions.find((question) => (question._id || question.id) === id);
    return q ? q.questionText : "Unknown Question";
  };

  const getOptionLabel = (id) => {
    if (id === "ANY") return "Any Answer";
    // NOTE: Using rawOptions here so it can read "High", "Medium", "Low"
    const option = rawOptions.find((opt) => (opt._id || opt.id) === id);
    return option ? option.optionText : "Unknown Option";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  if (!isTextOrNumber && !isComplexity && rawOptions.length === 0) {
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
                {availableOptions.map((option) => (
                  <option key={option._id || option.id} value={option._id || option.id}>
                    {option.optionText}
                  </option>
                ))}
              </select>
            )}

            <select
              className="select"
              value={nextQuestionId}
              onChange={(e) => setNextQuestionId(e.target.value)}
            >
              <option value="">Select Destination</option>
              
              {!usedDestinationIds.includes("SUBMIT") && (
                <option value="SUBMIT" style={{ fontWeight: "bold", color: "red" }}>
                  🛑 End Assessment & Submit
                </option>
              )}
              
              {availableTargetQuestions.map((q) => (
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
        canAddMoreRules ? (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
            + Add Rule
          </button>
        ) : (
          <p className="text-muted" style={{ fontSize: "12px", fontStyle: "italic", marginTop: "8px" }}>
            All conditions have been mapped.
          </p>
        )
      )}
    </div>
  );
}