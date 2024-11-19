import { Badge, Button } from "antd";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { actions, GlobalContext } from "../../App";
import { MainWrapper } from "./ButtonOptionsSC";
// import { MainWrapper } from "./ButtonOptions";

export const ButtonOptions = () => {
  const history = useHistory();
  const {
    state: { user }, // Remove savedWords destructuring
    dispatch,
  } = useContext(GlobalContext);
  const [show, setShow] = useState(true);
  return (
    <MainWrapper>
      <div
        style={
          {
            // display: "flex",
            // justifyContent: "center",
            // alignItems: "center",
            // height: "20vh",
            // marginLeft: "-100px",
            // flexDirection: "column",
          }
        }
      >
        <Button
          // to={"/quiz"}
          onClick={() => {
            dispatch({
              type: actions.SET_LESSON_PARAMS,
              payload: { level: "", isGame: true },
            });
            history.push("/quiz");
          }}
          className="btn homebtn white homebuttons"
          style={{ lineHeight: "42px" }}
        >
          GAME
        </Button>
        <Button
          onClick={() => history.push("/tutorial")}
          className="btn homebtn white"
          style={{ lineHeight: "42px" }}
        >
          TUTORIAL
        </Button>
        {/* <Button
          className="btn homebtn white"
          style={{
            width: "35%",
          }}
          onClick={() => {
            dispatch({
              type: actions.SET_LESSON_PARAMS,
              payload: { lessonId: "", searchInput: "" },
            });
            history.push("/lesson");
          }}
        >
          SAVED WORDS
          <Badge
            count={show ? savedWords?.length : 0}
            style={{ background: "#e67329", color: "white", margin: "5px" }}
          />
        </Button> */}
      </div>
    </MainWrapper>
  );
};
