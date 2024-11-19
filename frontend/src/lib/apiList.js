export const server = "http://localhost:5000";

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
