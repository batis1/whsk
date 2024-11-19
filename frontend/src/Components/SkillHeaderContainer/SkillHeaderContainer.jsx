import React, { useEffect } from "react";
import { MainWrapper, SkillProgressGreen } from "./SkillHeaderContainerSC";

export const SkillHeaderContainer = ({ questionsLength, currentQuestion }) => {
  useEffect(() => {
    console.log(
      `${Number(((currentQuestion + 1) / questionsLength) * 100).toFixed(0)}%`
    );
    console.log({ questionsLength, currentQuestion });
  }, [currentQuestion]);

  return (
    <MainWrapper>
      <div className="skill-header-content-frame">
        <a className="skill-x-button" href="/"></a>
        <div className="skill-progress-button">
          <div className="skill-progress-container-anon">
            <div className="skill-progress-container">
              <SkillProgressGreen
                widthP={`${Number(
                  (currentQuestion / questionsLength) * 100
                ).toFixed(0)}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </MainWrapper>
  );
};
