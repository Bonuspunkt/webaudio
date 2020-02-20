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

const canvasCtx = canvasEl.getContext("2d");
const startEl = document.getElementById("start");

const init = async () => {
  startEl.setAttribute("disabled", true);
  const audioCtx = new window.AudioContext();

  console.log(audioCtx.sampleRate);

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

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2 ** 15;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  source.connect(audioCtx.destination);

  const notes = [
    ["A"],
    ["A♯", "B♭"],
    ["B"],
    ["C"],
    ["C♯", "D♭"],
    ["D"],
    ["D♯", "E♭"],
    ["E"],
    ["F"],
    ["F♯", "F♭"],
    ["G"],
    ["G♯", "A♭"]
  ];

  // https://en.wikipedia.org/wiki/Piano_key_frequencies
  const getFrequency = note => 2 ** ((note - 49) / 12) * 440;
  const getPianoKey = frequency => 12 * Math.log2(frequency / 440) + 49;
  const getNote = pianoKey => {
    if (pianoKey < 1) return "";
    const zeroBasedKey = pianoKey - 1;
    return notes[zeroBasedKey % 12][0] + Math.floor(zeroBasedKey / 12);
  };

  // https://stackoverflow.com/a/44504975/6887257
  const stepSize = audioCtx.sampleRate / analyser.fftSize;
  console.log("sampleRate", audioCtx.sampleRate);
  console.log("fftSize", analyser.fftSize);
  console.log("stepSize", stepSize);

  const xFactor = 1; //WIDTH / analyser.fftSize;
  const yFactor = HEIGHT / 255;

  const draw = () => {
    analyser.getByteFrequencyData(dataArray);

    const highHits = [];
    for (let i = 1; i < bufferLength - 1; i++) {
      if (
        dataArray[i] > 128 &&
        dataArray[i - 1] < dataArray[i] &&
        dataArray[i] > dataArray[i + 1]
      ) {
        highHits.push(getNote(Math.round(getPianoKey((i + 0.5) * stepSize))));
      }
    }

    canvasCtx.clearRect(0, 0, 1024, 800);

    canvasCtx.font = "normal 32px Verdana";
    canvasCtx.fillText(`sampleRage: ${audioCtx.sampleRate}`, 10, 30);
    canvasCtx.fillText(`fftSize: ${analyser.fftSize}`, 10, 70);
    canvasCtx.fillText(`stepSize: ${stepSize}Hz`, 10, 110);
    canvasCtx.fillText(`hits: ${highHits.join()}`, 10, 150);

    for (let x = 0; x < bufferLength; x++) {
      var y = dataArray[x] * yFactor;

      canvasCtx.fillRect(x * xFactor, HEIGHT, xFactor, -y);
    }

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

startEl.addEventListener("click", init);
