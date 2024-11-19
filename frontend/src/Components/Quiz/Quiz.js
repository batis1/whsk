import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import explode from "./explode";
import Timer from "./../Timer/Timer";
import EndScreen from "../EndScreen/EndScreen";
import Loading from "../Loading/Loading";
import "./Quiz.css";
import Aellipse from "../../Images/Aellipse.svg";
import Bellipse from "../../Images/Bellipse.svg";
import Cellipse from "../../Images/Cellipse.svg";
import Dellipse from "../../Images/Dellipse.svg";
import shuffleOptions from "../../lib/shuffleOptions";
import Replacer from "../../lib/Replacer";
// import { randomSparks } from "./spark";
import { correctAnimation, wrongAnimation } from "./answerAnimation";
import AudioPlayer from "./AudioPlayer";
import { SkillHeaderContainer } from "../SkillHeaderContainer/SkillHeaderContainer";
import { Typography, Divider, Popover, Button } from "antd";
import QuoteApp from "../DraggableList/MainDraggable";
import { actions, GlobalContext } from "../../App";
import apiList, { server } from "../../lib/apiList";
// import { Popover, Button } from "antd";
const { Title, Paragraph, Text } = Typography;

const content = (
  <div>
    <p>ContentContentContentContentContentContentContent</p>
    <p>ContContentContentContentContentContentContentent</p>
  </div>
);
const time = {
  Easy: 10000,
  easy: 10000,
  Medium: 15000,
  Hard: 20000,
};

const points = {
  Easy: 2,
  Medium: 5,
  Hard: 10,
};

const optionImg = [Aellipse, Bellipse, Cellipse, Dellipse];

