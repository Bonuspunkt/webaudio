import { createAnalyser } from "./analyser.js";
import { createFpsCounter, createNoteDisplay } from "./canvasComponents.js";

const WIDTH = 1024;
const HEIGHT = 512;
const canvasEl = document.createElement("canvas");
canvasEl.id = "canvas";
canvasEl.width = WIDTH;
canvasEl.height = HEIGHT;
canvasEl.style.width = `${WIDTH}px`;
canvasEl.style.height = `${HEIGHT}px`;
canvasEl.style.border = "1px solid red";
document.body.appendChild(canvasEl);

const sliderEl = document.createElement("input");
sliderEl.id = "volume";
sliderEl.type = "range";
sliderEl.min = 0;
sliderEl.max = 2;
sliderEl.value = 1;
sliderEl.step = 0.1;
document.body.appendChild(sliderEl);

const sliderLabel = document.createElement("label");
sliderLabel.htmlFor = "volume";
sliderLabel.textContent = sliderEl.value;
document.body.appendChild(sliderLabel);

const canvasCtx = canvasEl.getContext("2d");
const startEl = document.getElementById("start");

const fpsCounter = createFpsCounter(canvasCtx);
const noteDisplay = createNoteDisplay(canvasCtx);

const init = async () => {
  startEl.setAttribute("disabled", true);

  const audioCtx = new window.AudioContext();

  if (!navigator.mediaDevices) {
    document.body.textContent = "missing mediaDevices support";
    return;
  }

  console.log("getUserMedia supported.");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });
  const source = audioCtx.createMediaStreamSource(stream);

  const analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2 ** 15;

  const analyser = createAnalyser({
    sampleRate: audioCtx.sampleRate,
    fftSize: analyserNode.fftSize
  });

  const bufferLength = analyserNode.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyserNode);

  const gainNode = audioCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  sliderEl.addEventListener("change", e => {
    gainNode.gain.setValueAtTime(sliderEl.value, audioCtx.currentTime);
    sliderLabel.textContent = sliderEl.value;
  });

  const xFactor = 1;
  const yFactor = HEIGHT / 255;

  canvasCtx.strokeStyle = "#0000";

  const draw = timestamp => {
    canvasCtx.clearRect(0, 0, 1024, 800);

    analyserNode.getByteFrequencyData(dataArray);
    const analysed = analyser(dataArray);

    fpsCounter(timestamp);
    noteDisplay(analysed);

    canvasCtx.fillStyle = "#000F";
    canvasCtx.font = "normal 32px Verdana";
    canvasCtx.fillText(`sampleRate: ${audioCtx.sampleRate}`, 10, 30);
    canvasCtx.fillText(`fftSize: ${analyserNode.fftSize}`, 10, 70);

    canvasCtx.fillStyle = "#8888";
    for (let x = 0; x < bufferLength; x++) {
      var y = dataArray[x] * yFactor;

      canvasCtx.fillRect(x * xFactor, HEIGHT, xFactor, -y);
    }

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

startEl.addEventListener("click", init);
