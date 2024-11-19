// client
// src/lib/track-service.js

import axios from "axios";

class Track {
  constructor() {
    this.track = axios.create({
      baseURL: "http://localhost:5000/track",
      withCredentials: true,
    });
  }

  getUrl(file) {
    return this.track
      .post("/upload/url", file, { "Content-Type": "multipart/form-data" })
      .then(({ data }) => data); // response.data
  }
}

const trackService = new Track();
// `trackService` is the object with the above axios request methods

export default trackService;
