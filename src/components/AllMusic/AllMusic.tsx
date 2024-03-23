import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";


import { ImHeadphones } from "react-icons/im";

import './AllMusic.scss'

interface MusicFile {
  name: string;
  path: string;
}
export const AllMusic = () => {
  const [mus, setMus] = useState<MusicFile[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [musIsPlay, setIsMusPlay] = useState<boolean>(false)

  const handleAddMus = () : void => {
    ipcRenderer.send('open-folder-dialog')
  }
  
  useEffect(() => {
    ipcRenderer.on("select-folder", (_,musicFiles) => {
      console.log(musicFiles);
      setMus(musicFiles);
    });
    ipcRenderer.send('get-music-list');
    ipcRenderer.on('music-list', (_, files : MusicFile[]) => {
      console.log(files)
      setMus(files);
    });

    return () => {
      ipcRenderer.removeAllListeners('select-folder');
      ipcRenderer.removeAllListeners('save-music-list');
      ipcRenderer.removeAllListeners('music-list');
    };
  }, []);

  const filteredMusic : MusicFile[] = mus.filter(music => {
    return music.name.toLowerCase().includes(searchValue.toLowerCase());
  });

  const handlePlayMusic = (path: string, name: string) : void => {
    setIsMusPlay(true);
    ipcRenderer.send('isMusPlay', musIsPlay);
    ipcRenderer.send('play-music', path, name);

  }

  return (
    <div className='allMusic'>
      <header>
        <div className="header__search">
          <ImHeadphones className="allMusic__icon"/>
          <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search music" type="text" />
        </div>
        <div className="header__btn">
          <span>Add Your Mus</span>
          <button onClick={handleAddMus}>Add</button>
        </div>
      </header>
      <main>
        <div className="main__music-container">
          {filteredMusic.map((music, index) => {
            return (
              <div key={index} className="music-container__element">
                <div className="element__poster">
                  <img onClick={() => handlePlayMusic(music.path, music.name)} className="poster__img" draggable="false" src={new URL('/defaultPoster.jpg', import.meta.url).toString()} alt="" />
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
