import conversationDb from "../../../firebase";
import { remove } from "firebase/database";
export default async function (req, res) {
  try {
    await remove(conversationDb);
    res.status(200).json({ result: [] });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
