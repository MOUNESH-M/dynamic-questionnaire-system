function QuestionCard({
    question
}) {
    if (!question) {
        return null;
    }

    return (
        <h2>
            {question.questionText}
        </h2>
    );
}

export default QuestionCard;