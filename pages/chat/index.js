import { useState, useRef, useEffect } from "react";
import Typewriter from "typewriter-effect";
import styles from "../../assets/styles/chat.module.css";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";

const Chat = () => {
  const [humanMessages, setHumanMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      // content: "Assistant that is always friendly, funny and professional to help.",
      content: "You are assistant that gives very short answers",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollHeight, setScollHeight] = useState(0);
  const inputRef = useRef();
  const chatbotConversationRef = useRef(null);
  const chatbotConversationContainerRef = useRef(null);
  const messages = [...aiMessages, ...humanMessages].sort((a, b) => {
    return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
  });

  const handleFetch = async (userInput) => {
    setIsLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat: userInput ? [...conversation, userInput] : conversation,
      }),
    });
    setIsLoading(false);
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const humanMessage = inputRef.current.value;
    if (humanMessage === "") {
      return;
    }
    try {
      setHumanMessages((prevMessages) => {
        return [
          ...prevMessages,
          {
            from: "human",
            message: humanMessage,
            time: new Date().getTime(),
          },
        ];
      });

      const response = await handleFetch({
        role: "user",
        content: humanMessage,
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setAiMessages((prevMessages) => {
        return [...prevMessages, data.result];
      });

      setConversation((prevConvarsation) => {
        return [
          ...prevConvarsation,
          {
            role: "user",
            content: humanMessage,
          },
          {
            role: "assistant",
            content: data.result.message,
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

  const handleInitAi = async () => {
    try {
      const response = await handleFetch(null);
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setAiMessages((prevMessages) => {
        return [...prevMessages, data.result];
      });

      setConversation((prevConvarsation) => {
        return [
          ...prevConvarsation,
          {
            role: "assistant",
            content: data.result.message,
          },
        ];
      });
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    handleInitAi();
    chatbotConversationContainerRef.current.scrollTop =
      chatbotConversationContainerRef.current.scrollTop + 50;
  }, []);

  useEffect(() => {
    console.log(chatbotConversationRef.current?.scrollHeight);
    console.log(chatbotConversationContainerRef.current?.scrollTop);
    if (chatbotConversationRef.current?.scrollHeight) {
      chatbotConversationContainerRef.current.scrollTop =
        chatbotConversationContainerRef.current.scrollTop +
        chatbotConversationRef.current.scrollHeight +
        10;
    }
  }, [scrollHeight]);

  return (
    <Layout title={"Chat Bot"}>
      <main className={styles["main-chat"]}>
        <section className={styles["chatbot-container"]}>
          <div className={styles["chatbot-header"]}>
            <img src="images/owl-logo.png" className={styles["logo"]} />
            <h1>KnowItAll</h1>
            <h2 className={styles["subtitle"]}>Ask me anything!</h2>
            <p className={styles["supportId"]}>User ID: 2344</p>
            <button className={styles["clear-btn"]}>clear</button>
          </div>
          <div
            ref={chatbotConversationContainerRef}
            className={styles["chatbot-conversation-container"]}
          >
            {messages.length > 0 &&
              messages.map(({ from, message, time }, i) => {
                if (!isLoading && i === messages.length - 1) {
                  return (
                    <div
                      ref={chatbotConversationRef}
                      key={`Id${time}`}
                      className={`${styles["speech"]} ${
                        styles[from === "human" ? "speech-human" : "speech-ai"]
                      }`}
                    >
                      <Typewriter
                        options={{ delay: 10 }}
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
                if (isLoading && i === messages.length - 1) {
                  return (
                    <Loader
                      key={`${message}Id${time}`}
                      className={styles["filter-green"]}
                    />
                  );
                }
                return (
                  <div
                    key={`${message}Id${time}`}
                    className={`${styles["speech"]} ${
                      styles[from === "human" ? "speech-human" : "speech-ai"]
                    }`}
                  >
                    {message}
                  </div>
                );
              })}
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
