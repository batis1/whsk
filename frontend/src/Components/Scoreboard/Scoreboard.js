import React, { useState, useEffect } from "react";
import { Table, Badge, Dropdown, Menu, Button } from "antd";
import { useHistory } from "react-router-dom";
import UserAvatar from "../Avatar/Avatar.js";
import "./Scoreboard.css";
import Loading from "../Loading/Loading";
import axios from "axios";
import apiList from "../../lib/apiList.js";

const Podium = ({ score, place, color }) => {
  return (
    <div className={`podium-${place}`}>
      <Badge.Ribbon
        text={`${place}: ${score.username}`}
        offset={[0, 80]}
        color={color}
      >
        <UserAvatar
          user={{ id: score.userID }}
          size={place === "1st" ? 124 : 96}
        />
      </Badge.Ribbon>
    </div>
  );
};

const Scoreboard = (props) => {
  console.log("scoreboard mounted");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [tableState, setTableState] = useState("loading");
  const history = useHistory();
  const [selectedMode, setSelectedMode] = useState("global");
  useEffect(() => {
    if (!props.user) {
      history.push("/login");
    }
  }, []);

  const urls = {
    global: apiList.score,
    user: `${apiList.score}/${props.user?.id}`,
  };
  const modeText = { global: "Global Scores", user: "Your Scores" };

  useEffect(() => {
    setTableState("loading");
    const url = urls[selectedMode];
    
    (async () => {
      try {
        const { data } = await axios.get(url);
        let processedData;
        
        if (selectedMode === 'global') {
          // For global scores, get highest score per user
          const userHighestScores = data.reduce((acc, score) => {
            if (!acc[score.userID] || acc[score.userID].score < score.score) {
              acc[score.userID] = score;
            }
            return acc;
          }, {});
          
          processedData = Object.values(userHighestScores);
        } else {
          // For personal scores, keep all scores
          processedData = data;
        }

        // Sort by score in descending order
        processedData.sort((a, b) => b.score - a.score);
        
        setLeaderboardData(
          processedData.map((score, index) => ({
            ...score,
            date: new Date(score.date).toLocaleDateString(["ban", "id"]),
            index: index + 1,
            key: score._id,
          }))
        );
        setTableState("loaded");
      } catch (error) {
        console.log("unable to fetch scores from server");
      }
    })();
  }, [selectedMode]);

  const columns = [
    { title: "#", dataIndex: "index", key: "index" },
    {
      title: "User",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];
  const places = ["1st", "2nd", "3rd"];
  const medals = ["#AF9500", "#B4B4B4", "#6A3805"];

  const handleMenuClick = ({ key }) => {
    setSelectedMode(key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="global">Global Scores</Menu.Item>
      <Menu.Item key="user">Your Scores</Menu.Item>
    </Menu>
  );

  return (
    <div className="scoreboard-container">
      <Dropdown
        overlay={menu}
        placement="bottomRight"
        trigger={["click"]}
        arrow
      >
        <Button>{modeText[selectedMode]}</Button>
      </Dropdown>
      {selectedMode === "global" ? (
        <div className="podium">
          {leaderboardData?.slice(0, 3).map((score, index) => {
            const place = places[index];
            return (
              <Podium
                key={place}
                score={score}
                place={places[index]}
                color={medals[index]}
              />
            );
          })}
        </div>
      ) : null}
      <div className="tableScore">
        {tableState === "loaded" ? (
          <Table
            dataSource={leaderboardData}
            columns={columns}
            pagination={false}
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
