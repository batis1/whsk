import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { use } from "bcrypt/promises";
// import type { Quote as QuoteType } from "../types";

const initial = Array.from({ length: 5 }, (v, k) => k).map((k) => {
  const custom = {
    id: `id-${k}`,
    content: `Quote ${k}`,
  };

  return custom;
});

// const words = ["好", "什么", "你", "爱", "的", "是"];

// const initial = words.map((k, index) => {
//   const custom = {
//     id: `id-${index}`,
//     content: `${k}`,
//   };

//   return custom;
// });

const grid = 8;
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const QuoteItem = styled.div`
  width: 200px;
  border: 1px solid grey;
  margin-bottom: ${grid}px;
  background-color: var(--greyAccent);
  padding: ${grid}px;
  font-weight: 800;
  font-size: medium;
`;

const Wrapper = styled.div`
  & > div {
    display: flex;
    gap: 10px;
    justify-content: center;
    .css-1duznp8 {
      width: 100px;
    }
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
`;

function Quote({ quote, index }) {
  return (
    <Draggable draggableId={quote.id} index={index}>
      {(provided) => (
        <QuoteItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {quote.content}
        </QuoteItem>
      )}
    </Draggable>
  );
}

const QuoteList = React.memo(function QuoteList({ quotes }) {
  return quotes.map((quote: QuoteType, index: number) => (
    <Quote quote={quote} index={index} key={quote.id} />
  ));
});

function QuoteApp({
  question,
  correct_answer,
  setGameState,
  currQuestion,
  setCurrQuestion,
  questions,
  handleAnswer,
}) {
  const [state, setState] = useState({ quotes: initial });

  useEffect(() => {
    // console.log(questions[currQuestion]?.question.split(" "));
    const initial = questions[currQuestion]?.question
      .split(" ")
      .filter((k) => k)
      .map((k, index) => {
        if (k) {
          const custom = {
            id: `id-${index}`,
            content: `${k}`,
          };

          return custom;
        }

        return null;
      });

    console.log("🎇🎇🎇");
    console.log({ initial });

    setState({ quotes: initial });
  }, [question]);

  const [counter, setCounter] = useState(0);

  const elementRef = useRef(null);

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    if (result.destination.index === result.source.index) {
      return;
    }
    const quotes = reorder(
      state.quotes,
      result.source.index,
      result.destination.index
    );
    setState({ quotes });
    const userAnswer = quotes.map(({ content }) => content).join("");
    const limit = 5;
    if (userAnswer === correct_answer) {
      // console.log(questions[currQuestion + 1]);
      // console.log({ qLength: questions.length, currQuestion });
      if (questions.length - 1 > currQuestion) {
        // console.log(elementRef.current.offsetTop);
        handleAnswer(elementRef.current, 9999, true);
      } else {
        setGameState("finished");
      }
    }
    if (counter + 1 === limit) {
      setState({
        quotes: [
          {
            id: `id-1`,
            content: correct_answer,
          },
        ],
      });
      handleAnswer(elementRef.current, 9999, false);
      setCounter(0);
    } else {
      setCounter(counter + 1);
    }
  }

  return (
    <Wrapper ref={elementRef}>
      <DragDropContext onDragEnd={onDragEnd} direction="horizontal">
        <Droppable
          droppableId="list"
          direction="horizontal"
          // style={{ display: "flex" }}
          // className="d"
        >
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <QuoteList quotes={state.quotes} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Wrapper>
  );
}

export default QuoteApp;
// const rootElement = document.getElementById("root");
// ReactDOM.render(<QuoteApp />, rootElement);
