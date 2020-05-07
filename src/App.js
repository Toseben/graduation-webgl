import React, { useMemo, useState } from 'react'
import Div100vh from 'react-div-100vh'
import { LoremIpsum } from "lorem-ipsum";
import create from 'zustand'
import ReactSearchBox from 'react-search-box'

import Graphics from './components/Graphics';
import './styles/styles.scss';

const [useStore, api] = create(set => ({
  // GETTERS
  hovered: null,
  reflector: null,
  silhouetteVids: 5,
  loaded: false,
  loadAnimDone: false,
  studentData: [],

  // SETTERS
  setHovered: (hovered) => set({ hovered }),
  setReflector: (reflector) => set({ reflector }),
  setLoaded: (loaded) => set({ loaded }),
  setLoadAnimDone: (loadAnimDone) => set({ loadAnimDone }),
  setStudentData: (studentData) => set({ studentData })
}))

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
  const name1 = ["Liane", "Sharmaine", "Micheline", "Verdell", "Angelina", "Billie", "Jaimee", "Jaye", "Thea", "Alethea", "Caroline", "Garland", "Leatrice", "Zenia", "Javier", "Nancee", "Aurora", "Ashely", "Kam", "Dorian",]
  const name2 = ["Paskett", "Birmingham", "Taketa", "Troxell", "Stengel", "Cosgrove", "Leyva", "Polasek", "Vose", "Sokoloski", "Olmstead", "Watt", "Peacock", "Knapp", "Houghtaling", "Krok", "Baucom", "Daulton", "Kopacz", "Talavera",]
  const name = name1[getRandomInt(0, name1.length)] + ' ' + name2[getRandomInt(0, name2.length)];
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
  const setHovered = useStore(state => state.setHovered)
  const silhouetteVids = useStore(state => state.silhouetteVids)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const setStudentData = useStore(state => state.setStudentData)

  const [studentData, searchData] = useMemo(() => {
    let studentData = new Array(25).fill()
    let counter = 0
    studentData = studentData.map(user => {
      user = {}
      user.userId = counter
      user.name = generateName()
      user.text = lorem.generateSentences(2)
      counter++
      return user
    })

    const searchData = studentData.map(user => {
      return { value: user.name, userId: user.userId }
    })

    setStudentData(studentData)
    return [studentData, searchData]
  }, [])

  const onSelect = record => {
    if (!loadAnimDone) return
    const instance = record.userId % silhouetteVids
    const vidId = Math.floor(record.userId / silhouetteVids);
    setHovered({ instance, vidId, setter: 'search' })
  }

  const onChange = () => {
    if (hovered) setHovered(null)
  }

  const nameId = hovered ? hovered.instance * silhouetteVids + hovered.vidId : null
  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <div className="searchBox">
          <ReactSearchBox
            placeholder="Search for a name"
            data={searchData}
            onSelect={record => onSelect(record)}
            onChange={() => onChange()}
            fuseConfigs={{
              threshold: 0.05,
            }}
          />
        </div>

        <div className={`studentDetails`}>
          {/* {studentData[nameId] && <>
            <p className="name">{studentData[nameId].name}</p>
            <p className="text">{studentData[nameId].text}</p>
          </>} */}
        </div>
        <Graphics useStore={useStore} />
      </Div100vh>
    </>
  );
}
