import { useState } from "react";
import api from "../services/api";

function AdminDashboard() {
    const [title, setTitle] =
        useState("");

    const [description,
        setDescription] =
        useState("");

    const createQuestionnaire =
        async () => {
            try {
                await api.post(
                    "/questionnaires",
                    {
                        title,
                        description
                    }
                );

                alert(
                    "Questionnaire Created"
                );

                setTitle("");
                setDescription("");
            } catch (error) {
                console.error(error);
                alert(
                    "Creation Failed"
                );
            }
        };

    return (
        <div>
            <h2>
                Admin Dashboard
            </h2>

            <input
                placeholder="Title"
                value={title}
                onChange={(e) =>
                    setTitle(
                        e.target.value
                    )
                }
            />

            <input
                placeholder="Description"
                value={description}
                onChange={(e) =>
                    setDescription(
                        e.target.value
                    )
                }
            />

            <button
                onClick={
                    createQuestionnaire
                }
            >
                Create Questionnaire
            </button>
        </div>
    );
}

export default AdminDashboard;