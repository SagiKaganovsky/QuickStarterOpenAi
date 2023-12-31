import conversationDb from "../../../firebase";
import { get } from "firebase/database";
export default async function (req, res) {
  try {
    const snapshot = await get(conversationDb);
    if (snapshot.exists()) {
      res.status(200).json({ result: snapshot });
    } else {
      res.status(200).json({ result: [] });
      return;
    }
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
