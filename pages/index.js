import { useState } from "react";
import styles from "../assets/styles/index.module.css";
import Loader from "../components/Loader";
import Layout from "../components/Layout";
export default function Home() {
  const [movieIdea, setMovieIdea] = useState("");
  const [result, setResult] = useState();
  const [title, setTitle] = useState();
  const [imageSrc, setImageSrc] = useState();
  const [movieStars, setMovieStars] = useState();
  const [loading, setLoader] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoader(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieIdea: movieIdea }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      setTitle(data.title);
      setImageSrc(data.image);
      setMovieStars(data.stars);
      setMovieIdea("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
    setLoader(false);
  }

  return (
    <Layout title={"Movie Pitch"}>
      <header>
        <img src="./images/logo-movie.png" alt="MoviePitch" />
        <a href="/">
          <span>Movie</span>Pitch
        </a>
      </header>
      <main>
        <section id="setup-container">
          <div className={styles["setup-inner"]}>
            <img src="/images/movieboss.png" />
            <div className={styles["speech-bubble-ai"]} id="speech-bubble-ai">
              {loading ? (
                <p>
                  Ok, just wait a second while my digital brain digests that...
                </p>
              ) : (
                <p>
                  Give me a one-sentence concept and I'll give you an
                  eye-catching title, a synopsis the studios will love, a movie
                  poster... AND choose the cast!
                </p>
              )}
            </div>
          </div>
          <form onSubmit={onSubmit}>
            <div
              className={`${styles["setup-inner"]} ${styles["setup-input-container"]}`}
              id="setup-input-container"
            >
              {loading ? (
                <Loader />
              ) : (
                <>
                  <textarea
                    id="setup-textarea"
                    placeholder="An evil genius wants to take over the world using AI."
                    onChange={(e) => setMovieIdea(e.target.value)}
                  ></textarea>
                  <button
                    type="submit"
                    className={styles["send-btn"]}
                    id="send-btn"
                    aria-label="send"
                  >
                    <img src="images/send-btn-icon.png" alt="send" />
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
        {result && title && imageSrc && movieStars && (
          <section className={styles["output-container"]} id="output-container">
            <div
              id="output-img-container"
              className={styles["output-img-container"]}
            >
              <img src={imageSrc} alt={title} />
            </div>
            <h1 id="output-title">{title}</h1>
            <h2 id="output-stars">{movieStars}</h2>
            <p id="output-text">{result}</p>
          </section>
        )}
      </main>
    </Layout>
  );
}
