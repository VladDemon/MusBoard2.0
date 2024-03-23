import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.scss';

import { ipcRenderer } from 'electron';

import { CiPlay1 } from "react-icons/ci";
import { TbPlayerTrackNext } from "react-icons/tb";
import { IoPlayBackOutline } from "react-icons/io5";
import { CiPause1 } from "react-icons/ci";


interface AudioPlayerProps {
    musPath: string;

}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ musPath }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [name, setName] = useState<string>("")
    const [volume, setVolume] = useState(0.5);
    
    const handleIsEnd = () => {
        if(audioRef.current?.ended){
            setIsPlaying(false);
        }
    }

    useEffect(() => {
        ipcRenderer.on("play-music__name", (_, name) => {
            setName(name);
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



    useEffect(() => {
        ipcRenderer.on("isMusPlaying", (_, musPlay) => {
            setIsPlaying(musPlay);
        });

        return () => {
            ipcRenderer.removeAllListeners("isMusPlaying");
        };
    }, []);

    const handlePlayStop = () => {
        setIsPlaying(true);
        if (audioRef.current?.paused) {
            audioRef.current?.play();
            
        }
        else if (audioRef.current?.played){
            audioRef.current?.pause();
            setIsPlaying(false);
        }
    }
    

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


    const handleVolume = (e : React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }

    return (
        <div className="AudioPlayer">
            <audio ref={audioRef} src={musPath} autoPlay/>

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
                <button className='btn control-btn__prev' ><IoPlayBackOutline /></button>
                <button className='btn control-btn__play-stop' onClick={handlePlayStop}>{isPlaying ? <CiPause1 /> : <CiPlay1 />}</button>
                <button className='btn control-btn__next' ><TbPlayerTrackNext /></button>
            </div>

        </div>
    );
};

export default AudioPlayer;