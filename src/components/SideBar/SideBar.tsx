import './sideBar.scss'

import { Link } from 'react-router-dom';

import { SiApplemusic } from "react-icons/si";
import { FaSearch } from "react-icons/fa";

// interface MusicFile {
//   name: string;
//   path: string;
// }


const SideBar = () => {
 
  return (
    <div className="sideBar">
      <div className="logo">
        {<SiApplemusic className='sideBar__logoIcon'/>}
        <span id='sideBar__logo'>MusBoard</span>
      </div>
      <form className='sideBar__searchMusic' action="">
        <input placeholder='Search ...' type="text" />
        <FaSearch className='sideBar__searchMusic-icon'/>
      </form>
      <div className="sideBar__menu">
        <Link to="/all-music">All Music</Link>
        <Link to="/favorites-music">Favorites</Link>
      </div>
    </div>
  )
}
export default SideBar
