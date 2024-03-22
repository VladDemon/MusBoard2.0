import { app, BrowserWindow, ipcMain, contextBridge } from 'electron'
import path from 'node:path'
import { dialog } from 'electron'
import fs from 'fs'
import Store from 'electron-store'

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
    },
  })
  win.setTitle("MusBoard");
  win.setMenuBarVisibility(false);
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })


  

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

ipcMain.on("save-music-list", (e, musicFiles) => {
  try {
    store.set("musicList", musicFiles);
    console.log("Music list saved successfully:", musicFiles);
  } catch (error) {
    console.error("Error saving music list:", error);
  }
});

const loadMusicList = () => {
  return store.get('musicList', []);
};

ipcMain.on('get-music-list', (event) => {
  const musicList = loadMusicList();
  console.log("musicList:", musicList);
  event.reply('music-list', musicList);
});


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
    e.reply('select-folder', musicFiles);
  }
})
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
