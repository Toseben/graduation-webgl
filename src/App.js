import React, { useMemo, useEffect, useRef, useState } from 'react'
import Div100vh from 'react-div-100vh'
import create from 'zustand'
import ReactSearchBox from 'react-search-box'
import marked from 'marked';

import Graphics from './components/Graphics';
import './styles/styles.scss';
const markdownText = require("./markdownText.md");

const [useStore, api] = create(set => ({
  // GETTERS
  progress: 0,
  hovered: null,
  selected: null,
  controls: null,
  reflector: null,
  silhouetteVids: 3,
  loaded: false,
  loadAnimDone: false,
  studentData: [],

  // SETTERS
  setProgress: (progress) => set({ progress }),
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

export default function App() {
  const loaded = useStore(state => state.loaded)
  const progress = useStore(state => state.progress)
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
      user.markdown = marked(`# ${user.name}\n\n${markdownText}`)
      user.tags = []
      if (counter < 20) user.tags = ['First']
      if (counter < 10) user.tags = ['First', 'Honors']
      counter++
      return user
    })

    const searchData = studentData.map(user => {
      return { value: user.name, userId: user.userId }
    })

    setStudentData(studentData)
    return [studentData, searchData]
  }, [])

  const tagData = useMemo(() => {
    const tagData = [
      { value: ' Honors' },
      { value: ' First' }
    ]
    return tagData
  }, [])

  const onSelect = record => {
    if (!loadAnimDone) return
    const instance = Math.floor(record.userId / silhouetteVids);
    const vidId = record.userId % silhouetteVids
    setHovered({ array: [{ instance, vidId }], setter: 'search' })
  }

  const onSelectFilter = record => {
    if (!loadAnimDone) return
    let filtered = studentData.filter(student => student.tags.includes(record.value.trim()))
    filtered = filtered.map(student => {
      const instance = Math.floor(student.userId / silhouetteVids);
      const vidId = student.userId % silhouetteVids
      return { instance, vidId }
    })

    setHovered({ array: filtered, setter: 'search' })
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

  const onMouseUp = () => { window.isMouseDown = false }
  const onMouseDown = () => { window.isMouseDown = true }

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [selected])

  const selectedId = selected ? selected.instance * silhouetteVids + selected.vidId : null
  const tagBox = useRef()

  const onPointerDown = e => { e.stopPropagation() }

  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <div className={`loadingScreen ${loaded ? 'hidden' : ''}`}>
          <div className="topBar">
            <p className="loading">LOADING<span>.</span><span>.</span><span>.</span></p>
            <p className="university">MICHIGAN STATE UNIVERSITY</p>
          </div>
          <div className="universityLogo">
            <div className="logo"></div>
            <p className="college">LYMAN BRIGGS COLLEGE</p>
            <p className="commencement">- Commencement 2020 -</p>
          </div>
        </div>

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

        <div className="tagBox">
          <ReactSearchBox
            ref={tagBox}
            placeholder="Press space to filter"
            data={tagData}
            onSelect={record => onSelectFilter(record)}
            fuseConfigs={{
              threshold: 0.05,
            }}
          />
        </div>

        <div className={`overlay ${selectedId ? '' : 'hidden'}`} onPointerDown={() => setSelected(null)}>
          <div ref={userPlane} className="animateUserInfo" onPointerMove={e => onMouseMove(e)} onPointerDown={e => onPointerDown(e)}>
            <div className={`userContainer ${selectedId ? '' : 'hidden'}`}>
              <div className="fireworksContainer">
                <video className="fireworks" autoPlay loop muted>
                  <source type="video/mp4" src="./assets/fireworksBlack.mp4"></source>
                </video>
              </div>
              <canvas id="c2" className="videoContainer" width="480" height="852"></canvas>
              <div className="closeButton" onClick={() => setSelected(null)} />
              <div className={`studentDetails`}>
                {studentData[selectedId] &&
                  <div className="text" dangerouslySetInnerHTML={{ __html: studentData[selectedId].markdown }}></div>
                }
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
