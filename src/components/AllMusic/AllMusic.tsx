import { ipcRenderer } from "electron";

import { ImHeadphones } from "react-icons/im";

import './AllMusic.scss'
import { useEffect, useState } from "react";

interface MusicFile {
  name: string;
  path: string;
}


export const AllMusic = () => {
  const [mus, setMus] = useState<MusicFile[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");



  const handleAddMus = () : void => {
    ipcRenderer.send('open-folder-dialog')
  }

  useEffect(() => {
    ipcRenderer.on("select-folder", (e, musicFiles) => {
      setMus(musicFiles);
      ipcRenderer.send('save-music-list', musicFiles);
      
    });
    
    ipcRenderer.send('get-music-list');
    ipcRenderer.on('music-list', (event, files) => {
      setMus(files);
    });

    return () => {
      ipcRenderer.removeAllListeners('select-folder');
      ipcRenderer.removeAllListeners('save-music-list');
      ipcRenderer.removeAllListeners('music-list');
    };
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  const filteredMusic = mus.filter(music => {
    return music.name.toLowerCase().includes(searchValue.toLowerCase());
  });


  return (
    <div className='allMusic'>
      <header>
        <div className="header__search">
          <ImHeadphones className="allMusic__icon"/>
          <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search music" type="text" />
        </div>
        <div className="header__btn">
          <span>Add Your PlayList</span>
          <button onClick={handleAddMus}>AddMusic</button>
        </div>

      </header>
      <main>
        <div className="main__music-container">
          {filteredMusic.map((music, index) => {
            return (
              <div key={index} className="music-container__element">
                <div className="element__poster">
                  <img className="poster__img" src="../../../public/defaultPoster.jpg"alt="" />
                </div>
                {music.name}
              </div>
            )})
          }
        </div>
      </main>
    </div>
  )
}
