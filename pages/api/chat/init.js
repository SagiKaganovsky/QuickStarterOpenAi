import conversationDb  from "../../../firebase";
import { get } from "firebase/database";
export default async function (req, res) {
  const snapshot = await get(conversationDb);
  if (snapshot.exists()) {
    res.status(200).json({ result: snapshot });
  } else {
    res.status(400).json({
      error: {
        message: "No snapshot exist",
      },
    });
    return;
  }
}
