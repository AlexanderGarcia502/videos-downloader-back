const util = require("util");

const exec = util.promisify(require("child_process").exec);
const getResolutionCode = require("../utils/getResolutionCode");

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const allResolutions = require("../utils/allResolutions");

const tempDir = path.join(__dirname, "../temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
class ControllerYoutubeDL {
  getVideoInformation = async (link) => {
    try {
      const [formats, thumbnail, title] = await Promise.all([
        exec(`youtube-dl --list-formats ${link}`),
        exec(`youtube-dl --get-thumbnail ${link}`),
        exec(`youtube-dl --get-title ${link}`),
      ]);

      const formatLines = formats.stdout.split("\n");
      const uniqueNotes = new Set();
      formatLines
        .map((line) => line.trim().split(/\s+/))
        .filter(
          (parts) =>
            parts.length >= 2 &&
            !["webpage", "resolution", "for"].includes(parts[3]) &&
            parts[2] !== "audio" &&
            allResolutions.includes(parts[3])
        )
        .forEach((parts) => uniqueNotes.add(parts[3]));

      const notes = Array.from(uniqueNotes);

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
        notes: !notes ? [] : notes,
      };
      return videoInformation;
    } catch (error) {
      console.error("Error executing youtube-dl:", error.message);
      throw new Error(error.message);
    }
  };
  async downloadVideo(link, resolution) {
    try {
      const equivalent = getResolutionCode(resolution);
      const fileName = crypto.randomBytes(16).toString("hex") + ".mp4";
      const filePath = path.join(tempDir, fileName);

      const { error, stdout, stderr } = await exec(
        `youtube-dl -f "bestvideo[height<=${equivalent}]+bestaudio/best[height<=${equivalent}]" --merge-output-format mp4 --output "${filePath}" ${link}`
      );

      if (error) {
        return { error: error.message, downloadUrl: null };
      }

      return {
        error: null,
        downloadUrl: `/api/youtube/download_temporary/${fileName}`,
      };
    } catch (error) {
      return { error: error.message, downloadUrl: null };
    }
  }
}

module.exports = ControllerYoutubeDL;