const Quiz = ({ user, reset }) => {
  console.log("Quiz component user:", { 
    user,
    userKeys: user ? Object.keys(user) : [],  // Log all available keys
    hskLevel: user?._doc?.hskLevel,
    userType: typeof user,
    isUserObject: user instanceof Object
  });

  const [currQuestion, setCurrQuestion] = useState(0);
  const [optionChosen, setOptionChosen] = useState();
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState();
  const [options, setOptions] = useState();
  // gameState options [loading, finished,  active, paused]
  const [gameState, setGameState] = useState("loading");
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState();
  const [timer, setTimer] = useState(1000 * 55);
  const [timerState, setTimerState] = useState("idle");
  const [showBomb, setShowBomb] = useState(true);
  const [optionStyles, setOptionStyles] = useState([]);
  const [answerProcessed, setAnswerProcessed] = useState(true);
  const [scoreUploaded, setScoreUploaded] = useState(false);
  const [mouseClick, setMouseClick] = useState();
  const [isOptionsProcessed, setIsOptionsProcessed] = useState(false);
  const history = useHistory();
  // const { isGame } = useParams();
  const {
    state: { isGame, level, category },
    dispatch,
  } = useContext(GlobalContext);

  console.log({ isGame });

  const bombRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    if (!user) {
      history.push("/login");
    }
  }, []);

  // Add debug logging for global state
  useEffect(() => {
    console.log("Global state in Quiz:", { isGame, level, category });
  }, [isGame, level, category]);

  // fetch data and set game and timer active
  useEffect(() => {
    console.log("🔍 Fetch effect triggered:", { 
      user,
      isGame,
      category,
      userHskLevel: user?._doc?.hskLevel,
      level
    });

    if (!user) {
      console.warn("❌ No user object available");
      return;
    }

    const userHskLevel = user._doc?.hskLevel;
    if (!userHskLevel) {
      console.warn("❌ No HSK level available");
      return;
    }

    // Different URL construction based on game mode
    const fetchUrl = isGame 
      ? `${apiList.questions}?hskLevel=${userHskLevel}`
      : `${apiList.questions}?category=${category || 'Reading'}&hskLevel=${userHskLevel}&level=${level}`;
    
    console.log("🌐 Fetching URL:", fetchUrl);
    
    fetch(fetchUrl)
      .then(res => {
        console.log("📥 Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("📦 Raw server response:", data);

        // Check the structure of the response
        if (!data || (!data.questions && !Array.isArray(data))) {
          console.error("❌ Invalid response format:", data);
          return;
        }

        // Handle both possible response formats
        let questions = Array.isArray(data) ? data : data.questions;
        
        if (!questions || questions.length === 0) {
          console.warn(`❌ No questions found for HSK level ${userHskLevel}`);
          setQuestions([]);
          return;
        }

        // For tutorial mode, filter by category
        if (!isGame) {
          const filteredQuestions = questions.filter(q => q.category === category);
          console.log("🎯 Filtered questions:", {
            originalCount: questions.length,
            filteredCount: filteredQuestions.length,
            category,
            firstQuestion: filteredQuestions[0]
          });
          questions = filteredQuestions;
        }

        // Only shuffle in game mode
        const finalQuestions = isGame 
          ? [...questions].sort(() => Math.random() - 0.5)
          : questions;

        console.log("✅ Final questions:", {
          mode: isGame ? "Game" : "Tutorial",
          category: isGame ? "All" : category,
          count: finalQuestions.length,
          firstQuestion: finalQuestions[0]
        });

        setQuestions(finalQuestions);
        setGameState("active");
        setTimerState("active");
        setCurrQuestion(0);
        setAnswerProcessed(true);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions:", error);
        setGameState("error");
      });
  }, [isGame, user, category, level]);

  // Add this debug effect to track state changes
  useEffect(() => {
    console.log("Game state updated:", {
      gameState,
      questionsLoaded: questions?.length || 0,
      currentQuestion: currQuestion,
      timerState
    });
  }, [gameState, questions, currQuestion, timerState]);

  useEffect(() => {
    // if (isGame === "true") {
    if (isGame) {
      try {
        const bombPosition =
          bombRef.current.children[1].getBoundingClientRect();
        const y =
          bombPosition.y +
          bombPosition.height / 2 -
          window.innerHeight / 2 +
          window.scrollY -
          70;
        // randomSparks.tune({ x: 85, y: y });
        console.log(y);
        if (timerState === "active") {
          console.log("spark");

          // randomSparks.play();
        } else {
          // randomSparks.stop();
        }
      } catch {
        console.log("caught");
      } finally {
        return () => {
          // randomSparks.stop();
        };
      }
    }
  }, [timerState, currQuestion]);

  // after the game is over save user score
  useEffect(() => {
    if (gameState === "finished" && !scoreUploaded) {
      const payload = {
        username: user.username,
        userID: user.id,
        score,
        date: Date.now(),
      };
      console.log({ payload });
      fetch(apiList.score, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (res.status === 200) {
          console.log("score saved");
          setScoreUploaded(true);
        } else {
          console.log("unable to save score");
        }
      });
    }
  }, [gameState, scoreUploaded]);

  // show questions one by one
  useEffect(() => {
    console.log("in create question useEffect", { gameState, answerProcessed });
    
    if (gameState !== "loading") {
      if (answerProcessed && !isOptionsProcessed) {
        setIsOptionsProcessed(true);
        setAnswerProcessed(false);
        
        const currentQuestion = questions[currQuestion];
        console.log("🚀 Starting question processing:", {
          hasQuestion: !!currentQuestion,
          gameState,
          answerProcessed,
          isOptionsProcessed
        });

        if (!currentQuestion) {
          console.warn("❌ No current question found!");
          return;
        }

        console.log("📋 Question Details:", {
          category: currentQuestion.category,
          type: currentQuestion.type,
          correct_answer: currentQuestion.correct_answer,
          mode: isGame ? "Game" : "Tutorial"
        });

        // Check if it's a Listing question
        const isListingQuestion = currentQuestion.category === "Listing";
        console.log("🎧 Is Listing Question:", isListingQuestion);

        if (isListingQuestion) {
          // Force True/False options for Listing questions
          const truefalseOptions = ["True", "False"];
          const correctIndex = currentQuestion.correct_answer.toLowerCase() === "true" ? 0 : 1;
          
          console.log("✅ Creating True/False options:", {
            options: truefalseOptions,
            correctIndex,
            correct_answer: currentQuestion.correct_answer
          });
          
          setOptions(truefalseOptions);
          setCorrectAnswerIndex(correctIndex);
        } else {
          // For Reading questions with multiple choice
          console.log("📚 Creating multiple choice options");
          const [answers, correctIndex] = shuffleOptions(
            currentQuestion.correct_answer,
            currentQuestion.incorrect_answers
          );
          console.log("📝 Multiple choice options created:", answers);
          setOptions(answers);
          setCorrectAnswerIndex(correctIndex);
        }
      }
    }
  }, [gameState, currQuestion, answerProcessed, questions, isOptionsProcessed]);

  // Debug useEffect for options
  useEffect(() => {
    console.log("🎯 Options state changed:", {
      options,
      correctAnswerIndex,
      gameState,
      isOptionsProcessed
    });
  }, [options, correctAnswerIndex, gameState, isOptionsProcessed]);

  // after select an answer show only the correct answer
  useEffect(() => {
    console.log("options style useEffect", options);
    if (options) {
      setOptionStyles(options.map(() => ({ opacity: "100%" })));
    }
  }, [options]);

  // for change the timer
  useEffect(() => {
    // if (isGame === "true") {
    if (isGame) {
      console.log("in timer useEffect");
      try {
        if (timerState === "active") {
          // when the timer is over
          if (timer === 0) {
            setTimerState("idle");
            const bombPosition =
              bombRef.current.children[1].getBoundingClientRect();
            const y =
              10 +
              bombPosition.y +
              bombPosition.height / 2 -
              window.innerHeight / 2 +
              window.scrollY;
            // const x = bombPosition.x + bombPosition.width / 2;
            explode(0, y);
            setTimeout(() => {
              setShowBomb(false);
              setGameState("finished");
            }, 1000);
          }
          // for change the timer
          else {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setTimer((prevState) => prevState - 100);
            }, 100);
          }
        } else if (timerState === "paused") {
          clearTimeout(timerRef.current);
        }
      } catch {
        console.log("caught");
      }
    }
  }, [timer, timerState]);

  // handle user answer. if correct set score and increase timer
  useEffect(() => {
    console.log("process answer useEffect", { gameState, optionChosen });
    // if (gameState === "active") debugger;
    if (
      gameState === "active" &&
      optionChosen !== undefined &&
      optionChosen !== null
    ) {
      console.log("**********");

      console.log(time[questions[currQuestion].difficulty]);
      console.log(questions[currQuestion].difficulty);
      if (optionChosen === correctAnswerIndex) {
        setScore(
          (prevState) => prevState + points[questions[currQuestion].difficulty]
        );
        setTimer(
          (prevState) => prevState + time[questions[currQuestion].difficulty]
        );
      }
      setOptionChosen(null);

      console.log({
        length: questions.length,
        cureentQ: questions[currQuestion],
        cureentnext: questions[currQuestion + 1],
      });

      if (questions[currQuestion + 1]) setCurrQuestion(currQuestion + 1);
      else setGameState("finished");
      console.log("here");
      // if (!answerProcessed) debugger
      setIsOptionsProcessed(false);
      setAnswerProcessed(true);
    }
  }, [optionChosen, gameState]);

  // const [correctOrder, setCorrectOrder] = useState(false);

  const handleAnswer = (event, answerIndex, isCorrectOrder) => {
    console.log("handle answer");
    setTimerState("paused");
    setGameState("paused");

    // setIsOptionsProcessed(false);

    // highlight chosen answer
    // fade incorrect answers
    console.log("correct answer🎈🎈🎈🎈");

    console.log({ isCorrectOrder, pageX: event.offsetTop });
    if (isCorrectOrder !== undefined) {
      if (isCorrectOrder) {
        const checkAnimation = correctAnimation({
          x: event.offsetTop - window.innerWidth / 2 + 400,
          y: event.offsetTop - window.innerHeight / 2,
        });
        checkAnimation.play();
      } else {
        const crossAnimation = wrongAnimation({
          x: event.offsetTop - window.innerWidth / 2 + 400,
          y: event.offsetTop - window.innerHeight / 2,
        });
        crossAnimation.play();

        setTimeout(() => {
          console.log("order correct answer if the user didn't find it");
          console.log(questions[currQuestion].correct_answer);
        }, 5000);
      }
    }

    if (answerIndex == correctAnswerIndex) {
      const checkAnimation = correctAnimation({
        x: event.pageX - window.innerWidth / 2,
        y: event.pageY - window.innerHeight / 2,
      });

      // const checkAnimation = correctAnimation({
      //   x: window.innerWidth / 2,
      //   y: window.innerHeight / 2,
      // });
      checkAnimation.play();
    } else {
      const crossAnimation = wrongAnimation({
        x: event.pageX - window.innerWidth / 2,
        y: event.pageY - window.innerHeight / 2,
      });
      crossAnimation.play();
    }
    setOptionStyles(
      options.map((o, index) => ({
        opacity: index === correctAnswerIndex ? "100%" : "0%",
      }))
    );

    setTimeout(
      () => {
        // update option chosen
        console.log("Runnin handle answer settimeout", { answerIndex });
        console.log({ optionChosen });
        setOptionChosen(answerIndex);

        setTimerState("active");
        setGameState("active");
      },
      isCorrectOrder === undefined ? 1000 : 5000
    );
  };

  // console.log({ isGame });
  return gameState === "loading" ? (
    // return true ? (
    <Loading />
  ) : (
    <>
      <div>
        {/* isGame === "false" */}
        {!isGame && gameState !== "finished" && (
          <div>
            <SkillHeaderContainer
              currentQuestion={currQuestion}
              questionsLength={questions.length}
            />
          </div>
        )}
      </div>

      <div
        ref={bombRef}
        className="Quiz "
        // style={
        //   gameState !== "finished" &&
        //   questions[currQuestion]?.type !== "question order" &&
        //   !questions[currQuestion]?.audioUrl
        //     ? { height: "55.5vh" }
        //     : {}
        // }
      >
        {gameState !== "finished" ? (
          <>
            <div className="questionWrapper">
              {isGame && (
                <p
                  className={`difficulty ${questions[currQuestion]?.difficulty}`}
                >
                  {questions[currQuestion]?.difficulty}
                </p>
              )}

              {questions[currQuestion]?.type !== "question order" ? (
                <Popover
                  content={
                    <div>
                      <p>
                        {questions[currQuestion]?.popupDescription &&
                          questions[currQuestion]?.popupDescription.pinyin}
                      </p>
                      <p>
                        {questions[currQuestion]?.popupDescription &&
                          questions[currQuestion]?.popupDescription.translation}
                      </p>
                      {/* <p>ContContentContentContentContentContentContentent</p> */}
                    </div>
                  }
                  trigger="hover"
                >
                  <Text
                    className="questionTitle"
                    style={{ fontSize: "xx-large" }}
                  >
                    {Replacer(questions[currQuestion]?.question)}
                  </Text>
                </Popover>
              ) : (
                <Text
                  className="questionTitle"
                  style={{ fontSize: "xx-large" }}
                >
                  {/* {Replacer(questions[currQuestion]?.question)} */}
                  Order words:
                </Text>
              )}

              {/* <h1 className="questionTitle">
                {Replacer(questions[currQuestion]?.question)}
              </h1> */}
            </div>
            {questions[currQuestion]?.audioUrl && (
              <AudioPlayer
                // audioUrl={`${server}/${questions[currQuestion]?.audioUrl}`}
                audioUrl={questions[currQuestion]?.audioUrl}
                audioDescription={questions[currQuestion]?.audioDescription}
              />
            )}
            {isGame && (
              <Timer
                score={score}
                showBomb={showBomb}
                time={`00:${Math.floor(timer / 1000)
                  .toString()
                  .padStart(2, "0")}`}
              />
            )}
            {/* Writing-related code commented out
              optionsDropdown[optionIndex].value === "Writing" ? (
                <QuoteApp
                  question={questions[currQuestion]?.question}
                  correct_answer={questions[currQuestion]?.correct_answer}
                  setCurrQuestion={setCurrQuestion}
                  currQuestion={currQuestion}
                  setGameState={setGameState}
                  questions={questions}
                  handleAnswer={handleAnswer}
                />
              ) : (
            */}
            <div className="options">
              {options &&
                options.map((option, index) => {
                  const currentQuestion = questions[currQuestion];
                  const isListingQuestion = currentQuestion?.category === "Listing";
                  
                  return (
                    <button
                      key={index}
                      style={optionStyles[index]}
                      onClick={(event) => handleAnswer(event, index)}
                    >
                      <img
                        src={optionImg[index]}
                        alt="answer"
                        className="ellipseOption"
                      />
                      {isListingQuestion ? option : Replacer(option)}
                    </button>
                  );
                })}
            </div>
            {/* <QuoteApp /> */}
            {/* <div className="options">
              {options &&
                options.map((option, index) => {
                  return (
                    <button
                      style={optionStyles[index]}
                      onClick={(event) => handleAnswer(event, index)}
                    >
                      <img
                        src={optionImg[index]}
                        alt="answer"
                        className="ellipseOption"
                      />
                      {Replacer(option)}
                    </button>
                  );
                })}
            </div> */}
          </>
        ) : (
          <EndScreen
            user={user}
            score={score}
            resetQuiz={reset}
            isGame={isGame}
          />
        )}
      </div>
    </>
  );
};

export default Quiz;
