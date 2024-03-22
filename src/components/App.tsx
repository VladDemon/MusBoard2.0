import '../App.scss'
import SideBar from './SideBar/SideBar'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { AllMusic } from './AllMusic/AllMusic'
import { Favorites } from './Favorites/Favorites'

import AudioPlayer from './AudioPlayer/AudioPlayer'

function App() {
  return (
    <Router>
      <div className='mainWindow'>
        <SideBar/>
        <Routes>
          <Route path='/all-music' element={<AllMusic/>}/>
          <Route path='/favorites-music' element={<Favorites/>}/>
        </Routes>
        <div className="mainWindow__music_player">
          <AudioPlayer/>
        </div>
      </div>

    </Router>
      
  )
}

export default App
