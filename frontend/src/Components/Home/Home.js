import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import clocklogo from "../../Images/clocklogo.svg";
import ProfilePicture from "../../Images/ProfilePicture.jpg";
import imageex from "../../Images/imageex.svg";
// import hero from "../../images/hero.svg";
import hero from "../../Images/HomeHsk1.png";
// import { ButtonOptions } from "../ButtonOptions/ButtonOptions";
import { Switch } from "antd";
import { GlobalContext } from "../../App";
import { ButtonOptions } from "../ButtonOptions/ButtonOptions";

const Home = (props) => {
  const history = useHistory();

  const switchTheme = () => {
    const newTheme = props.theme === "light" ? "dark" : "light";
    props.setTheme(newTheme);
    // props.setIsThemeChange(true);
  };

  const { s } = useContext(GlobalContext);

  return (
    <>
      <div className="Home">
        {/* <div className="theme-toggle">
          <Switch
            defaultChecked
            onChange={switchTheme}
            style={{ background: "#e67329" }}
          />
        </div> */}
        
        <div className="main-content">
          <div className="hometitle-container">
            <h1 className="hometitle">Are you planning to take Chinese HSK test?</h1>
            <p className="homesubtitle">
              Begin your preparation by following the tutorial, and then put
              your knowledge to the test by playing the game.
            </p>
          </div>

          <div className="home-buttonsContainer">
            {!props.user ? (
              <div className="buttoncontainer1">
                <button
                  onClick={() => history.push("/signup")}
                  className="btn homebtn getstarted"
                >
                  GET STARTED
                </button>
                <button
                  onClick={() => history.push("/Howtoplay")}
                  className="btn homebtn white"
                >
                  HELP
                </button>
              </div>
            ) : (
              <ButtonOptions />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
