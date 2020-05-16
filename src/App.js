import React, { useMemo, useEffect, useRef, useState } from 'react'
import Div100vh from 'react-div-100vh'
import create from 'zustand'
import ReactSearchBox from 'react-search-box'
import marked from 'marked';
import { useSpring, animated } from 'react-spring'
import AvatarData from './data/AvatarData'
import axios from 'axios';

import Graphics from './components/Graphics';
import './styles/styles.scss';

const [useStore, api] = create(set => ({
  // GETTERS
  progress: 0,
  hovered: null,
  selected: null,
  controls: null,
  reflector: null,
  silhouetteVids: 4,
  loaded: false,
  loadAnimDone: false,
  studentData: null,

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

export default function App() {
  const loaded = useStore(state => state.loaded)
  const progress = useStore(state => state.progress)
  const hovered = useStore(state => state.hovered)
  const selected = useStore(state => state.selected)
  const setLoaded = useStore(state => state.setLoaded)
  const setHovered = useStore(state => state.setHovered)
  const setSelected = useStore(state => state.setSelected)
  const silhouetteVids = useStore(state => state.silhouetteVids)
  const loadAnimDone = useStore(state => state.loadAnimDone)
  const studentData = useStore(state => state.studentData)
  const setStudentData = useStore(state => state.setStudentData)
  const [isSafari, setIsSafari] = useState(/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
  const [speech, setSpeech] = useState(0)

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setLoaded(true)
      }, 2500)
    }
  }, [progress])

  useEffect(() => {
    async function fetchMarkdowns() {
      // const array = []
      const markdownPromises = AvatarData.map(avatar => {
        // array.push(avatar.markdownPath.split('/')[2])
        return axios.get(avatar.markdownPath.replace('markdowns', 'dataStructure/markdowns'))
          .then(res => res.data)
          .catch(e => console.error(e));
      })

      const markdownData = await Promise.all(markdownPromises)
      const data = AvatarData.map((avatar, idx) => {
        avatar.userId = idx
        avatar.name = avatar.avatarName
        const markdown = markdownData[idx].replace(/markdownAssetPath/g, 'dataStructure/markdownAssetPath')
        avatar.markdown = marked(markdown)
        return avatar
      })

      setStudentData(data)
      // array.sort()
    }

    fetchMarkdowns()
  }, [])

  const searchData = useMemo(() => {
    if (!studentData) return null
    const searchData = studentData.map(user => {
      return { value: user.name, userId: user.userId }
    })

    return searchData
  }, [studentData])

  const tagData = useMemo(() => {
    if (!studentData) return null

    // const tagCounter = {}
    // studentData.forEach(data => {
    //   data.tags.forEach(tag => {
    //     if (!tagCounter[tag]) tagCounter[tag] = 1
    //     else tagCounter[tag] += 1
    //   })
    // })

    let tags = []
    studentData.forEach(data => {
      data.tags.forEach(tag => {
        if (!tags.includes(tag)) tags.push(tag)
      })
    })

    tags = tags.filter(tag => tag !== 'Students')
    tags.sort()
    const tagData = tags.map(tag => {
      return { value: tag }
    })
    return tagData
  }, [studentData])

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
    if (!userPlane.current || !selected || isSafari) return
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

  const [selectedId, popupImagePath, videoPath] = useMemo(() => {
    if (!selected) return [null, null, null]
    const selectedId = selected.instance * silhouetteVids + selected.vidId
    const popupImagePath = studentData[selectedId].smallVideoPath.replace('smallVideos', 'dataStructure/smallVideos')
    const videoPath = studentData[selectedId].speech ? 'speech' : 'fireworks'
    return [selectedId, popupImagePath, videoPath]
  }, [selected])

  const onPointerDown = e => { e.stopPropagation() }

  const { height } = useSpring({
    height: progress
  })

  const [showInstruction, setShowInstruction] = useState(true)
  const onClickInstruction = () => {
    setShowInstruction(false)

    setHovered({ array: [{ instance: 0, vidId: 0 }], setter: 'search' })
    setTimeout(() => {
      setSelected({ instance: 0, vidId: 0 })
    }, 4000)
  }

  const audio = useRef()
  useEffect(() => {
    audio.current.volume = 0.075
  }, [])

  const closePopUp = () => {
    if (speech === 0) {
      setSpeech(1)
      setHovered({ array: [{ instance: 0, vidId: 1 }], setter: 'search' })
      setSelected(null)
      setTimeout(() => {
        setSelected({ instance: 0, vidId: 1 })
      }, 1000)
    } else if (speech === 1) {
      setSpeech(2)
      setHovered({ array: [{ instance: 0, vidId: 2 }], setter: 'search' })
      setSelected(null)
      setTimeout(() => {
        setSelected({ instance: 0, vidId: 2 })
      }, 1000)
    } else {
      setSpeech(3)
      setSelected(null)
    }
  }

  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <div className={`loadingScreen ${loaded ? 'hidden' : ''}`}>
          <div className="topBar">
            <p className="loading">LOADING<span>.</span><span>.</span><span>.</span></p>
            <p className="university">MICHIGAN STATE UNIVERSITY</p>
          </div>
          <div className="universityLogo">
            <div className="logoContainer">
              <animated.div className="logo"
                style={{
                  height: height.interpolate(height => `${height}%`),
                }} />
              <div className="logoWhite" />
            </div>
            <p className="college">LYMAN BRIGGS COLLEGE</p>
            <p className="commencement">- Commencement 2020 -</p>
          </div>
        </div>

        <div className={`instructions ${showInstruction && loadAnimDone ? '' : 'hidden'}`} onClick={() => onClickInstruction()}>
          <div className="instructionsIcon" />
          <p className="instructionsText">CLICK TO</p>
          <p className="instructionsText">ROTATE AND ZOOM</p>
        </div>

        <audio autoPlay loop ref={audio}>
          <source src="./assets/site_music.mp3" type="audio/mpeg"></source>
          Your browser does not support the audio element.
        </audio>

        <div className={`overlay ${selectedId !== null ? '' : 'hidden'}`} onPointerDown={() => closePopUp()}>
          <div ref={userPlane} className="animateUserInfo" onPointerMove={e => onMouseMove(e)} onPointerDown={e => onPointerDown(e)}>
            <div className={`userContainer ${selectedId !== null ? '' : 'hidden'}`}>
              <div className="fireworksContainer">
                <video className={`fireworks ${videoPath === 'fireworks' ? '' : 'hidden'}`} autoPlay loop muted>
                  <source type="video/mp4" src="./assets/fireworks_bg_1.mp4"></source>
                </video>
                {videoPath === 'speech' && speech === 0 &&
                  <iframe className="embed" allow="autoplay"
                    src="https://www.youtube.com/embed/xH9uwf3zcn8?autoplay=1">
                  </iframe>
                }
                {videoPath === 'speech' && speech === 1 &&
                  <iframe className="embed" allow="autoplay"
                    src="https://www.youtube.com/embed/rDmkxqgOomg?autoplay=1">
                  </iframe>
                }
                {videoPath === 'speech' && speech === 2 &&
                  <iframe className="embed" allow="autoplay"
                    src="https://www.youtube.com/embed/UWkZBD3qmKo?autoplay=1">
                  </iframe>
                }
              </div>
              {/* <canvas id="c2" className="videoContainer" width="735" height="1080"></canvas> */}
              {speech === 3 && <img id="c2" className="videoContainer" src={popupImagePath}></img>}
              <div className="closeButton" onClick={() => closePopUp()} />
              <div className={`studentDetails`}>
                {studentData && studentData[selectedId] &&
                  <div className="text" dangerouslySetInnerHTML={{ __html: studentData[selectedId].markdown }}></div>
                }
              </div>
            </div>
          </div>
        </div>

        {studentData && <>
          <div className={`searchBox ${showInstruction || speech !== 3 ? 'hidden' : ''}`}>
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

          <div className={`tagBox ${showInstruction || speech !== 3 ? 'hidden' : ''}`}>
            <button className="dropbtn">Select</button>
            <div className="dropdown-content">
              {tagData.map((tag, idx) => {
                return <a key={idx} onClick={() => onSelectFilter(tag)}>{tag.value}</a>
              })}
            </div>
          </div>

          {/* <div className='greenScreen'>
            <canvas id="c1" width="735" height="1080"></canvas>
            <video id="video" autoPlay loop muted>
              <source type="video/mp4" src="./assets/cartoonKey_trim.mp4"></source>
            </video>
          </div> */}

          <Graphics useStore={useStore} />
        </>}
      </Div100vh>
    </>
  );
}
