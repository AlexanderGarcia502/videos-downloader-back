const { Router } = require("express");
const router = Router();
const fs = require("fs").promises;
const path = require("path");
const ControllerYoutubeDL = require("../controllers/youtube");
const ControllerOthersNetworks = require("../controllers/othersNetworks/othersNetworks");
const urls = require("../utils/urls");

const tempDir = path.join(__dirname, "../temp");

router.get("/information_video", async (req, res) => {
  const { link } = req.query;
  const controllerYoutubeDL = new ControllerYoutubeDL();
  const controllerOthersNetworks = new ControllerOthersNetworks();

  try {
    if (!urls.some((url) => link.includes(url))) {
      return res.status(400).json({
        ok: false,
        message: "Enlace no valido",
      });
    }
    let videoInformation;
    if (link.trim().includes("www.youtube.com/")) {
      videoInformation = await controllerYoutubeDL.getVideoInformation(link);
    } else {
      videoInformation = await controllerOthersNetworks.getVideoInformation(
        link
      );
    }

    return res.status(200).json({
      ok: true,
      data: videoInformation,
    });
  } catch (error) {
    console.error("Error executing youtube-dl:", error.message);
    return res.status(400).json({
      ok: false,
      message: "No se encontró el video",
    });
  }
});

router.post("/download_video", async (req, res) => {
  const { link, resolution } = req.body;

  const controllerYoutubeDL = new ControllerYoutubeDL();
  const controllerOthersNetworks = new ControllerOthersNetworks();

  try {
    if (!urls.some((url) => link.includes(url))) {
      return res.status(400).json({
        ok: false,
        message: "Enlace no valido",
      });
    }
    var downloadUrlToSend = null;
    var someError = null;

    if (link.trim().includes("www.youtube.com/")) {
      const { downloadUrl, error } = await controllerYoutubeDL.downloadVideo(
        link,
        resolution
      );

      downloadUrlToSend = downloadUrl;
      someError = error;
    } else {
      const { downloadUrl, error } =
        await controllerOthersNetworks.downloadVideo(link, resolution);

      downloadUrlToSend = downloadUrl;
      someError = error;
    }

    if (someError) {
      res.status(500).json({
        ok: false,
        message: `Error al ejecutar el comando: ${someError}`,
      });
      return;
    }
    res.status(200).json({ ok: true, downloadUrl: downloadUrlToSend });
  } catch (error) {
    console.log("ERRR: ", error);
    res.status(400).json({ ok: false, message: error.message });
  }
});

router.post("/download_mp3", async (req, res) => {
  const { link } = req.body;

  const controllerOthersNetworks = new ControllerOthersNetworks();

  try {
    if (!urls.some((url) => link.includes(url))) {
      return res.status(400).json({
        ok: false,
        message: "Enlace no valido",
      });
    }

    const { downloadUrl, error } = await controllerOthersNetworks.downloadMP3(
      link
    );

    if (error) {
      res
        .status(500)
        .json({ ok: false, message: `Error al ejecutar el comando: ${error}` });
      return;
    }
    res.status(200).json({ ok: true, downloadUrl: downloadUrl });
  } catch (error) {
    console.log("ERRR: ", error);
    res.status(400).json({ ok: false, message: error.message });
  }
});

router.get("/download_temporary/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(tempDir, fileName);

  try {
    await fs.access(filePath);

    const fileExtension = path.extname(filePath).toLowerCase();

    let contentType;
    let dispositionFileName;

    if (fileExtension === ".mp4") {
      contentType = "video/mp4";
      dispositionFileName = "video.mp4";
    } else if (fileExtension === ".mp3") {
      contentType = "audio/mpeg";
      dispositionFileName = "audio.mp3";
    } else {
      res.status(400).json({ error: "Tipo de archivo no soportado" });
      return;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${dispositionFileName}"`
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al enviar el archivo");
      } else {
        fs.unlink(filePath).catch((err) =>
          console.error("Error al eliminar el archivo:", err)
        );
      }
    });
  } catch (error) {
    res.status(404).json({ error: "Archivo no encontrado" });
  }
});

module.exports = router;
