const COLORS = [
  { min: 0.0, max: 0.1, value: "#41BC03", disabledValue: "#0d2500", selector: "#green" },
  { min: 0.1, max: 0.35, value: "#F8FF47", disabledValue: "#31330e", selector: "#yellow" },
  { min: 0.35, max: 1, value: "#E8372E", disabledValue: "#2e0b09", selector: "#red" }
];

function setColor(relativeVolume) {
  const { selector, value } = COLORS.find(c => c.min <= relativeVolume && c.max > relativeVolume);

  COLORS.forEach(color => $(color.selector).css("background-color",
    color.selector === selector
      ? color.value
      : color.disabledValue
  ));
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
  const analyzer = audioContext.createAnalyser();

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyzer);

  analyzer.fftSize = 32;
  var bufferLength = analyzer.frequencyBinCount;

  const data = new Uint8Array(bufferLength);
  await sleep(1000);

  while (true) {
    analyzer.getByteFrequencyData(data);
    const volume = data.reduce((acc, el) => acc + el) / (data.length * 0xFF);
    console.log(volume);

    if (!volume) {
      location.reload(); // Safari disables microphone once it has been in the background, so we need to reload the page.
    }

    setColor(volume);
    await sleep(100);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

$(document).ready(startRecording);
