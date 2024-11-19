import React, { useState, useEffect } from "react";
import { SkillTree } from "./SkillTree";
import { MainWrapper } from "./TutorialSC";
import Loading from "../Loading/Loading";

export const Tutorial = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (you can remove setTimeout if you have actual data fetching)
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MainWrapper>
        <SkillTree />
      </MainWrapper>
    </div>
  );
};
