import React, { useMemo, useState } from 'react'
import Div100vh from 'react-div-100vh'
import { LoremIpsum } from "lorem-ipsum";
import create from 'zustand'

import Graphics from './components/Graphics';
import './styles/styles.scss';

const [useStore, api] = create(set => ({
  // GETTERS
  hovered: undefined,
  reflector: null,

  // SETTERS
  setHovered: (hovered) => set({ hovered }),
  setReflector: (reflector) => set({ reflector })
}))

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
  const name1 = ["Liane", "Sharmaine", "Micheline", "Verdell", "Angelina", "Billie", "Jaimee", "Jaye", "Thea", "Alethea", "Caroline", "Garland", "Leatrice", "Zenia", "Javier", "Nancee", "Aurora", "Ashely", "Kam", "Dorian",]
  const name2 = ["Paskett", "Birmingham", "Taketa", "Troxell", "Stengel", "Cosgrove", "Leyva", "Polasek", "Vose", "Sokoloski", "Olmstead", "Watt", "Peacock", "Knapp", "Houghtaling", "Krok", "Baucom", "Daulton", "Kopacz", "Talavera",]
  const name = name1[getRandomInt(0, name1.length + 1)] + ' ' + name2[getRandomInt(0, name2.length + 1)];
  return name;
}

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

export default function App() {
  const hovered = useStore(state => state.hovered)

  const studentData = useMemo(() => {
    let studentData = new Array(100).fill()
    let counter = 0
    studentData = studentData.map(user => {
      user = {}
      user.userId = counter
      user.name = generateName()
      user.text = lorem.generateSentences(2)
      counter++
      return user
    })

    window.studentData = studentData
    return studentData
  }, [])

  const id = hovered ? hovered.id * 20 + hovered.instance : null

  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <div className={`studentDetails`}>
          {id && <>
            <p className="name">{studentData[id].name}</p>
            <p className="text">{studentData[id].text}</p>
          </>}
        </div>
        <Graphics useStore={useStore} />
      </Div100vh>
    </>
  );
}
