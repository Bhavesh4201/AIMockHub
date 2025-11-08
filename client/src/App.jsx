import ResumeUpload from "./components/ResumeUpload";
import useSkill from "./context/InterviewContext";


function App() {
  const skills = useSkill();
  return (
    <>
      <ResumeUpload />
      {Array.isArray(skills) && skills.length > 0 && (
        <ul>
          {skills.map((item, idx) => (
            <li key={idx}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      )}
      {/* <QuestionCard /> */}
    </>
  );
}

export default App;