import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaDice, FaLink } from "react-icons/fa";

const imageArray = [
  "/hangman/0.svg",
  "/hangman/1.svg",
  "/hangman/2.svg",
  "/hangman/3.svg",
  "/hangman/4.svg",
  "/hangman/5.svg",
  "/hangman/6.svg",
];

const getImage = (guesses: number) => {
  return (imageArray[guesses] || imageArray.at(-1)) ?? "";
};

const Hangman: NextPage = () => {
  const [word, setWord] = useState("");
  const [letters, setLetters] = useState([] as string[]);
  const [guesses, setGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [active, setActive] = useState(false);
  const [validWord, setValidWord] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copied2, setCopied2] = useState(false);

  const router = useRouter();
  const { w, l } = router.query;

  const encodeString = (str: string) => {
    return str
      .split("")
      .map((val) => val.charCodeAt(0).toString(16))
      .join("");
  };

  const decodeString = (str: string) => {
    let dec = "";
    for (let i = 0; i < str.length; i += 2) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      dec += String.fromCharCode(parseInt(`${str[i]}${str[i + 1]}`, 16));
    }
    return dec;
  };

  const checkWord = useCallback(
    (w: string) => {
      if (!w) {
        return false;
      } else if (w.length < 3) {
        return false;
      } else if (!word.match(/^[a-zA-Z ]+$/)) {
        return false;
      } else {
        return true;
      }
    },
    [word]
  );

  useEffect(() => {
    if (w && typeof w === "string") {
      const decoded = decodeString(w);
      setLetters([]);
      setGuesses(0);
      setGameOver(false);
      setActive(true);
      setWord(decoded);
    }
  }, [w]);

  useEffect(() => {
    if (l && typeof l === "string") {
      const ls = l.split("");
      setLetters(ls);
      const guesses = ls.filter(
        (letter) => letter !== " " && !word.includes(letter)
      ).length;
      setGuesses(guesses);
    }
  }, [l, word]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  useEffect(() => {
    if (copied2) {
      setTimeout(() => {
        setCopied2(false);
      }, 2000);
    }
  }, [copied2]);

  // get a random word
  const getRandomWord = async () => {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1"
    );
    const data = (await response.json()) as string[];
    setWord(data[0] ?? "");
  };

  useEffect(() => {
    setValidWord(checkWord(word));
  }, [word, checkWord]);

  useEffect(() => {
    if (guesses >= 6) {
      setGameOver(true);
    } else if (
      word
        .split("")
        .every((letter) => letters.includes(letter) || letter === " ")
    ) {
      setGameOver(true);
    }
  }, [guesses, letters, word]);

  return (
    <>
      <Head>
        <title>Hangman</title>
        <meta name="description" content="A simple hangman game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center py-2">
        <h1 className="text-5xl">Hangman</h1>
        {active ? (
          <>
            <p className="pt-4 text-2xl">Guess the word</p>
            <p className="py-4 font-mono text-4xl">
              {word.split("").map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className={
                    letter === " "
                      ? "text-gray-600"
                      : letters.includes(letter)
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {letter === " "
                    ? "/"
                    : !letters.includes(letter)
                    ? "_"
                    : letter}{" "}
                </span>
              ))}
            </p>
            <div className="flex flex-col items-center sm:flex-row">
              <div className="flex flex-wrap gap-4 font-mono">
                {Array.from({ length: 26 }, (_, i) =>
                  String.fromCharCode(i + 97)
                ).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => {
                      setLetters((prev) => {
                        if (prev.includes(letter)) {
                          return prev;
                        }
                        return [...prev, letter];
                      });
                      const lettersChanged = !letters.includes(letter);
                      if (lettersChanged) {
                        setGuesses((prev) => {
                          if (word.includes(letter)) {
                            return prev;
                          }
                          return prev + 1;
                        });
                      }
                      setGameOver((prev) => {
                        if (prev) {
                          return prev;
                        }
                        return word
                          .split("")
                          .every(
                            (letter) =>
                              letters.includes(letter) || letter === " "
                          );
                      });
                    }}
                    className={`rounded-md bg-blue-600 p-4 text-4xl text-white ${
                      letters.includes(letter) ? "opacity-50" : ""
                    }`}
                    disabled={letters.includes(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImage(guesses)}
                alt="Hangman"
                className="max-w-96 w-1/2"
              />
            </div>
            <p>
              <button
                onClick={() => {
                  setLetters([]);
                  setGuesses(0);
                  setGameOver(false);
                }}
              >
                Reset Guesses
              </button>
            </p>
            <p>
              <button
                onClick={() => {
                  setWord("");
                  setLetters([]);
                  setGuesses(0);
                  setGameOver(false);
                  setActive(false);
                  router.push("/").catch((e) => console.log(e));
                }}
              >
                Reset Game
              </button>
            </p>
            <p className="mt-4">
              <button
                onClick={() => {
                  const link = `${window.location.origin}?w=${encodeString(
                    word
                  )}&l=${letters.length > 0 ? letters.join("") : ""}`;
                  navigator.clipboard
                    .writeText(link)
                    .catch((err) => console.log(err));
                  setCopied(true);
                }}
                className={`flex flex-row items-center gap-4 bg-blue-600 p-4 text-white ${
                  copied ? "opacity-50" : ""
                }`}
                disabled={copied}
              >
                <FaLink className="text-2xl" />
                <p className="text-lg">{copied ? "Copied" : "Share"}</p>
              </button>
            </p>
            {gameOver && (
              <div className="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
                <div className="rounded-md bg-white p-8">
                  <h2 className="text-4xl">
                    {guesses < 6 ? "You Win!" : "You Lose!"}
                  </h2>
                  <p className="pt-4 text-2xl">
                    The word was{" "}
                    <a
                      href={`https://www.dictionary.com/browse/${word}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-4xl text-blue-600 underline"
                    >
                      {word}
                    </a>
                  </p>
                  <p className="flex flex-col items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        setWord("");
                        setLetters([]);
                        setGuesses(0);
                        setGameOver(false);
                        setActive(false);
                        router.push("/").catch((e) => console.log(e));
                      }}
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => {
                        const link = `${
                          window.location.origin
                        }?w=${encodeString(word)}`;
                        navigator.clipboard
                          .writeText(link)
                          .catch((err) => console.log(err));
                        setCopied2(true);
                      }}
                      className={`flex flex-row items-center gap-3 bg-blue-600 p-3 text-white ${
                        copied2 ? "opacity-50" : ""
                      }`}
                      disabled={copied2}
                    >
                      <FaLink className="text-2xl" />
                      <p className="text-lg">{copied2 ? "Copied" : "Share"}</p>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="pt-4 text-2xl">Enter a word</p>
            <form
              className="my-4 flex flex-col items-center"
              onSubmit={(e) => {
                e.preventDefault();
                if (!validWord) {
                  return alert("Invalid word");
                }
                setLetters([]);
                setGuesses(0);
                setGameOver(false);
                setActive(true);
              }}
            >
              <div className="my-4 flex flex-row border-2 border-blue-600 text-4xl">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value.toLowerCase())}
                  className={`${
                    word.length > 0 && !validWord ? "text-red-600" : ""
                  } border-transparent p-2 pl-4 outline-none focus:border-transparent focus:ring-0`}
                />
                {/* add a button to select a random word */}
                <button
                  type="button"
                  onClick={() => {
                    getRandomWord()
                      .then(() => {
                        setLetters([]);
                        setGuesses(0);
                        setGameOver(false);
                        setActive(true);
                      })
                      .catch((err) => console.log(err));
                  }}
                  className="bg-blue-600 p-4 text-white"
                >
                  <FaDice />
                </button>
              </div>

              <p className="text-2xl">
                <button type="submit">Start</button>
              </p>
            </form>
          </>
        )}
      </main>
    </>
  );
};

export default Hangman;
