import { app } from "electron";
import https from "https";
import fs from "fs";
import path from "path";

// CONFIGURA TU REPO Y NOMBRE DE RELEASE
const GITHUB_API = "https://api.github.com/repos/<OWNER>/<REPO>/releases/latest";
const EXE_NAME = "ButterLauncher.exe"; // Cambia por el nombre real de tu exe
const USER_AGENT = "ButterLauncher-Updater";

export async function checkForUpdate(win: Electron.BrowserWindow) {
  https.get(GITHUB_API, { headers: { "User-Agent": USER_AGENT } }, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const release = JSON.parse(data);
      const asset = release.assets.find((a: any) => a.name === EXE_NAME);
      if (!asset) return;
      const exeUrl = asset.browser_download_url;
      const exePath = path.join(app.getPath("exe"));
      // Descarga el nuevo exe
      const file = fs.createWriteStream(exePath + ".new");
      https.get(exeUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          // Reemplaza el exe actual al cerrar
          win.webContents.send("update-downloaded");
        });
      });
    });
  });
}
