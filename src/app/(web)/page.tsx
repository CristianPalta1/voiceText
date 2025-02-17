"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileProgress, setFileProgress] = useState<number>(0);
  const [selectedVoice, setSelectedVoice] = useState("Matilda"); // Por defecto: Matilda
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleDescription, setSampleDescription] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const SUPABASE_EDGE_FUNCTION = process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION;
  const SUPABASE_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN;

  // Mapeo de voces a URLs de muestra y descripciones (usa tus propias URLs)
  const voiceSamples: Record<string, { src: string; description: string }> = {
    Adam: {
      src: "https://www.w3schools.com/html/horse.mp3",
      description: "Voz grave y masculina, ideal para locales sofisticados.",
    },
    Rachel: {
      src: "https://www.w3schools.com/html/horse.mp3",
      description: "Voz suave y femenina, perfecta para restaurantes y cafés.",
    },
    Daniel: {
      src: "https://www.w3schools.com/html/horse.mp3",
      description: "Voz enérgica y profesional, ideal para presentaciones.",
    },
    Matilda: {
      src: "https://www.w3schools.com/html/horse.mp3",
      description:
        "Voz equilibrada y natural, la opción por defecto para múltiples aplicaciones.",
    },
  };

  // Estilos generales (mismos que antes)
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)",
    padding: "1rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    maxWidth: "600px",
    width: "100%",
    padding: "2rem",
    position: "relative",
  };

  const titleStyle: React.CSSProperties = {
    marginBottom: "1rem",
    textAlign: "center",
    color: "#333",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "1rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
    color: "#555",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#3f5efb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  const fileInputContainerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    display: "inline-block",
    width: "100%",
    marginBottom: "1rem",
  };

  const fileInputButtonStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    color: "#555",
    backgroundColor: "#f9f9f9",
    padding: "0.75rem",
    borderRadius: "4px",
    width: "100%",
    textAlign: "center",
    cursor: "pointer",
  };

  const hiddenFileInputStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  };

  const radioContainerStyle: React.CSSProperties = {
    marginBottom: "1rem",
  };

  const radioLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
    cursor: "pointer",
  };

  const playButtonStyle: React.CSSProperties = {
    marginLeft: "0.5rem",
    backgroundColor: "#eee",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    color: "red",
    marginTop: "0.5rem",
    textAlign: "center",
  };

  const audioContainerStyle: React.CSSProperties = {
    marginTop: "1rem",
    textAlign: "center",
  };

  const tooltipIconStyle: React.CSSProperties = {
    marginLeft: "0.5rem",
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#3f5efb",
  };

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "0.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: 10,
    width: "250px",
    marginTop: "0.5rem",
  };

  // Maneja el cambio en el input de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFileProgress(0);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);

      // Valida que el archivo sea de tipo TXT
      if (selectedFile.type !== "text/plain") {
        setError("Solo se aceptan archivos de texto (.txt).");
        setFile(null);
        return;
      }

      // Valida que el archivo no supere 1MB
      if (selectedFile.size > 1024 * 1024) {
        setError("El archivo no debe superar 1MB.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  // Maneja la reproducción de audio de muestra para una voz
  const playSample = (voiceOption: string) => {
    const sample = voiceSamples[voiceOption];
    if (sample && audioRef.current) {
      audioRef.current.src = sample.src;
      audioRef.current.play();
    }
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAudioDataUrl(null);

    if (!file) {
      setError("Debes seleccionar un archivo de texto.");
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    // Actualiza el progreso mientras se lee el archivo
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setFileProgress(percent);
      }
    };

    reader.onload = async () => {
      const text = reader.result as string;
      try {
        console.log(SUPABASE_EDGE_FUNCTION);
        
        if (!SUPABASE_EDGE_FUNCTION) {
          setError("API key is missing.");
          console.log("API key eleven labsis missing");
          setLoading(false);
          return;
        }
        const response = await fetch(SUPABASE_EDGE_FUNCTION, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ACCESS_TOKEN}`          
          },
          body: JSON.stringify({ text, voice: selectedVoice }),
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Error al generar el audio");
        } else {
          setAudioDataUrl(data.audioDataUrl);
        }
      } catch (err) {
        setError("Error de conexión");
        console.error(err);
      } finally {
        setLoading(false);
        setFileProgress(0);
      }
    };

    reader.onerror = () => {
      setError("Error leyendo el archivo.");
      setLoading(false);
      setFileProgress(0);
    };
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Texto a Voz</h1>
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#777" }}>
          Convierte tus archivos de texto en audio y elige la voz que prefieras.
        </p>
        <form onSubmit={handleSubmit}>
          {/* Selector de archivo */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Selecciona un archivo TXT (máximo 1MB):
            </label>
            <div style={fileInputContainerStyle}>
              <div style={fileInputButtonStyle}>Seleccionar Archivo</div>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileChange}
                style={hiddenFileInputStyle}
              />
            </div>
            {/* Muestra el nombre del archivo y el progreso */}
            {fileName && (
              <div style={{ marginTop: "0.5rem" }}>
                <strong>{fileName}</strong>
                {fileProgress > 0 && (
                  <progress
                    value={fileProgress}
                    max={100}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  >
                    {fileProgress}%
                  </progress>
                )}
              </div>
            )}
          </div>

          {/* Grupo de voces */}
          <div style={radioContainerStyle}>
            <label style={labelStyle}>Elige la voz:</label>
            {["Adam", "Rachel", "Daniel", "Matilda"].map((voiceOption) => (
              <div key={voiceOption} style={radioLabelStyle}>
                <input
                  type="radio"
                  name="voice"
                  value={voiceOption}
                  checked={selectedVoice === voiceOption}
                  onChange={() => setSelectedVoice(voiceOption)}
                  style={{ marginRight: "0.5rem" }}
                />
                {voiceOption}
                <button
                  type="button"
                  onClick={() => playSample(voiceOption)}
                  style={playButtonStyle}
                  title="Escuchar muestra"
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Generando audio..." : "Generar Audio"}
          </button>
        </form>
        {error && <p style={errorStyle}>{error}</p>}
        {audioDataUrl && (
          <div style={audioContainerStyle}>
            <audio controls src={audioDataUrl}>
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}
        {/* Elemento de audio oculto para reproducir muestras */}
        <audio ref={audioRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}