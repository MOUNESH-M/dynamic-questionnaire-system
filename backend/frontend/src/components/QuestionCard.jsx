import { useState } from "react";
import OptionList from "./OptionList";
import RuleList from "./RuleList";

const TYPE_LABELS = {
  SINGLE_CHOISE: "Single choice",
  MULTIPLE_CHOISE: "Multiple choice",
  TEXT: "Text",
  NUMBER: "Number",
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
  const [text, setText] =useState(question.questionText);
  const [type, setType] =useState(question.questionType);
  const [isStart, setIsStart] =useState(question.isStarQuestion);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isSingleChoice = question.questionType === "SINGLE_CHOISE";

  const isMultipleChoice =question.questionType ==="MULTIPLE_CHOISE";

 const isChoiceType =question.questionType === "SINGLE_CHOISE" || question.questionType === "MULTIPLE_CHOISE";

  async function handleSave(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Question text is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onEdit(
        question._id,
        {
            questionText:
            text.trim(),

            questionType:
            type,

            isStarQuestion:
            isStart
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
    <div className={`card question-card ${question.isStarQuestion ? "is-start" : ""}`}>
      {editing ? (
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label htmlFor={`edit-text-${question._id}`}>Question text</label>
            <textarea
              id={`edit-text-${question._id}`}
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor={`edit-type-${question._id}`}>Question type</label>
              <select
                id={`edit-type-${question._id}`}
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="SINGLE_CHOISE">SINGLE_CHOISE</option>
                <option value="MULTIPLE_CHOISE">MULTIPLE_CHOISE</option>
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
              </select>
            </div>
            <div className="field" style={{ justifyContent: "center" }}>
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
          <div className="flex gap-8">
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
                setIsStart(question.isStarQuestion);
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
          <div className="question-card-tags">
            <span className="badge badge-type">{TYPE_LABELS[question.questionType] || question.questionType}</span>
            {question.isStarQuestion && <span className="badge badge-start">Start question</span>}
          </div>

          <div className="question-card-tags">
            <span className="badge badge-type">
                {TYPE_LABELS[question.questionType] ||
                question.questionType}
            </span>

            {question.isStarQuestion && (
                <span className="badge badge-start">
                Start Question
                </span>
            )}
            </div>

            {
            question.questionType === "TEXT" && (
                <div
                style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#eef6ff",
                    borderRadius: "6px"
                }}
                >
                User enters text directly.
                No options required.
                </div>
            )
            }

            {
            question.questionType === "NUMBER" && (
                <div
                style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#eef6ff",
                    borderRadius: "6px"
                }}
                >
                User enters a number directly.
                No options required.
                </div>
            )
            }

          {
            isChoiceType && (
                <div style={{ marginTop: 14 }}>

                <div className="section-title">
                    Options
                </div>

                <OptionList
                    question={question}
                    onAddOption={onAddOption}
                    onDeleteOption={onDeleteOption}
                />

                </div>
            )
            }

          <div style={{ marginTop: 14 }}>
            <div className="section-title">
                Rules
            </div>

            <RuleList
                question={question}
                allQuestions={allQuestions}
                onAddRule={onAddRule}
                onDeleteRule={onDeleteRule}
            />
          </div>

          <div className="question-card-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(question)}
          >
            Delete
          </button>
          </div>
        </>
      )}
    </div>
  );
}
