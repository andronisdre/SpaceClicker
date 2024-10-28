const { app, BrowserWindow, session } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
    },
    width: 1000,
    height: 700,
  });

  // Clear cache when the window is created
  session.defaultSession.clearCache().then(() => {
    console.log("Cache cleared!");
    win.loadURL("https://cookieclicker-ccf9b.web.app/");
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (event, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
      },
    });
  });
});
