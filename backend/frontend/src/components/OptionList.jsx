function OptionList({
    options,
    selectedOption,
    setSelectedOption
}) {
    return (
        <div>
            {options.map((option) => (
                <div key={option._id}>
                    <input
                        type="radio"
                        name="option"
                        value={option._id}
                        checked={
                            selectedOption === option._id
                        }
                        onChange={(e) =>
                            setSelectedOption(
                                e.target.value
                            )
                        }
                    />

                    {option.optionText}
                </div>
            ))}
        </div>
    );
}

export default OptionList;