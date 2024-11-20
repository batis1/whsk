import React, { useRef, useState, useCallback, createRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Header, Grid, Icon, Message, Loader } from "semantic-ui-react";
import { Button } from "antd";
import { MainWrapper } from "./HskOcrSC";
import imageCompression from 'browser-image-compression';
import hsk1Words from './hsk1.json';
import hsk2Words from './hsk2.json';
import hsk3Words from './hsk3.json';

function HskOcr() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  let fileInputRef = createRef();
  const [matchedWords, setMatchedWords] = useState([]);

  const preprocessImage = async (imageData) => {
    try {
      const fetchResponse = await fetch(imageData);
      const blob = await fetchResponse.blob();
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.9,
      };

      const compressedFile = await imageCompression(blob, options);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  };

  const findHSKMatches = (text) => {
    const matches = [];
    
    // Create a single array of all words with their HSK level
    const allHskWords = [
      ...hsk1Words.words.map(word => ({ ...word, level: 1, color: '#FF9999' })),
      ...hsk2Words.words.map(word => ({ ...word, level: 2, color: '#99FF99' })),
      ...hsk3Words.words.map(word => ({ ...word, level: 3, color: '#9999FF' }))
    ];

    // Sort by length (longest first) to match longer words before shorter ones
    allHskWords.sort((a, b) => b.hanzi.length - a.hanzi.length);

    let remainingText = text;
    while (remainingText.length > 0) {
      let matched = false;
      
      for (const word of allHskWords) {
        if (remainingText.startsWith(word.hanzi)) {
          matches.push(word);
          remainingText = remainingText.slice(word.hanzi.length);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Skip one character if no match found
        remainingText = remainingText.slice(1);
      }
    }

    return matches;
  };

  const capture = useCallback(async () => {
    try {
      setLoad(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      const processedImage = await preprocessImage(imageSrc);
      
      const response = await axios.post(
        "http://localhost:5000/ocr/capture",
        { img: processedImage },
        { headers: { "Content-Type": "application/json" } }
      );

      const matches = findHSKMatches(response.data.text);
      setMatchedWords(matches);
      setTextOcr(response.data.text);
      setImgSrc(imageSrc);
      setLoad(false);
    } catch (err) {
      console.error('Capture error:', err);
      setLoad(false);
    }
  }, [webcamRef]);

  const upload = async (file) => {
    try {
      setLoad(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5000/ocr/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const matches = findHSKMatches(response.data.text);
      setMatchedWords(matches);
      setTextOcr(response.data.text);
      setImgSrc(response.data.image);
      setLoad(false);
    } catch (error) {
      console.error('Upload error:', error);
      setLoad(false);
    }
  };

  return (
    <MainWrapper>
      <center>
        {/* <Header style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "roboto" }} size="huge">
          HSK OCR
        </Header> */}
      </center>
      <Grid divided>
        <div className="divider">
          <Grid.Column style={{ width: "80%" }} key={0}>
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="react-webcam"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div className="button-group">
                <Button
                  size="small"
                  onClick={capture}
                  icon
                  labelPosition="left"
                  inverted
                  color="green"
                  className="btn homebtn white"
                >
                  <Icon name="camera" />
                  Capture
                </Button>

                <Button
                  size="big"
                  onClick={() => fileInputRef.current.click()}
                  icon
                  labelPosition="left"
                  inverted
                  color="blue"
                  className="btn homebtn white"
                >
                  <Icon name="upload" />
                  Upload
                  <form encType="multipart/form-data">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      name="filename"
                      onChange={(x) => {
                        upload(x.target.files[0]);
                      }}
                      accept="image/*"
                    />
                  </form>
                </Button>
              </div>
            </div>
          </Grid.Column>

          <Grid.Column style={{ width: "80%" }} key={1}>
            <div className="result-container">
              {load ? (
                <Loader style={{ marginTop: 120 }} active inline="centered" size="big">
                  Loading...
                </Loader>
              ) : imgSrc ? (
                <>
                  <Header style={{ margin: 10, fontFamily: "roboto" }} size="large">
                    Result
                  </Header>
                  <img style={{ width: "100%", height: "auto" }} alt="captured" src={imgSrc} />
                  <Message
                    size="massive"
                    color="orange"
                    content={
                      <div>
                        <div>{textOcr}</div>
                        <div style={{ marginTop: '1rem' }}>
                          {matchedWords.map((word, index) => (
                            <span key={index} style={{ 
                              backgroundColor: word.color,
                              padding: '0.2rem 0.4rem',
                              margin: '0.2rem',
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}>
                              {word.hanzi} ({word.pinyin}) - {word.english} (HSK{word.level})
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                    style={{ margin: 15 }}
                  />
                </>
              ) : (
                <Header
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "10rem",
                    fontFamily: "roboto",
                  }}
                  size="large"
                >
                  No data preview
                </Header>
              )}
            </div>
          </Grid.Column>
        </div>
      </Grid>
    </MainWrapper>
  );
}

export default HskOcr;