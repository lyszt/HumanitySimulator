import { useState, createElement, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function EventBox() {

    const [dialogues, setDialogues] = useState<string[]>([
        'Welcome to FS Madame de Pompadour.',
    ]);

    const [characterList, setCharacterList] = useState<{ id: string; name: string }[]>([]);


    useEffect(() => {
        async function loadCharacterList() {
            const url = "http://127.0.0.1:5000/get_actors";
            try {
                const response = await fetch(url, { method: 'GET' });
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }

                const json: { body: Record<string, string>; status: number } = await response.json();
                const characters = Object.entries(json.body).map(
                    ([id, name]) => ({ id, name })
                );
                setCharacterList(prev => [...prev, ...characters]);

            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                } else {
                    console.error("Unknown error", error);
                }
            }
        }

        loadCharacterList();
    }, []);

    const scrollContainerRef = useRef(null);
    useEffect(() => {
        const node = scrollContainerRef.current;
        if(node) {
            node.scrollTop = node.scrollHeight;
        }
    }, [dialogues]);

    async function runTurn(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const url = "http://127.0.0.1:5000/action"
        try {
            const response = await fetch(url, {
                method: 'GET',
            })
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const json: { body: string; status: number } = await response.json();
            setDialogues(prev => [...prev, json.body]);
            const audio = new Audio('src/assets/audio/click.mp3');
            await audio.play();
        } catch (error) {
            if (error instanceof Error) {
                const message = error.message;
                setCharacterList(['No characters have been loaded. This must be due to an error.']);
                console.error(message);
            }
        }

    }

  return (
      <div className="w-full h-4/5 bg-stone-100 m-2 relative flex flex-row">
          <div ref={scrollContainerRef} className="eventBox w-full h-full">
              {dialogues.map((text, i) => (
                  <p key={i} className="dialogue_box">
                      {text}
                  </p>
              ))}
              <br/>
          </div>
          <div className="pt-2 w-full h-full">
              <div className="w-full h-full flex flex-col items-center justify-start">
                  <h3 className="text-black w-130">Character List</h3>
                  <div className="w-6/7 h-2/3 bg-stone-200 characterList grid select-none">
                      {characterList.map((char) => (
                      <span key={char.id} id={char.id} className="">
                          {char.name}
                      </span>
                      ))}

                  </div>
                  <button type="button" onClick={runTurn}
                          className="passTurn h-12 gap-2 flex flex-row justify-center
                          items-center rounded-xl shadow
                          shadow-stone-800 m-2 pr-3 pl-3 hover:bg-stone-800">
                      <img className="w-7" src="src/assets/icons/arrow.svg" alt="Pass turn"/>
                      <span className="text-sm font-bold">Next</span>
                  </button>
              </div>
          </div>
      </div>
  )
}

export default EventBox
