import { useState, useRef, useEffect } from "react";
import Typewriter from "typewriter-effect";
import styles from "../../assets/styles/chat.module.css";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";

const Chat = () => {
  const initAI = {
    role: "assistant",
    // content: "Assistant that is always friendly, funny and professional to help.",
    // content: "You are assistant that gives very short answers",
    content: "You are helpful assistant",
    time: new Date().getTime(),
  };
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollHeight, setScollHeight] = useState(0);
  const inputRef = useRef();
  const chatbotConversationRef = useRef(null);
  const chatbotConversationContainerRef = useRef(null);
  // const messages = conversation;
  // .sort((a, b) => {
  //   return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
  // });

  const handleFetch = async (message) => {
    setIsLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat: message ? [...conversation, message] : conversation,
      }),
    });
    setIsLoading(false);
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    inputRef.current.value = "";
    if (message === "") {
      return;
    }
    try {
      const userContent = {
        role: "user",
        content: message,
        time: new Date().getTime(),
      };

      setConversation((prevConvarsation) => {
        return [...prevConvarsation, userContent];
      });

      const response = await handleFetch(userContent);
      const data = await response.json();

      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setConversation((prevConvarsation) => {
        return [
          ...prevConvarsation,
          {
            role: "assistant",
            content: data.result.message,
            time: new Date().getTime(),
          },
        ];
      });
      inputRef.current.value = "";
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  };

  const handleInit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/init", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      const messages = Object.values(data.result);

      if (messages.length > 0) {
        setConversation(messages);
      } else {
        const response = await handleFetch(initAI);
        const data = await response.json();
        if (response.status !== 200) {
          throw (
            data.error ||
            new Error(`Request failed with status ${response.status}`)
          );
        }
        setConversation((prevConvarsation) => {
          return [
            ...prevConvarsation,
            {
              role: "assistant",
              content: data.result.message,
              time: new Date().getTime(),
            },
          ];
        });
      }
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
    setIsLoading(false);
  };

  const handleClear = async () => {
    try {
      const response = await fetch("/api/chat/clear", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setConversation([]);
      handleInit();
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    handleInit();
  }, []);

  useEffect(() => {
    console.log("init");
    if (chatbotConversationRef.current?.scrollHeight) {
      chatbotConversationContainerRef.current.scrollTop =
        chatbotConversationContainerRef.current.scrollHeight +
        chatbotConversationRef.current.scrollHeight +
        10;
    } else {
      chatbotConversationContainerRef.current.scrollTop =
        chatbotConversationContainerRef.current.scrollHeight + 20;
    }
  }, [scrollHeight, conversation]);

  return (
    <Layout title={"Chat Bot"}>
      <main className={styles["main-chat"]}>
        <section className={styles["chatbot-container"]}>
          <div className={styles["chatbot-header"]}>
            <img src="images/owl-logo.png" className={styles["logo"]} />
            <h1>KnowItAll</h1>
            <h2 className={styles["subtitle"]}>Ask me anything!</h2>
            <p className={styles["supportId"]}>User ID: 2344</p>
            <button className={styles["clear-btn"]} onClick={handleClear}>
              clear
            </button>
          </div>
          <div
            ref={chatbotConversationContainerRef}
            className={styles["chatbot-conversation-container"]}
          >
            {conversation.length === 0 ? (
              <Loader className={styles["filter-green"]} />
            ) : (
              conversation.map(({ role, content: message, time }, i) => {
                const key = `Id${role}${time}`;
                if (isLoading && i === conversation.length - 1) {
                  return (
                    <>
                      <div
                        key={key}
                        className={`${styles["speech"]} ${
                          styles[role === "user" ? "speech-human" : "speech-ai"]
                        }`}
                      >
                        {message}
                      </div>
                      <Loader key={key} className={styles["filter-green"]} />
                    </>
                  );
                }
                if (!isLoading && i === conversation.length - 1) {
                  return (
                    <div
                      ref={chatbotConversationRef}
                      key={key}
                      className={`${styles["speech"]} ${
                        styles[role === "user" ? "speech-human" : "speech-ai"]
                      }`}
                    >
                      <Typewriter
                        options={{
                          delay: 10,
                          // cursor: "",
                          // cursorClassName: styles["blinking-cursor"],
                        }}
                        onInit={(typewriter) => {
                          message.split(/[\s,]+/).map((word) => {
                            typewriter
                              .typeString(`${word} `)
                              .callFunction(() => {
                                if (
                                  chatbotConversationRef &&
                                  chatbotConversationRef.current &&
                                  chatbotConversationRef.current.scrollHeight
                                ) {
                                  setScollHeight(
                                    chatbotConversationRef.current.scrollHeight
                                  );
                                }
                              })
                              .start();
                          });
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={`Id${time}`}
                    className={`${styles["speech"]} ${
                      styles[role === "user" ? "speech-human" : "speech-ai"]
                    }`}
                  >
                    {message}
                  </div>
                );
              })
            )}
          </div>
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles["chatbot-input-container"]}
          >
            <input
              name="user-input"
              ref={inputRef}
              type="text"
              id="user-input"
              required
            />
            <button id="submit-btn" className={styles["submit-btn"]}>
              <img
                src="images/chat-send-btn-icon.png"
                className={styles["send-btn-icon"]}
              />
            </button>
          </form>
        </section>
      </main>
    </Layout>
  );
};

export default Chat;
