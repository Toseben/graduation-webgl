import React from 'react'
import Div100vh from 'react-div-100vh'
import Graphics from './components/Graphics';
import './styles/styles.scss';

export default function App() {
  return (
    <>
      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <Graphics />
      </Div100vh>
    </>
  );
}
