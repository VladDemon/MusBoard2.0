import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.scss';

import { ipcRenderer } from 'electron';

import { CiPlay1 } from "react-icons/ci";
import { TbPlayerTrackNext } from "react-icons/tb";
import { IoPlayBackOutline } from "react-icons/io5";
import { CiPause1 } from "react-icons/ci";



interface MusicFile {
    name: string;
    path: string;
  }

const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [name, setName] = useState<string>("");
    const [volume, setVolume] = useState(0.5);
    const [allMusList, setAllMusList] = useState<MusicFile[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [currentMusicPath, setCurrentMusicPath] = useState<string>("");

    const [musicList, setMusList] = useState<MusicFile[]>();


    // EndMusic
    const handleIsEnd = () => {
        if(audioRef.current?.ended){
            setIsPlaying(false);
        }
    }
    // 

    // Получем список музыки и индекс текущей
    useEffect(() => {
        ipcRenderer.on("music-list", (_e, files) => {
            setMusList(files);
            console.log(musicList)
        });

        ipcRenderer.on("curMusIndex", (_e, curMusIndex) => {
            setCurrentSongIndex(curMusIndex);
            console.log(curMusIndex);
        })
        return () => {
            ipcRenderer.removeAllListeners("music-list");
            ipcRenderer.removeAllListeners("curMusIndex");
        }

    }, [musicList])

    //End

    // Переключение
    const handleNextMus = () : void => {
        if(allMusList.length > 0) {
            setCurrentSongIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % allMusList.length;
                setCurrentMusicPath(allMusList[nextIndex].path);
                setName(allMusList[nextIndex].name);
                setIsPlaying(true);
                return nextIndex;
            });
        };    
    };

    const handlePrevMus = () : void => {
        if(allMusList.length > 0) {
            setCurrentSongIndex(prevIndex => {
                const nextIndex = (prevIndex - 1 + allMusList.length) % allMusList.length;
                setCurrentMusicPath(allMusList[nextIndex].path);
                setName(allMusList[nextIndex].name);
                setIsPlaying(true);
                return nextIndex;
            });
        };

    };
    // End

    // Получем название музыки и проверяем кончилась ли музыка
    useEffect(() => {
        ipcRenderer.on("play-music__name", (_, name) => { 
            console.log(name);
            setName(name);
            allMusList.forEach((music, index) => {
                if(music.name == name) {
                    setCurrentSongIndex(index); 
                }
            })
        })
        if (audioRef.current) {
            audioRef.current.addEventListener('ended', handleIsEnd);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleIsEnd);
            }
        };
    }, [])
    //End


    useEffect(() => {
        ipcRenderer.on("musicListing", (_e_, musicList) => {
            setAllMusList(musicList);
        })
    }, [])


    // 
    useEffect(() => {
        ipcRenderer.on("isMusPlaying", (_,) => {
            setIsPlaying(true);
        });

        return () => {
            ipcRenderer.removeAllListeners("isMusPlaying");
        };
    }, []);
    //End


    //Остановка и воспроизведение
    const handlePlayStop = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            audioRef.current?.play();
            
        }
        else {
            audioRef.current?.pause();
            setIsPlaying(!isPlaying);
        }
    }
    //End 

    // Звуковая Дорожка
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(audioRef.current?.currentTime || 0);
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', updateTime);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', updateTime);
            }
        };
    }, []);


// Звук
    const handleVolume = (e : React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }

    useEffect(() => {
        if (allMusList.length > 0) {
            setCurrentMusicPath(allMusList[currentSongIndex].path);
        }
    }, [currentSongIndex, allMusList]);

    return (
        <div className="AudioPlayer">
            <audio ref={audioRef} src={currentMusicPath} autoPlay/>

            <p>{name}</p>

            <input className='AudioPlayer__volume' type="range" min={0} max={1} step={0.01} value={volume} 
                onChange={handleVolume}
            />

            <input className='AudioPlayer__duration' value={currentTime} type="range" min={0} max={audioRef.current?.duration}
                onChange={(e) => {
                    if (audioRef.current) {
                        audioRef.current.currentTime = Number(e.target.value);
                    }
                }}
            />
            <div className="AudioPlayer__control-btn">
                <button className='btn control-btn__prev' onClick={handlePrevMus}><IoPlayBackOutline /></button>
                <button className='btn control-btn__play-stop' onClick={handlePlayStop}>{isPlaying ? <CiPause1 /> : <CiPlay1 />}</button>
                <button className='btn control-btn__next' onClick={handleNextMus}><TbPlayerTrackNext /></button>
            </div>

        </div>
    );
};

export default AudioPlayer;