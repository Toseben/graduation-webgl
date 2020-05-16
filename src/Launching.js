import React from 'react'
import Div100vh from 'react-div-100vh'

export default function Launching() {
  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <div className={`loadingScreen`}>
          <div className="topBar">
            <p className="loading"/>
            <p className="university">MICHIGAN STATE UNIVERSITY</p>
          </div>
          <div className="universityLogo">
            <div className="logoContainer">
              <div className="logoWhite" />
            </div>
            <p className="college">LYMAN BRIGGS COLLEGE</p>
            <p className="commencement">- Commencement 2020 -</p>
            <p className="commencement">Launching Shortly</p>
          </div>
        </div>
      </Div100vh>
    </>
  );
}
