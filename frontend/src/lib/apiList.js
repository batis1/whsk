export const server = "http://localhost:5000";
// export const server = "https://selected-shirley-batis-9851f042.koyeb.app";

const apiList = {
  signup: `${server}/user/signup`,
  login: `${server}/user/login`,
  user: `${server}/user`,
  score: `${server}/score`,
  questions: `${server}/questions`,
  words: `${server}/words`,
  lessons: `${server}/lessons`,
  // upload: `${server}/upload`,
  upload: `${server}/user/uploadProfileImage`,
  tutor: `${server}/tutors`,
};

export default apiList;
