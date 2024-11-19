import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import apiList from "../../lib/apiList";
import { LessonsContainer } from "./LessonsContainer";
import { GlobalContext } from "../../App";

export const SkillTree = () => {
  const { state } = useContext(GlobalContext);
  const lessonsContainerV2 = [
    [{ title: "Basics 1", iconStyle: "bscs1" }],
    [
      { title: "Greetings", iconStyle: "grtngs" },
      { title: "Basics 2", iconStyle: "bscs2" },
    ],
  ];

  const [lessonsContainer, setLessonsContainer] = useState([]);

  useEffect(() => {
    (async () => {
      const {
        data: { docs },
      } = await axios.get(`${apiList.lessons}?hskLevel=${state.user.hskLevel}`);

      const newLessons = [];
      const limit = [1, 2, 3];

      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        newLessons.push([element]);
      }
      console.log(newLessons);
      setLessonsContainer(newLessons);
      // console.log(docs);
    })();
  }, [state.user.hskLevel]);

  return (
    <div className="skill-tree">
      {lessonsContainer.map((item) => (
        <LessonsContainer lessons={item} />
      ))}
    </div>
  );
};
