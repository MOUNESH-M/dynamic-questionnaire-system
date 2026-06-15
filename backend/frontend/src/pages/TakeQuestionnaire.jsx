import { useEffect, useState } from "react";
import api from "../services/api";

function TakeQuestionnaire() {

    const questionnaireId =
        "6a2eb8a45a52a81c1723cdc3";

    const [currentQuestion,
        setCurrentQuestion] =
        useState(null);

    const [options,
        setOptions] =
        useState([]);

    const [selectedOption,
        setSelectedOption] =
        useState("");

    const [answers,
        setAnswers] =
        useState([]);

    const [completed,
        setCompleted] =
        useState(false);

    useEffect(() => {

        loadStarQuestion();

    }, []);

    const loadStarQuestion =
        async () => {

            try {

                const response =
                    await api.get(
                        `/questions/questionnaire/${questionnaireId}`
                    );

                const starQuestion =
                    response.data.find(
                        question =>
                            question.isStarQuestion === true ||
                            question.isStarQuestion === "True"
                    );

                if (!starQuestion) {

                    alert(
                        "Star Question Not Found"
                    );

                    return;
                }

                setCurrentQuestion(
                    starQuestion
                );

                await loadOptions(
                    starQuestion._id
                );

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Failed To Load Questionnaire"
                );
            }
        };

    const loadOptions =
        async (
            questionId
        ) => {

            try {

                const response =
                    await api.get(
                        `/options/question/${questionId}`
                    );

                setOptions(
                    response.data
                );

            } catch (error) {

                console.error(
                    error
                );

                setOptions([]);
            }
        };

    const submitQuestionnaire =
        async (
            answersToSubmit
        ) => {

            try {

                const response =
                    await api.post(
                        "/submissions",
                        {
                            questionnaireId,
                            userId:
                                "TEST_USER",
                            answers:
                                answersToSubmit
                        }
                    );

                console.log(
                    "Submission Saved",
                    response.data
                );

            } catch (error) {

                console.error(
                    "Submission Error",
                    error.response?.data ||
                    error.message
                );
            }
        };

    const handleNext =
        async () => {

            if (!selectedOption) {

                alert(
                    "Please Select An Option"
                );

                return;
            }

            const selectedOptionObject =
                options.find(
                    option =>
                        option._id ===
                        selectedOption
                );

            const updatedAnswers = [

                ...answers,

                {
                    questionId:
                        currentQuestion._id,

                    answer:
                        selectedOptionObject
                            ?.optionText ||
                        selectedOption
                }
            ];

            setAnswers(
                updatedAnswers
            );

            try {

                const response =
                    await api.post(
                        "/engine/next-question",
                        {
                            questionId:
                                currentQuestion._id,

                            selectedOptionId:
                                selectedOption
                        }
                    );

                const nextQuestion =
                    response.data;

                console.log(
                    "Next Question:",
                    nextQuestion
                );

                if (
                    !nextQuestion ||
                    !nextQuestion._id
                ) {

                    await submitQuestionnaire(
                        updatedAnswers
                    );

                    setCompleted(
                        true
                    );

                    return;
                }

                setCurrentQuestion(
                    nextQuestion
                );

                setSelectedOption(
                    ""
                );

                await loadOptions(
                    nextQuestion._id
                );

            } catch (error) {

                console.log(
                    "No Next Question Found"
                );

                await submitQuestionnaire(
                    updatedAnswers
                );

                setCompleted(
                    true
                );
            }
        };

    if (completed) {

        return (
            <div>
                <h2>
                    Questionnaire Completed
                </h2>

                <p>
                    Thank You For Your Response
                </p>
            </div>
        );
    }

    if (!currentQuestion) {

        return (
            <h2>
                Loading...
            </h2>
        );
    }

    return (
        <div>

            <h2>
                {
                    currentQuestion.questionText
                }
            </h2>

            {
                options.length > 0 ? (

                    options.map(
                        option => (

                            <div
                                key={
                                    option._id
                                }
                            >
                                <input
                                    type="radio"
                                    name="option"
                                    value={
                                        option._id
                                    }
                                    checked={
                                        selectedOption ===
                                        option._id
                                    }
                                    onChange={
                                        (
                                            e
                                        ) =>
                                            setSelectedOption(
                                                e.target.value
                                            )
                                    }
                                />

                                {
                                    option.optionText
                                }

                            </div>
                        )
                    )

                ) : (

                    <p>
                        No Options Available
                    </p>

                )
            }

            <br />

            <button
                onClick={
                    handleNext
                }
            >
                Next
            </button>

        </div>
    );
}

export default TakeQuestionnaire;