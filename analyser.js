const noteDefinitions = [
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

const getNote = (() => {
  return pianoKey => {
    if (pianoKey < 1) return "";
    const zeroBasedKey = pianoKey - 1;
    return {
      note: noteDefinitions[zeroBasedKey % 12][0],
      octave: Math.floor(zeroBasedKey / 12)
    };
  };
})();

const createAnalyser = ({ sampleRate, fftSize }) => {
  console.log(`sampleRage: ${sampleRate}Hz`);
  console.log(`fftSize: ${fftSize}`);

  const stepSize = sampleRate / fftSize;
  console.log(`stepSize: ${stepSize}Hz`);

  // https://en.wikipedia.org/wiki/Piano_key_frequencies
  const getPianoKey = frequency => 12 * Math.log2(frequency / 440) + 49;

  return array => {
    const highHits = [];
    for (let i = 1; i < fftSize - 1; i++) {
      if (array[i] > 32 && array[i - 1] < array[i] && array[i] > array[i + 1]) {
        const pianoKey = Math.round(getPianoKey((i + 0.5) * stepSize));
        const note = getNote(pianoKey);
        if (!note) continue;

        highHits.push({
          volume: array[i],
          ...note
        });
      }
    }

    return noteDefinitions
      .map(names => names[0])
      .map(note => ({
        note,
        data: highHits
          .filter(n => n.note === note)
          .sort((a, b) => a.octave - b.octave)
      }));
  };
};

export { createAnalyser };
