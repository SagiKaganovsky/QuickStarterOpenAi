import { useState, useRef, useEffect } from "react";
import styles from "../../assets/styles/chat.module.css";
import Layout from "../../components/Layout";
const Chat = () => {
  const [humanMessages, setHumanMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      message: "How can I help you?",
      time: new Date().getTime(),
    },
  ]);
  const [converrsation, setConversation] = useState([
    {
      role: "system",
      content:
        "You are a highly knowladgable assistant that is always happy to help.",
    },
  ]);

  const inputRef = useRef();
  const chatbotConversationRef = useRef();
  const messages = [...aiMessages, ...humanMessages].sort((a, b) => {
    return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const humanMessage = inputRef.current.value;
    if (humanMessage === "") {
      return;
    }
    try {
      setConversation((prevConvarsation) => {
        return [
          prevConvarsation,
          {
            role: "user",
            content: humanMessage,
          },
        ];
      });
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat: [
            {
              role: "system",
              content:
                "You are a highly knowladgable assistant that is always happy to help.",
            },
            {
              role: "user",
              content: humanMessage,
            },
          ],
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setAiMessages((prevMessages) => {
        return [...prevMessages, data.result.m];
      });

      inputRef.current.value = "";
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (chatbotConversationRef) {
      chatbotConversationRef.current.scrollTop =
        chatbotConversationRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout title={"Chat Bot"}>
      <main className={styles["main-chat"]}>
        <section className={styles["chatbot-container"]}>
          <div className={styles["chatbot-header"]}>
            <img src="images/owl-logo.png" className={styles["logo"]} />
            <h1>KnowItAll</h1>
            <h2>Ask me anything!</h2>
            <p className={styles["supportId"]}>User ID: 2344</p>
          </div>
          <div
            ref={chatbotConversationRef}
            className={styles["chatbot-conversation-container"]}
          >
            {messages.length > 0 &&
              messages.map(({ from, message, time }) => {
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
