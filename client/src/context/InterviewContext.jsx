import { createContext, useContext, useState } from "react";

const SkillsContext = createContext();

export function SkillsProvider({ children }) {
  const [skills, setSkills] = useState([]);

  return (
    <SkillsContext.Provider value={{ skills, setSkills }}>
      {children}
    </SkillsContext.Provider>
  );
}

export default function useSkill() {
  return useContext(SkillsContext);
}