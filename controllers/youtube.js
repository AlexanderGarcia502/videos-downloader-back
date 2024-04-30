const util = require("util");

const exec = util.promisify(require("child_process").exec);
const getResolutionCode = require("../utils/getResolutionCode");

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
            parts[2] !== "audio"
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
        title: title.stdout.trim(),
        thumbnail: thumbnail.stdout.trim(),
        notes: !notes ? [] : notes,
      };
      return videoInformation;
    } catch (error) {
      console.error("Error executing youtube-dl:", error.message);
      throw new Error(error.message);
    }
  };
  downloadVideo = async (link, resolution) => {
    try {
      const youtubeDlPath =
        "C:\\Users\\pablo\\AppData\\Local\\Programs\\Python\\Python312\\Scripts";
      const equivalent = getResolutionCode(resolution);
      const { error, stdout, stderr } = await exec(
        `"${youtubeDlPath}\\youtube-dl" -f "bestvideo[height<=${equivalent}]+bestaudio/best[height<=${equivalent}]" --merge-output-format mp4 --output "%(title)s.%(ext)s" ${link}`
      );

      console.log("stdout:", stdout);
      console.error("stderr:", stderr);

      return { stdout, stderr, error };
    } catch (error) {
      console.error("Error downloading video:", error.message);
      throw new Error(error.message);
    }
  };
}

module.exports = ControllerYoutubeDL;
