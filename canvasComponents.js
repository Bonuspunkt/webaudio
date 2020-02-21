const createFpsCounter = canvasCtx => {
  let lastTimestamp = 0;
  return timestamp => {
    const duration = timestamp - lastTimestamp;
    const fps = Math.floor(1000 / duration);
    canvasCtx.fillText(`fps: ${fps}`, 600, 30);
    lastTimestamp = timestamp;
  };
};

const createNoteDisplay = canvasCtx => {
  const colors = ["#922", "#C33", "#F33", "#F93", "#FB1", "#FF0"];

  return aggregatedNotes => {
    canvasCtx.font = "normal 16px Verdana";

    aggregatedNotes.forEach((note, i) => {
      canvasCtx.fillStyle = "#222";
      canvasCtx.fillText(note.note, 730, 30 + i * 20);
      let x = 770;
      note.data.forEach(note => {
        canvasCtx.fillStyle = colors[note.octave % colors.length];

        const width = note.volume / (2 + note.octave);

        canvasCtx.fillRect(x, 10 + i * 20, width, 20);
        x += width;
      });
    });
  };
};

export { createFpsCounter, createNoteDisplay };
