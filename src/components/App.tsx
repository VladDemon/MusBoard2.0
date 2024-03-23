import '../App.scss'
import SideBar from './SideBar/SideBar'
import { HashRouter as Router, Routes, Route} from 'react-router-dom'
import { AllMusic } from './AllMusic/AllMusic'
import { Favorites } from './Favorites/Favorites'
import AudioPlayer from './AudioPlayer/AudioPlayer'

import {ipcRenderer } from 'electron'

import { useState } from 'react'

function App() {
  const [musPath, setMusPath] = useState<string>("")
  // const [musList, setMusList] = useState<string[]>([])
  ipcRenderer.on("play-music__on", (_, curMus) => {
    setMusPath(curMus)
  })


  return (
    <Router>
      <div className='mainWindow'>
        <SideBar/>
        <Routes>
          <Route path='/all-music' element={<AllMusic/>}/>
          <Route path='/favorites-music' element={<Favorites/>}/>
        </Routes>
        <div className="mainWindow__music_player">
          <AudioPlayer musPath={musPath}/>
        </div>
      </div>

    </Router>
      
  )
}

export default App
