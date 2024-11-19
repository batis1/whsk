import React from "react";
import "./Howtoplay.css";
import rule1 from "../../Images/rule1.svg";
import rule2 from "../../Images/rule2.svg";
import rule3 from "../../Images/rule3.svg";
import rule4 from "../../Images/rule4.svg";

const Howtoplay = () => {
  return (
    <div className="howtoplay-page">
      <h1 className="header">How to use this platform</h1>
      <div className="rules">
        <div className="rule-container">
          <div className="number-container">
            <img src={rule1} width="50px" alt="rule number indicator" />
          </div>
          <div>
            <p className="rule">
              Follow the tutorial's lessons and complete the exercises. You can choose from different categories like Reading and Listening to practice specific skills.
            </p>
          </div>
        </div>

        <div className="rule-container">
          <div className="number-container">
            <img src={rule2} width="50px" alt="rule number indicator" />
          </div>
          <div>
            <p className="rule">
              In game mode, you start with 55 seconds on the timer. Each correct answer adds bonus time:
              <ul className="rule-details">
                <li>Easy questions: +10 seconds (2 points)</li>
                <li>Medium questions: +15 seconds (5 points)</li>
                <li>Hard questions: +20 seconds (10 points)</li>
              </ul>
            </p>
          </div>
        </div>

        <div className="rule-container">
          <div className="number-container">
            <img src={rule3} width="50px" alt="rule number indicator" />
          </div>
          <div>
            <p className="rule">
              Keep answering questions correctly to keep the timer going. If the timer reaches zero, the bomb explodes and the game ends. Try to achieve the highest score possible!
            </p>
          </div>
        </div>

        <div className="rule-container">
          <div className="number-container">
            <img src={rule4} width="50px" alt="rule number indicator" />
          </div>
          <div>
            <p className="rule">Have fun!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Howtoplay;
