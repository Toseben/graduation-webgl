import React, { useMemo, useEffect, useRef } from 'react'
import Div100vh from 'react-div-100vh'
import { LoremIpsum } from "lorem-ipsum";
import create from 'zustand'
import ReactSearchBox from 'react-search-box'

import Graphics from './components/Graphics';
import './styles/styles.scss';

const [useStore, api] = create(set => ({
  // GETTERS
  hovered: null,
  selected: null,
  controls: null,
  reflector: null,
  silhouetteVids: 3,
  loaded: false,
  loadAnimDone: false,
  studentData: [],

  // SETTERS
  setHovered: (hovered) => set({ hovered }),
  setSelected: (selected) => set({ selected }),
  setControls: (controls) => set({ controls }),
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
  const selected = useStore(state => state.selected)
  const setHovered = useStore(state => state.setHovered)
  const setSelected = useStore(state => state.setSelected)
  const silhouetteVids = useStore(state => state.silhouetteVids)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const setStudentData = useStore(state => state.setStudentData)

  const [studentData, searchData] = useMemo(() => {
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

    const searchData = studentData.map(user => {
      return { value: user.name, userId: user.userId }
    })

    setStudentData(studentData)
    return [studentData, searchData]
  }, [])

  const onSelect = record => {
    if (!loadAnimDone) return
    const instance = Math.floor(record.userId / silhouetteVids);
    const vidId = record.userId % silhouetteVids
    setHovered({ instance, vidId, setter: 'search' })
  }

  const onChange = () => {
    if (hovered) setHovered(null)
  }

  const userPlane = useRef(null)
  const onMouseMove = e => {
    if (!userPlane.current || !selected) return
    const YAngle = -(0.5 - (e.pageX / window.innerWidth)) * 20;
    const XAngle = (0.5 - (e.pageY / window.innerWidth)) * 20;

    const style = `translate(-50%, -50%) rotateX(${XAngle}deg) rotateY(${YAngle}deg)`;
    const plane = userPlane.current
    plane.style.transform = style;
    plane.style.webkitTransform = style;
    plane.style.mozTranform = style;
    plane.style.msTransform = style;
    plane.style.oTransform = style;
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [selected])

  const selectedId = selected ? selected.instance * silhouetteVids + selected.vidId : null
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

        <div className={`overlay ${selectedId ? '' : 'hidden'}`} onPointerDown={() => setSelected(null)}>
          <div ref={userPlane} className="animateUserInfo" onPointerMove={e => onMouseMove(e)}>
            <div className={`userContainer ${selectedId ? '' : 'hidden'}`}>
              <div className="fireworksContainer">
                <video className="fireworks" autoPlay loop muted>
                <source type="video/mp4" src="./assets/fireworksBlack.mp4"></source>
              </video>
              </div>
              <div className="closeButton" onClick={() => setSelected(null)} />
              <canvas id="c2" className="videoContainer" width="480" height="852"></canvas>
              <div className={`studentDetails`}>
                {studentData[selectedId] && <>
                  <p className="name">{studentData[selectedId].name}</p>
                  <p className="text">{studentData[selectedId].text}</p>
                </>}
              </div>
            </div>
          </div>
        </div>

        <div className='greenScreen'>
          <canvas id="c1" width="480" height="852"></canvas>
          <video id="video" autoPlay loop muted>
            <source type="video/mp4" src="./assets/cartoonKey_trim.mp4"></source>
          </video>
        </div>

        <Graphics useStore={useStore} />
      </Div100vh>
    </>
  );
}
