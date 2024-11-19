import React, { useState, useEffect } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Avatar.css";
import apiList from "../../lib/apiList";

const UserAvatar = (props) => {
  const [user, setUser] = useState();

  useEffect(() => {
    if (props.user) {
      if (!props.user?.avatar) {
        fetch(`${apiList.user}/${props.user.id}`)
          .then((res) => res.json())
          .then((json) => setUser(json))
          .catch((e) => {
            console.log(e);
          });
      } else {
        setUser(props.user);
      }
    }
  }, []);
  console.log(props.user, { user });
  return (
    <Avatar
      src={user ? user.avatar : null}
      size={props.size || 64}
      icon={<UserOutlined />}
    />
  );
};
export default UserAvatar;
