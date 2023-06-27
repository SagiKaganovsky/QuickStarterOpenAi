import conversationDb from "../../../firebase";
import { push } from "firebase/database";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const conversation = req.body.chat;
  if (conversation.length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a converrsation",
      },
    });
    return;
  }

  try {
    push(conversationDb, {
      ...conversation[conversation.length - 1],
    });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversation.map(({ time, ...rest }) => rest),
      presence_penalty: 0,
      frequency_penalty: 0.3,
    });

    push(conversationDb, {
      role: "assistant",
      content: completion.data.choices[0].message.content,
      time: new Date().getTime(),
    });

    res.status(200).json({
      result: {
        message: completion.data.choices[0].message.content,
      },
    });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
