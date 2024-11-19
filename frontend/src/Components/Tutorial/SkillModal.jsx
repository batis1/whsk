import React, { useContext } from "react";
import { SkillModalSC } from "./TutorialSC";
import { useHistory } from "react-router-dom";
import { actions, GlobalContext } from "../../App";

export const SkillModal = ({ isOpen, title, lessonId }) => {
  const history = useHistory();
  const { state, dispatch } = useContext(GlobalContext);

  console.log("SkillModal state:", { state, title, lessonId });

  const handleExerciseClick = (category) => {
    console.log("Starting exercise with:", { category, title, lessonId });
    
    const payload = { 
      level: title, 
      isGame: false, 
      lessonId: lessonId,
      category: category,
      loading: true
    };
    
    console.log("Dispatching payload:", payload);
    
    dispatch({
      type: actions.SET_LESSON_PARAMS,
      payload
    });

    history.push("/quiz");
  };

  return (
    <SkillModalSC isOpen={isOpen} className="skill-modal-container skm-pointer">
      <div>
        <div className="skm-start-btn-container">
          <button
            onClick={() => handleExerciseClick("Reading")}
            className="skm-start-btn"
          >
            Reading Exercise
          </button>
        </div>
        <div className="skm-start-btn-container">
          <button
            onClick={() => handleExerciseClick("Listing")}
            className="skm-start-btn"
          >
            Listening Exercise
          </button>
        </div>
      </div>
    </SkillModalSC>
  );
};
