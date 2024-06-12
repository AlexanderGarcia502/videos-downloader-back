const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cleanUrl = require("../../utils/cleanUrl");

const tempDir = path.join(__dirname, "../../temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

class ControllerOthersNetworks {
  getVideoInformation = async (link) => {
    try {
      const [formats, thumbnail, title] = await Promise.all([
        exec(`yt-dlp --list-formats ${link}`),
        exec(`yt-dlp --get-thumbnail ${link}`),
        exec(`yt-dlp --get-title ${link}`),
      ]);

      const formatLines = formats.stdout.split("\n");
      const resolutionsSet = new Set();

      formatLines.forEach((line) => {
        const match = line.match(/mp4\s+(\d+x\d+)/);
        if (match) {
          resolutionsSet.add(match[1]);
        }
      });

      const resolutions = Array.from(resolutionsSet);
      const notes = resolutions;
      if (!thumbnail.stdout) {
        console.log("No thumbnail URL found.");
      }
      if (!title.stdout) {
        console.log("No video title found.");
      }

      if (notes.length < 1) {
        console.log("No unique notes found in the output.");
      }

      const videoInformation = {
        title: title.stdout.substring(0, 80).trim(),
        thumbnail: thumbnail.stdout.trim(),
        notes: notes,
      };
      return videoInformation;
    } catch (error) {
      console.error("Error executing yt-dlp:", error.message);
      throw new Error(error.message);
    }
  };

  async downloadVideo(link, resolution) {
    function getResolutionCode(resolution) {
      switch (resolution) {
        case "1280x720":
          return { width: 1280, height: 720 };
        case "1920x1080":
          return { width: 1920, height: 1080 };
        case "1280x720":
          return { width: 1280, height: 720 };
        case "854x480":
          return { width: 854, height: 480 };
        case "640x360":
          return { width: 640, height: 360 };
        case "426x240":
          return { width: 426, height: 240 };
        case "256x144":
          return { width: 256, height: 144 };
        default:
          return { width: 1280, height: 720 };
      }
    }
    try {
      const equivalent = getResolutionCode(resolution);
      const fileName = crypto.randomBytes(16).toString("hex") + ".mp4";
      const filePath = path.join(tempDir, fileName);

      let someErr = null;
      let someStderr = null;
      if (
        link.trim().includes("tiktok.com") ||
        link.trim().includes("instagram.com")
      ) {
        let linkCleaned = null;
        if (link.trim().includes("tiktok.com")) {
          linkCleaned = cleanUrl(link);
        }
        const { error, stdout, stderr } = await exec(
          `yt-dlp --merge-output-format mp4 --output "${filePath}" ${
            linkCleaned !== null ? linkCleaned : link
          }`
        );
        someErr = error;
        someStderr = stderr;
      } else {
        let linkCleaned = null;
        if (link.trim().includes("www.reddit.com")) {
          linkCleaned = cleanUrl(link);
        }
        const { error, stdout, stderr } = await exec(
          `yt-dlp -f "bestvideo[width<=${equivalent.width}][height<=${
            equivalent.height
          }]+bestaudio/best[width<=${equivalent.width}][height<=${
            equivalent.height
          }]" --merge-output-format mp4 --output "${filePath}" ${
            linkCleaned !== null ? linkCleaned : link
          }`
        );
        someErr = error;
        someStderr = stderr;
      }

      if (someErr) {
        console.log("error message: ", someErr);
        return { error: someErr.message || someErr, downloadUrl: null };
      }
      if (someStderr) {
        console.error("Error al descargar el video:", someStderr);
        return { error: someStderr, downloadUrl: null };
      }
      return {
        error: null,
        downloadUrl: `/api/youtube/download_temporary/${fileName}`,
      };
    } catch (error) {
      console.error("Error al ejecutar yt-dlp:", error.message);
      return { error: error.message, downloadUrl: null };
    }
  }
  async downloadMP3(link) {
    try {
      const fileName = crypto.randomBytes(16).toString("hex") + ".mp3";
      const filePath = path.join(tempDir, fileName);

      let linkCleaned = null;

      if (
        link.trim().includes("tiktok.com") ||
        link.trim().includes("www.reddit.com")
      ) {
        linkCleaned = cleanUrl(link);
      }
      const { error, stdout, stderr } = await exec(
        `yt-dlp -x --audio-format mp3 --output "${filePath}" ${
          linkCleaned !== null ? linkCleaned : link
        }`
      );

      if (error) {
        console.log("error message: ", error);
        return { error: error.message, downloadUrl: null };
      }
      if (stderr) {
        console.error("Error al descargar el video:", stderr);
        return { error: stderr, downloadUrl: null };
      }
      return {
        error: null,
        downloadUrl: `/api/youtube/download_temporary/${fileName}`,
      };
    } catch (error) {
      console.error("Error al ejecutar yt-dlp:", error.message);
      return { error: error.message, downloadUrl: null };
    }
  }
}

module.exports = ControllerOthersNetworks;
