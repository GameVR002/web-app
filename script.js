const GAS_URL = "https://script.google.com/macros/s/AKfycbwQG1Ca6tEX-Nwr81A7KbhWZkOnv5Q10YMRqoAFzwJVKGdCIz2WcQU5BCyBI83kIhhH/exec"; // แก้ตรงนี้!

// Init map
const map = L.map('map').setView([13.736717, 100.523186], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker;

// คลิกบนแผนที่ = บันทึกตำแหน่ง
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  placeMarker(lat, lng);
  sendToGAS(lat, lng);
});

// ----------------------
// ปุ่มหาตำแหน่งปัจจุบัน
// ----------------------
document.getElementById("btnLocate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง (GPS)");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      placeMarker(lat, lng);
      map.setView([lat, lng], 17);

      sendToGAS(lat, lng);
      alert("บันทึกตำแหน่งปัจจุบันเรียบร้อย");
    },
    (err) => {
      alert("ไม่สามารถหาตำแหน่งได้: " + err.message);
    }
  );
});

// ----------------------
// ฟังก์ชันปักหมุด
// ----------------------
function placeMarker(lat, lng) {
  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lng]).addTo(map);
}

// ----------------------
// ฟังก์ชันส่งข้อมูลไป GAS
// ----------------------
async function sendToGAS(lat, lng) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ lat, lng }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    console.log("GAS response:", data);
  } catch (e) {
    console.error("Error sending to GAS:", e);
  }
}
