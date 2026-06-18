import { useState } from "react";

const CHOICE_TYPES = [
  "SINGLE_CHOISE",
  "MULTIPLE_CHOISE"
];

export default function OptionList({
  question,
  onAddOption,
  onDeleteOption
}) {
  const [showForm, setShowForm] =useState(false);

  const [optionText, setOptionText] =useState("");

  const [displayOrder, setDisplayOrder] =useState(
      (question.options?.length || 0) + 1
    );

  const [error, setError] =useState("");

  const [saving, setSaving] =useState(false);

  if (
    !CHOICE_TYPES.includes(
      question.questionType
    )
  ) {
    return null;
  }

  const options = [
    ...(question.options || [])
  ].sort(
    (a, b) =>
      (a.displayOrder || 0) -
      (b.displayOrder || 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!optionText.trim()) {
      setError("Option text is required");
      return;
    }

    console.log("QUESTION ID:", question._id);
    console.log("PAYLOAD:", {
      optionText: optionText.trim(),
      displayOrder: Number(displayOrder),
    });

    try {
      setSaving(true);
      setError("");

      await onAddOption(question._id, {
        optionText: optionText.trim(),
        displayOrder: Number(displayOrder),
      });

      // Reset the form for the next option
      setOptionText("");
      setDisplayOrder(Number(displayOrder) + 1);
      
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);

      setError(
        error.response?.data?.detail ||
        error.message ||
        "Failed to add option"
      );
    } finally {
      // CRITICAL FIX: Unlock the submit button!
      setSaving(false); 
    }
  };

  return (
    <div>
      {options.length > 0 ? (
        <ul>
          {options.map(
            (option, index) => (
              <li
                key={option._id}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom:
                    "8px"
                }}
              >
                <span>
                  {index + 1}.
                </span>

                <span
                  style={{
                    flex: 1
                  }}
                >
                  {
                    option.optionText
                  }
                </span>

                <button
                  onClick={() =>
                    onDeleteOption(
                      option._id
                    )
                  }
                >
                  Delete
                </button>
              </li>
            )
          )}
        </ul>
      ) : (
        <p>
          No options available
        </p>
      )}

      {showForm ? (
        <form
          onSubmit={
            handleSubmit
          }
        >
          {error && (
            <p>{error}</p>
          )}

          <input
            type="text"
            value={optionText}
            placeholder="Option Text"
            onChange={(e) =>
              setOptionText(
                e.target.value
              )
            }
          />

          <input
            type="number"
            value={
              displayOrder
            }
            onChange={(e) =>
              setDisplayOrder(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Add Option"}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowForm(
                false
              )
            }
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() =>
            setShowForm(
              true
            )
          }
        >
          + Add Option
        </button>
      )}
    </div>
  );
}