const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
const REPO_PATH = path.join(__dirname, "repertorio.json");

// Función para generar un ID único
let nextId = 1; // Iniciamos el contador en 1

function generateId() {
    return nextId++;
}

// Ruta para devolver la página web principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para obtener todas las canciones
app.get("/canciones", (req, res) => {
    try {
        const data = fs.readFileSync(REPO_PATH, "utf8");
        const canciones = JSON.parse(data);
        res.status(200).json(canciones);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la información" });
    }
});

// Ruta para obtener una canción por ID
app.get("/canciones/:id", (req, res) => {
    const { id } = req.params;
    try {
        const data = fs.readFileSync(REPO_PATH, "utf8");
        const canciones = JSON.parse(data);
        const cancion = canciones.find((c) => c.id == id);
        if (!cancion) {
            return res.status(404).json({ error: "Canción no encontrada" });
        }
        res.status(200).json(cancion);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la información" });
    }
});

// Ruta para agregar una nueva canción
app.post("/canciones", (req, res) => {
    const { titulo, artista, tono } = req.body;
    if (!titulo || !artista || !tono) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaCancion = {
        id: generateId(), // Generamos un ID único
        titulo,
        artista,
        tono
    };

    try {
        const data = fs.readFileSync(REPO_PATH, "utf8");
        const canciones = JSON.parse(data);
        canciones.push(nuevaCancion);
        fs.writeFileSync(REPO_PATH, JSON.stringify(canciones, null, 2));
        res.status(201).json({ message: "Canción agregada con éxito", nuevaCancion });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la canción" });
    }
});

// Ruta para actualizar una canción existente
app.put("/canciones/:id", (req, res) => {
    const { id } = req.params;
    const { titulo, artista, tono } = req.body;

    if (!titulo || !artista || !tono) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const data = fs.readFileSync(REPO_PATH, "utf8");
        let canciones = JSON.parse(data);
        const index = canciones.findIndex((c) => c.id == id);
        if (index === -1) {
            return res.status(404).json({ error: "Canción no encontrada" });
        }
        canciones[index] = { id, titulo, artista, tono };
        fs.writeFileSync(REPO_PATH, JSON.stringify(canciones, null, 2));
        res.status(200).json({ message: "Canción actualizada con éxito", cancionActualizada: canciones[index] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la canción" });
    }
});

// Ruta para eliminar una canción
app.delete("/canciones/:id", (req, res) => {
    const { id } = req.params;

    try {
        const data = fs.readFileSync(REPO_PATH, "utf8");
        let canciones = JSON.parse(data);
        const index = canciones.findIndex((c) => c.id == id);
        if (index === -1) {
            return res.status(404).json({ error: "Canción no encontrada" });
        }
        const cancionEliminada = canciones.splice(index, 1);
        fs.writeFileSync(REPO_PATH, JSON.stringify(canciones, null, 2));
        res.status(200).json({ message: "Canción eliminada con éxito", cancionEliminada });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la canción" });
    }
});

app.listen(PORT, () => console.log(`Servidor funcionando en el puerto ${PORT}`));
