const URL = "./my_model/";
let model, webcam, maxPredictions;
let isRunning = false;
let currentFacingMode = "user";
let filterOn = false;

// DOM elements
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const flipBtn = document.getElementById("flipBtn");
const themeBtn = document.getElementById("themeBtn");
const saveBtn = document.getElementById("saveBtn");
const filterBtn = document.getElementById("filterBtn");
const cameraContainer = document.getElementById("camera-container");

const bars = {
  organic: document.getElementById("organic-bar"),
  inorganic: document.getElementById("inorganic-bar"),
  hazardous: document.getElementById("hazardous-bar")
};
const labels = {
  organic: document.getElementById("organic-label"),
  inorganic: document.getElementById("inorganic-label"),
  hazardous: document.getElementById("hazardous-label")
};

const historyList = document.getElementById("history-list");

// Buttons events
startBtn.addEventListener("click", initCamera);
stopBtn.addEventListener("click", stopCamera);
flipBtn.addEventListener("click", flipCamera);
themeBtn.addEventListener("click", toggleTheme);
saveBtn.addEventListener("click", saveSnapshot);
filterBtn.addEventListener("click", toggleFilter);

// Initialize camera & model
async function initCamera() {
  if (isRunning) return;
  model = await tmImage.load(URL + "model.json", URL + "metadata.json");
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(400, 300, true);
  await webcam.setup({ facingMode: currentFacingMode }).catch(()=>{ alert("No camera found"); return; });
  await webcam.play();

  cameraContainer.innerHTML = "";
  cameraContainer.appendChild(webcam.canvas);
  webcam.canvas.style.filter = filterOn ? "contrast(1.5) hue-rotate(60deg)" : "none";

  isRunning = true;
  window.requestAnimationFrame(loop);
}

// Stop camera
function stopCamera() { if (!isRunning) return; webcam.stop(); isRunning=false; }

// Flip camera
async function flipCamera() { stopCamera(); currentFacingMode = currentFacingMode==="user"?"environment":"user"; await initCamera(); }

// Loop
async function loop() {
  if (!isRunning) return;
  webcam.update();
  webcam.canvas.style.filter = filterOn ? "contrast(1.5) hue-rotate(60deg)" : "none";
  await predict();
  window.requestAnimationFrame(loop);
}

// Prediction logic
async function predict() {
  const prediction = await model.predict(webcam.canvas);

  prediction.forEach(p => {
    let percent = (p.probability*100).toFixed(1)+"%";
    let name = p.className.trim().toLowerCase();
    if(name==="organic"){ 
      bars.organic.style.width=percent; 
      labels.organic.innerText=percent; 
    }
    else if(name==="in-organic"){ 
      bars.inorganic.style.width=percent; 
      labels.inorganic.innerText=percent; 
    }
    else if(name==="hazardous"){ 
      bars.hazardous.style.width=percent; 
      labels.hazardous.innerText=percent; 
    }
  });
}


// Theme toggle
function toggleTheme() { document.body.classList.toggle("light"); }

// Save snapshot
function saveSnapshot(){
  if(!isRunning) return;
  const link = document.createElement("a");
  link.download = "snapshot.png";
  link.href = webcam.canvas.toDataURL();
  link.click();
}

// Camera filter
function toggleFilter(){ filterOn = !filterOn; }
