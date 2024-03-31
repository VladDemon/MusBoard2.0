import { app, BrowserWindow, ipcMain} from 'electron'
import path from 'node:path'
import { dialog } from 'electron'
import fs from 'fs'
import Store from 'electron-store'
import url from 'url'

const store = new Store();


interface MusicFile {
  name: string;
  path: string;
}

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 940,
    height: 560,
    minWidth:940,
    minHeight:560,
    icon: path.join(process.env.VITE_PUBLIC, 'MusBoardIcon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  })

  win.setTitle("MusBoard");
  win.setMenuBarVisibility(false);
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

ipcMain.on("open-folder-dialog", async (e) => {
  const res = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  });
  if(!res.canceled){
    const folderPath = res.filePaths[0];
    const musicFiles : MusicFile[] = [];
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      if (!stats.isDirectory() && (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg'))) {
        musicFiles.push({
          name: file,
          path: filePath,
        });
      }
    });
    store.set('musicList', musicFiles);
    console.log(musicFiles);
    e.reply('select-folder', musicFiles);
  }
})

const loadMusicList = () => {
  return store.get('musicList', []);
};

ipcMain.on("currMusicIndex", (e, curMusIndex) => {
  e.reply("curMusIndex",curMusIndex);
})


ipcMain.on('get-music-list', (event) => {
  const musicList = loadMusicList();
  console.log(musicList);
  event.reply('music-list', musicList);
});

ipcMain.on("play-music", async (e,name) => {
    e.reply('play-music__name', name);
  
})
ipcMain.on("isMusPlay", async (e, musPlay) => {
  e.reply('isMusPlaying', musPlay);
})

ipcMain.on("musListing", (e, musList) => {
  e.reply("musicListing", musList);
})




// app section
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
