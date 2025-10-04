// Suara auto-play
function playIntro() {
  const sound = document.getElementById("introSound");
  sound.play().catch(() => {});
}

// Daftar device valid
const validDevices = {
  tecno: [
    { model: "KL5n", name: "Tecno Spark 30C" },
    { model: "KM2", name: "Tecno Spark 20C" },
    { model: "KG1", name: "Tecno Spark Go 1" }
  ],
  infinix: [
    { model: "X671", name: "Infinix 50i" },
    { model: "X685", name: "Infinix GT 50" },
    { model: "X662", name: "Infinix 40i" }
  ],
  itel: [
    { model: "A70", name: "Itel A70" },
    { model: "P40", name: "Itel P40" },
    { model: "V2", name: "Itel Vision 2" }
  ]
};

// Toggle buka/tutup
function toggleAccordion(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById("arrow-" + id);

  if (body.style.display === "block") {
    body.style.display = "none";
    arrow.textContent = "v";
  } else {
    body.style.display = "block";
    arrow.textContent = "^";
  }
}

// Auto download kalau valid
function checkDownload(brand, modelId, nameId) {
  const model = document.getElementById(modelId).value.trim();
  const name = document.getElementById(nameId).value.trim();

  const valid = validDevices[brand].some(
    dev =>
      dev.model.toLowerCase() === model.toLowerCase() &&
      dev.name.toLowerCase() === name.toLowerCase()
  );

  if (valid) {
    const link = document.createElement("a");
    link.href = "https://www.mediafire.com/file/r99pwkek2row4po/BarLens.apk/file";
    link.target = "_blank"; // buka di tab baru
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// Listener input buat semua brand
["tecno", "infinix", "itel"].forEach(brand => {
  document
    .getElementById(`${brand}-model`)
    .addEventListener("input", () => checkDownload(brand, `${brand}-model`, `${brand}-name`));
  document
    .getElementById(`${brand}-name`)
    .addEventListener("input", () => checkDownload(brand, `${brand}-model`, `${brand}-name`));
});