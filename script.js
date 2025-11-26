const GAS_URL = "https://script.google.com/macros/s/AKfycbwQG1Ca6tEX-Nwr81A7KbhWZkOnv5Q10YMRqoAFzwJVKGdCIz2WcQU5BCyBI83kIhhH/exec"; // แก้ตรงนี้!

// เริ่ม Map
const map = L.map('map').setView([13.736717, 100.523186], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker;

// เมื่อคลิกบนแผนที่
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([lat, lng]).addTo(map);

  const sendData = { lat, lng };

  const res = await fetch(GAS_URL, {
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify(sendData)
  });

  const result = await res.json();
  alert("บันทึกตำแหน่งแล้ว!");
});
