import React, { useState, useEffect, useContext } from "react";
// import "antd/dist/antd.css";
import "antd/dist/reset.css";
import { Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { Form, Input, Space, Button } from "antd";
import { useHistory } from "react-router-dom";
import { actions, GlobalContext } from "../../App";
import {
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "../Signup/Signup.css";
import { FormProvider } from "antd/lib/form/context";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import apiList from "../../lib/apiList";
import AppUpload from "../Avatar/AppUpload";

const BecomeTutor = () => {
  const [formStatus, setFormStatus] = useState("idle");
  const [avatarImg, setAvatarImg] = useState();
  const buttonValues = {
    idle: {
      text: "Become A tutor",
      loading: false,
      icon: <PlusCircleOutlined />,
    },
    loading: { text: "Updating Account", loading: true, icon: null },
    success: {
      text: "Waiting for the Admin",
      loading: false,
      icon: <CheckCircleOutlined />,
    },
    failed: {
      text: "Failed to become a tutor",
      loading: false,
      icon: <CloseCircleOutlined />,
    },
  };
  const [fileList, setFileList] = useState([
    {
      uid: "-1",
      name: "image.png",
      status: "done",
      url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
  ]);

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };
  const {
    state: { user },
    dispatch,
  } = useContext(GlobalContext);

  const [userInfo, setUserInfo] = useState({});

  const history = useHistory();

  console.log({ user });

  const handleUpdate = async () => {
    try {
      const { data } = await axios.post(`${apiList.tutor}`, {
        ...userInfo,
        status: "applied",
        userId: user._id,
      });

      history.push("/tutor");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user) {
      history.push("/login");
    }
  }, []);

  return (
    <div>
      <h1 className="text-center"> Become a Tutor</h1>

      <div className="signup-container">
        <Form name="signup" layout="vertical" size="large">
          <Form.Item
            label="HSK Level"
            name="HSK"
            rules={[{ required: true, message: "Please input HSk Level." }]}
          >
            <Input
              className="form-input"
              placeholder="Enter a HSk Level"
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  hskLevel: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Educational background"
            name="Educational"
            rules={[
              {
                required: true,
                message: "A valid Info is required to become a tutor.",
              },
            ]}
          >
            <Input
              className="form-input"
              placeholder="Enter your Educational background"
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  educationalBackground: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Teaching period"
            name="duration"
            rules={[
              {
                required: true,
                message: "A valid Info is required to become a tutor.",
              },
            ]}
          >
            <Input
              className="form-input"
              placeholder="Enter your teaching duration "
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  teachingPeriod: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Teaching time"
            rules={[
              {
                required: true,
                message: "A valid Info is required to become a tutor.",
              },
            ]}
          >
            <Input
              className="form-input"
              placeholder="Enter your teaching time"
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  teachingTime: e.target.value,
                }))
              }
              value={userInfo.teachingTime}
            />
          </Form.Item>
          <Form.Item
            label="More Info"
            name="more"
            rules={[
              {
                required: true,
                message: "A valid Info is required to become a tutor.",
              },
            ]}
          >
            <Input
              className="form-input"
              placeholder="Enter more Info .."
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  moreInfo: e.target.value,
                }))
              }
              //   value={user.email}
            />
          </Form.Item>
          <Form.Item
            label="Zoom's room ID"
            name="zoom"
            rules={[
              {
                required: true,
                message: "A valid Info is required to become a tutor.",
              },
            ]}
          >
            <Input
              // defaultValue={user.email}
              className="form-input"
              placeholder="Enter your zoom's meeting room ID"
              onChange={(e) =>
                setUserInfo((oldUserInfo) => ({
                  ...oldUserInfo,
                  zoomRoomID: e.target.value,
                }))
              }
              //   value={user.email}
            />
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            // loading={buttonValues[formStatus].loading}
            icon={buttonValues[formStatus].icon}
            className="btn btn-primary"
            onClick={handleUpdate}
          >
            {buttonValues[formStatus].text}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default BecomeTutor;
