import "./Input.css";

const InputField = ({ name, value, onChangeFunc, id, minLength, type }) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChangeFunc}
      id={id}
      minLength={minLength}
      className={`input ${value ? "focused" : ""}`}
      placeholder="Type your text"
    />
  );
};

export default InputField