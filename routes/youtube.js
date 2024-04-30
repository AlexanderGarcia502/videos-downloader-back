const { Router } = require("express");
const router = Router();
const fs = require("fs");
const path = require("path");
const ControllerYoutubeDL = require("../controllers/youtube");

router.get("/information_video", async (req, res) => {
  const { link } = req.query;
  const controllerYoutubeDL = new ControllerYoutubeDL();
  try {
    const videoInformation = await controllerYoutubeDL.getVideoInformation(
      link
    );
    res.status(200).json({
      ok: true,
      data: videoInformation,
    });
  } catch (error) {
    console.error("Error executing youtube-dl:", error.message);
    res.status(400).json({
      ok: false,
      data: {
        message: error,
      },
    });
  }
});

router.post("/download_video", async (req, res) => {
  const controllerYoutubeDL = new ControllerYoutubeDL();

  try {
    const { link, resolution } = req.body;

    const { stdout, stderr, error } = await controllerYoutubeDL.downloadVideo(
      link,
      resolution
    );
    if (error) {
      res.status(500).json({
        ok: false,
        message: `Error al ejecutar el comando: ${error.message}`,
      });
      return;
    } else if (stderr) {
      res.status(500).json({
        ok: false,
        message: `Mensaje de error del proceso: ${stderr}`,
      });
      return;
    }

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.send(stdout);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error,
    });
  }
});

module.exports = router;
