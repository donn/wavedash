// Modules to control application life and create native browser window
const electron = require("electron");
const { app, dialog, BrowserWindow, Menu } = electron;

const macOS = process.platform == "darwin";

const path = require("path");
const fs = require("fs");

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'electron-tweaks.cjs'),
            contextIsolation: false
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'))


    if (macOS) {
        const { TouchBar } = electron;
        const { TouchBarButton } = TouchBar;

        const touchBar = new TouchBar({
            items: [
                // new TouchBarButton({
                //   label: "📂",
                //   click: ()=> {
                //     mainWindow.webContents.send("open-pressed", "");
                //   }
                // }),
                new TouchBarButton({
                    label: "↻",
                    click: () => {
                        mainWindow.webContents.send("reload-pressed", "");
                    }
                })
            ]
        });

        // mainWindow.setTouchBar(touchBar);
    }

    const menu = Menu.buildFromTemplate([
        { role: 'appMenu' },
        {
            label: 'File',
            submenu: [
                {
                    type: "normal",
                    label: 'Open',
                    accelerator: "CommandOrControl+O",
                    click: async () => {
                        let { filePaths } = await dialog.showOpenDialog(mainWindow, {
                            title: "Open VCD File…",
                            buttonLabel: "Open",
                            filters: [
                                { name: "Value Change Dump", extensions: ["vcd"] }
                            ]
                        });

                        if (filePaths.length == 0) {
                            return;
                        }

                        let file = filePaths[0];
                        mainWindow.currentFile = file;

                        let name = path.basename(mainWindow.currentFile);
                        let value = fs.readFileSync(mainWindow.currentFile, "utf8");

                        mainWindow.webContents.send("update-vcd",
                            { name, value }
                        );
                    }
                },
                {
                    type: "normal",
                    label: 'Reload',
                    accelerator: "CommandOrControl+R",
                    click: async () => {
                        if (!mainWindow.currentFile) {
                            return;
                        }
                        let name = path.basename(mainWindow.currentFile);
                        let value = fs.readFileSync(mainWindow.currentFile, "utf8");

                        mainWindow.webContents.send("update-vcd",
                            { name, value }
                        );
                    }
                },
                macOS ? { role: 'close' } : { role: 'quit' }
            ]
        },
        { role: 'editMenu' },
        { role: 'windowMenu' },
        {
            label: 'View',
            submenu: [
              { role: 'forceReload' },
              { role: 'toggleDevTools' },
              { type: 'separator' },
              { role: 'resetZoom' },
              { role: 'zoomIn' },
              { role: 'zoomOut' },
              { type: 'separator' },
              { role: 'togglefullscreen' }
            ]
          },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Repo',
                    click: async () => {
                        const { shell } = electron;
                        await shell.openExternal('https://github.com/donn/wavedash')
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (!macOS) app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.