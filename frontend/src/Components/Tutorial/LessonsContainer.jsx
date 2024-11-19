import React from "react";
import { Lesson } from "./Lesson";

export const LessonsContainer = ({ lessons }) => {
  console.log({ lessons });
  return (
    <div className="lessons-row-container">
      {lessons.map((lesson) => (
        <Lesson lesson={lesson} />
      ))}
    </div>
  );
};
