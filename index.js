



const express = require('express')
require('dotenv').config()

const app = express()

// Configurar CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir solicitudes desde cualquier origen
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Permitir los métodos de solicitud especificados
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Permitir los encabezados especificados
  next();
});

app.use(express.static('public'))

app.use(express.json())

app.use('/api/youtube', require('./routes/youtube'))

app.listen(process.env.PORT, () => {
  console.log('Servidor corriendo en el puerto', process.env.PORT)
})

// Ruta al ejecutable de youtube-dl
// const youtubeDlPath = 'C:\\Users\\pablo\\AppData\\Local\\Programs\\Python\\Python312\\Scripts';
// const enlace = "https://www.youtube.com/watch?v=Cc5WeeJUfTk";


// (async () => {

//   try {
//     // Utiliza la ruta completa si youtubeDlPath está definido
//     const command = youtubeDlPath
//       ? `"${youtubeDlPath}\\youtube-dl" --ignore-errors -o "./videos/%(title)s.%(ext)s" ${enlace}`
//       : `youtube-dl -f 'worstvideo+worstaudio' -o './videos/%(title)s.%(ext)s' ${enlace}`;

//     const { stdout, stderr } = await exec(command);

//     console.log("Output:", stdout);
//     console.error("Error:::", stderr);
//   } catch (error) {
//     console.error("Error executing youtube-dl:", error.message);
//   }
// })();
// ( async () => {

//   try {
//     const { stdout, stderr } = await exec(`youtube-dl --list-formats ${enlace}`);

//     // Procesar la salida para extraer la información de "note" sin duplicados
//     const formatLines = stdout.split('\n');
//     const uniqueNotes = new Set();
    
//     formatLines
//       .map(line => line.trim().split(/\s+/))
//       .filter(parts => parts.length >= 2 && !['webpage', 'resolution', 'for'].includes(parts[3]) && parts[2] !== 'audio')
//       .forEach(parts => uniqueNotes.add(parts[3]));

//     const notes = Array.from(uniqueNotes);

//     if (notes.length > 0) {
//       console.log("Unique Notes:", notes);
//     } else {
//       console.log("No unique notes found in the output.");
//     }

//     console.error("Error:", stderr);
//   } catch (error) {
//     console.error("Error executing youtube-dl:", error.message);
//   }
// } )()

//miniatura
// ( async () => {
//   try {
//      // Obtener la URL de la miniatura
//      const { stdout: thumbnailUrl, stderr } = await exec(
//       `youtube-dl --get-thumbnail ${enlace}`
//     );

//     if (thumbnailUrl) {
//       console.log("Thumbnail URL:", thumbnailUrl.trim());
//     } else {
//       console.log("No thumbnail URL found.");
//     }

//     console.error("Error:", stderr);
//   } catch (error) {
    
//   }
// })()

//titulo video
// (async () => {
//   const enlace = "https://www.youtube.com/watch?v=UPN1CfbjlpI";

//   try {
//     const { stdout: videoTitle, stderr } = await exec(
//       `youtube-dl --get-title ${enlace}`
//     );

//     if (videoTitle) {
//       console.log("Video Title:", videoTitle.trim());
//     } else {
//       console.log("No video title found.");
//     }

//     console.error("Error:", stderr);
//   } catch (error) {
//     console.error("Error executing youtube-dl:", error.message);
//   }
// })();