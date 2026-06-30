import { useState } from "react";
import OptionList from "./OptionList";
import RuleList from "./RuleList";

const TYPE_LABELS = {
  SINGLE_CHOISE: "Single choice",
  TEXT: "Text",
  NUMBER: "Number",
  COMPLEXITY: "Complexity (Auto-Hours)",
};

export default function QuestionCard({
  question,
  allQuestions,
  onEdit,
  onDelete,
  onAddOption,
  onDeleteOption,
  onAddRule,
  onDeleteRule,
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(question.questionText);
  const [type, setType] = useState(question.questionType);
  const [isStart, setIsStart] = useState(question.isStartQuestion || question.isStarQuestion);
  
  // NEW: State for the contextual fields
  const [platform, setPlatform] = useState(question.platform || "");
  const [moduleVal, setModuleVal] = useState(question.module || "");
  const [subModule, setSubModule] = useState(question.subModule || "");
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isChoiceType = question.questionType === "SINGLE_CHOISE";

  async function handleSave(e) {
    e.preventDefault();
    if (!text.trim() || !platform.trim() || !moduleVal.trim() || !subModule.trim()) {
      setError("Question text, Platform, Module, and Sub Module are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onEdit(
        question._id || question.id,
        {
            questionText: text.trim(),
            questionType: type,
            isStartQuestion: isStart,
            platform: platform.trim(),
            module: moduleVal.trim(),
            subModule: subModule.trim()
        }
      );
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`card question-card ${isStart ? "is-start" : ""}`}>
      {editing ? (
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-error">{error}</div>}
          
          {/* NEW: Context Fields in Edit Mode */}
          <div className="field-row" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Platform</label>
              <input className="input" value={platform} onChange={(e)=>setPlatform(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Module</label>
              <input className="input" value={moduleVal} onChange={(e)=>setModuleVal(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Sub Module</label>
              <input className="input" value={subModule} onChange={(e)=>setSubModule(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`edit-text-${question._id}`}>Question text</label>
            <textarea
              id={`edit-text-${question._id}`}
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          
          <div className="field-row" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor={`edit-type-${question._id}`}>Question type</label>
              <select
                id={`edit-type-${question._id}`}
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="SINGLE_CHOISE">SINGLE_CHOISE</option>
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="COMPLEXITY">COMPLEXITY</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div className="checkbox-row" style={{ marginTop: 22 }}>
                <input
                  id={`edit-start-${question._id}`}
                  type="checkbox"
                  checked={isStart}
                  onChange={(e) => setIsStart(e.target.checked)}
                />
                <label htmlFor={`edit-start-${question._id}`}>Start question</label>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner" /> : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setEditing(false);
                setText(question.questionText);
                setType(question.questionType);
                setIsStart(question.isStartQuestion || question.isStarQuestion);
                setPlatform(question.platform || "");
                setModuleVal(question.module || "");
                setSubModule(question.subModule || "");
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="question-card-head">
            <div className="question-card-text">{question.questionText}</div>
          </div>

          {/* NEW: Context Display Badges */}
          {(question.platform || question.module) && (
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", background: "#f8fafc", padding: "8px", borderRadius: "6px", display: "inline-block" }}>
              <strong>Context: </strong> 
              {question.platform} {question.module && `> ${question.module}`} {question.subModule && `> ${question.subModule}`}
            </div>
          )}

          <div className="question-card-tags" style={{ marginBottom: "15px" }}>
            <span className="badge badge-type">
                {TYPE_LABELS[question.questionType] || question.questionType}
            </span>
            {(question.isStartQuestion || question.isStarQuestion) && (
                <span className="badge badge-start">Start Question</span>
            )}
          </div>

          {question.questionType === "TEXT" && (
              <div style={{ marginTop: "10px", padding: "10px", background: "#eef6ff", borderRadius: "6px", fontSize: "14px" }}>
                User enters text directly. No options required.
              </div>
          )}

          {question.questionType === "NUMBER" && (
              <div style={{ marginTop: "10px", padding: "10px", background: "#eef6ff", borderRadius: "6px", fontSize: "14px" }}>
                User enters a number directly. No options required.
              </div>
          )}

          {question.questionType === "COMPLEXITY" && (
              <div style={{ marginTop: "10px", padding: "10px", background: "#eef6ff", borderRadius: "6px", fontSize: "14px" }}>
                User selects High, Medium, or Low. Hours are automatically allocated.
              </div>
          )}

          {isChoiceType && (
              <div style={{ marginTop: 14 }}>
                <div className="section-title">Options</div>
                <OptionList
                    question={question}
                    onAddOption={onAddOption}
                    onDeleteOption={onDeleteOption}
                />
              </div>
          )}

          <div style={{ marginTop: 14 }}>
            <div className="section-title">Rules</div>
            <RuleList
                question={question}
                allQuestions={allQuestions}
                onAddRule={onAddRule}
                onDeleteRule={onDeleteRule}
            />
          </div>

          <div className="question-card-actions" style={{ marginTop: "20px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(question)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}