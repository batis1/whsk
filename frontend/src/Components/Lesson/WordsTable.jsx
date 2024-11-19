import React, { useContext, useEffect, useState } from "react";
import { Table, Button, Space, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { actions, GlobalContext } from "../../App";
import Loading from "../Loading/Loading";
import useLocalStorage from "use-local-storage";
import { useHistory } from "react-router-dom";
import apiList from "../../lib/apiList";

export const WordsTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState([
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
    {
      Character: "你好",
      Pinyin: "ni hao",
      English: "Hello",
      Sentence: "老师，你好",
    },
  ]);

  const {
    state: { lessonId, user, searchInput },
    dispatch,
  } = useContext(GlobalContext);

  const [userLocal, setUser] = useLocalStorage("user", user);
  const history = useHistory();

  const updateWord = (docs) => {
    let words = docs;

    const updateWords = [];
    for (let index = 0; index < words.length; index++) {
      const wo = words[index];

      if (user.savedWords.includes(wo._id))
        updateWords.push({ ...wo, isSaved: true });
      else {
        updateWords.push({ ...wo });
      }
    }
    // words = words.map(({ words }) =>
    //   user.savedWords.includes(words._id)
    //     ? { ...words, isSaved: true }
    //     : words
    // );
    console.log(updateWords);
    setDataSource(updateWords);
  };

  useEffect(() => {
    (async () => {
      if (!user) {
        history.push("/login");
      }
      setIsLoading(true);
      let apiUrl = "http://localhost:5000/words";
      if (lessonId) {
        apiUrl = `${apiUrl}?lessonId=${lessonId}`;
      } else if (searchInput) {
        apiUrl = `${apiUrl}?query=${searchInput}`;
      } else {
        apiUrl = `${apiUrl}?userId=${user._id || user.id}`;
      }

      const {
        data: { docs },
      } = await axios.get(apiUrl);
      setIsLoading(false);

      // setDataSource(
      //   docs.map(({ character, pinyin }) => ({ Character: character,Pin }))
      // );
      if (user.savedWords) {
        updateWord(docs);

        return;
      }

      setDataSource(docs);
    })();
  }, []);

  const handleSaveWord = async (newWordId) => {
    const newSavedWord = user.savedWords.map((_id) => _id);
    console.log({ newWordId });
    newSavedWord.push(newWordId);

    // update savedWord in the database
    const { data } = await axios.put(`${apiList.user}/${user._id}`, {
      savedWords: newSavedWord,
    });

    // update savedWord in context
    dispatch({
      type: actions.UPDATE_USER,
      payload: { savedWords: newSavedWord },
    });

    // updateWord()
    updateWord(dataSource);
    console.log({ newSavedWord, data });
  };

  const handleDeleteSavedWord = async (wordId) => {
    setIsLoading(true);
    const savedWordAfterD = user.savedWords.filter((_id) => _id !== wordId);
    // newSavedWord.push(wordId);
    const { data } = await axios.put(`http://localhost:5000/user/${user._id}`, {
      savedWords: savedWordAfterD,
    });

    dispatch({
      type: actions.UPDATE_USER,
      payload: { savedWords: savedWordAfterD },
    });
    setDataSource(savedWordAfterD);
    console.log({ savedWordAfterD });

    // window.location.reload(false);
    history.push("/");
    history.push("/lesson");

    setIsLoading(false);
  };

  const columns = [
    {
      title: "Character",
      dataIndex: "character",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        return (
          <>
            <Input
              autoFocus
              placeholder="Type text here"
              value={selectedKeys[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                confirm({ closeDropdown: false });
              }}
              onPressEnter={() => {
                confirm();
              }}
              onBlur={() => {
                confirm();
              }}
            ></Input>
            <Button
              onClick={() => {
                confirm();
              }}
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters();
              }}
              type="danger"
            >
              Reset
            </Button>
          </>
        );
      },
      filterIcon: () => {
        return <SearchOutlined />;
      },
      onFilter: (value, record) => {
        return record.Character.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Pinyin",
      dataIndex: "pinyin",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        return (
          <>
            <Input
              autoFocus
              placeholder="Type text here"
              value={selectedKeys[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                confirm({ closeDropdown: false });
              }}
              onPressEnter={() => {
                confirm();
              }}
              onBlur={() => {
                confirm();
              }}
            ></Input>
            <Button
              onClick={() => {
                confirm();
              }}
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters();
              }}
              type="danger"
            >
              Reset
            </Button>
          </>
        );
      },
      filterIcon: () => {
        return <SearchOutlined />;
      },
      onFilter: (value, record) => {
        return record.Pinyin.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "English Translation",
      dataIndex: "englishTranslation",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        return (
          <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
            <Input
              autoFocus
              placeholder="Type text here"
              value={selectedKeys[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                confirm({ closeDropdown: false });
              }}
              onPressEnter={() => {
                confirm();
              }}
              onBlur={() => {
                confirm();
              }}
            ></Input>
            <Button
              onClick={() => {
                confirm();
              }}
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters();
              }}
              type="danger"
            >
              Reset
            </Button>
          </div>
        );
      },
      filterIcon: () => {
        return <SearchOutlined />;
      },
      onFilter: (value, record) => {
        return record.English.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Sentence",
      dataIndex: "sentence",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        return (
          <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
            <Input
              autoFocus
              placeholder="Type text here"
              value={selectedKeys[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                confirm({ closeDropdown: false });
              }}
              onPressEnter={() => {
                confirm();
              }}
              onBlur={() => {
                confirm();
              }}
            ></Input>
            <Button
              onClick={() => {
                confirm();
              }}
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters();
              }}
              type="danger"
            >
              Reset
            </Button>
          </div>
        );
      },
      filterIcon: () => {
        return <SearchOutlined />;
      },
      onFilter: (value, record) => {
        return record.Sentence.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Action",
      key: "action",
      render: (item) =>
        dataSource.length >= 1 ? (
          lessonId || searchInput ? (
            <button
              className="btn"
              disabled={item.isSaved}
              onClick={() => handleSaveWord(item._id)}
            >
              {item.isSaved ? "saved" : "save"}
            </button>
          ) : (
            <button
              className="btn"
              onClick={() => handleDeleteSavedWord(item._id)}
            >
              delete
            </button>
          )
        ) : null,
    },
  ];
  return isLoading ? (
    <Loading></Loading>
  ) : (
    <div>
      <header>
        <Table
          style={{
            display: "flex",
            flex: 1,
            margin: 10,
            justifyContent: "center",
          }}
          rowClassName={() => "editable-row"}
          columns={columns}
          dataSource={dataSource}
        ></Table>
      </header>
    </div>
  );
};
