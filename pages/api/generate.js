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

  const movieIdea = req.body.movieIdea || "";
  if (movieIdea.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a movie",
      },
    });
    return;
  }

  try {
    const movieScriptComplition = {
      model: "text-davinci-003",
      prompt: generateMoviePrompt(movieIdea),
      temperature: 0.7,
      max_tokens: 700,
    };
    const movieCompletion = await openai.createCompletion(
      movieScriptComplition
    );

    const synopsis = movieCompletion.data.choices[0].text.trim();
    const movieTitleComplition = {
      model: "text-davinci-003",
      prompt: generateMovieTitlePrompt(synopsis),
      max_tokens: 35,
      temperature: 0.8,
    };

    const movieTitleCompletion = await openai.createCompletion(
      movieTitleComplition
    );

    const movieStarsCompletion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generateMovieStars(synopsis),
      max_tokens: 30,
    });

    const title = movieTitleCompletion.data.choices[0].text.trim();
    const movieImageCompletion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generateImagePrompt(title, synopsis),
      temperature: 0.8,
      max_tokens: 100,
    });
    // console.log(movieCompletion.data.choices);
    // res.status(200).json({ result: completion.data.choices[0].text, image:response.data.data[0].url });
    // res.status(200).json({ result: "result", image: "some image url" });
    const movieImagePrompt = movieImageCompletion.data.choices[0].text.trim();
    const movieImage = await openai.createImage({
      prompt: movieImagePrompt,
      n: 1,
      size: "256x256",
      response_format: "url",
    });

    res.status(200).json({
      result: synopsis,
      title: title,
      image: movieImage.data.data[0].url,
      stars: movieStarsCompletion.data.choices[0].text.trim(),
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

function generateMoviePrompt(idea) {
  return `Generate an engagning, professional and marketable movie synopsis based on an outline
   ###
   outline: A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire.
   synopsis: In the year 12,067 E.I. (Era Imperial), the prodigy Gaal Dornick (Lou Llobell) travels from her academically-repressive homeworld of Synnax to Trantor,
   capital of the Galactic Empire, to study under the famed Hari Seldon (Jared Harris), the creator of the predictive mathematical subfield of psychohistory,
   as a reward for solving a complex conjecture. They are both arrested on charges of treason; Seldon because his model predicts the imminent 
   collapse of the Empire due in part to the stagnation caused by four centuries of rule by clones of Emperor Cleon I,
   and Dornick because the Empire wants her to discredit psychohistory. Dornick instead confirms Seldon's model during his trial and condemns them both,
   but they are spared by Brother Day (Lee Pace) (Emperor Cleon XII) after the Starbridge, Trantor's space elevator, 
   is destroyed by apparent terrorists from the feuding Periphery kingdoms of Anacreon and Thespis. 
   Brother Day (Lee Pace) exiles Seldon and Dornick to the Periphery world of Terminus, where they are to build the "Foundation",
   a repository of human knowledge that Seldon claims will shorten the dark age after the Empire's demise from thirty thousand years to a single millennium.
   ###
   outline: ${idea}
   synopsis:`;
}

const generateMovieTitlePrompt = (synopsis) => {
  return `Generate a catchy movie title for this synopsis: ${synopsis}`;
};

const generateMovieStars = (synopsis) => {
  return `Extract the names in brackets from the synopsis
  ### 
  synopsis: In the year 12,067 E.I. (Era Imperial), the prodigy Gaal Dornick (Lou Llobell) travels from her academically-repressive homeworld of Synnax to Trantor,
  capital of the Galactic Empire, to study under the famed Hari Seldon (Jared Harris), the creator of the predictive mathematical subfield of psychohistory,
  as a reward for solving a complex conjecture. They are both arrested on charges of treason; Seldon because his model predicts the imminent 
  collapse of the Empire due in part to the stagnation caused by four centuries of rule by clones of Emperor Cleon I,
  and Dornick because the Empire wants her to discredit psychohistory. Dornick instead confirms Seldon's model during his trial and condemns them both,
  but they are spared by Brother Day (Lee Pace) (Emperor Cleon XII) after the Starbridge, Trantor's space elevator, 
  is destroyed by apparent terrorists from the feuding Periphery kingdoms of Anacreon and Thespis. 
  Brother Day (Lee Pace) exiles Seldon and Dornick to the Periphery world of Terminus, where they are to build the "Foundation",
  a repository of human knowledge that Seldon claims will shorten the dark age after the Empire's demise from thirty thousand years to a single millennium.
  names: Era Imperial, Lou Llobell, Jared Harris, Lee Pace.
  ###
  synopsis: ${synopsis}
  names:`;
};

const generateImagePrompt = (title, synopsis) => {
  return `Give a short description of an image that could be used to advertise a movie based on a title and synopsis. 
  The description should be rich in visual details but contain no names.
  ###
  title: Love's Time Warp
  synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. 
  As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). 
  With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. 
  But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
  image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, 
  two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
  title: zero Earth
  synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), 
  an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, 
  a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, 
  he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, 
  Kob must find a way to defeat the alien lord and save the planet.
  image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
  title: Animal Revolution
  synopsis: In a world gone mad, Dr. Victor Drazen (Daniel Craig) has invented a machine that can control the minds of all humans. 
  With the fate of humanity at stake, an unlikely group of intelligent animals must take on the challenge of stopping Drazen and his evil plan. 
  Led by Golden Retriever Max (Chris Pratt) and his best friend, the wise-cracking squirrel Scooter (Will Arnett), 
  they enlist the help of a street-smart raccoon named Rocky (Anna Kendrick) and a brave hawk named Talon (Zoe Saldana). 
  Together, they must find a way to stop Drazen before he can enslave humanity.
  image description:  A group of animals, led by a golden retriever, standing in a defensive line in a dark alley. 
  The animals are silhouetted against a backdrop of a towering city skyline, with a full moon in the sky above them. 
  Sparks are flying from the claws of the hawk in the center of the group, and the raccoon is brandishing a makeshift weapon.
  ###
  title: ${title}
  synopsis: ${synopsis}
  image description:`;
};
