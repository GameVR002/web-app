var userData = {
            uid: "<?= userData.uid; ?>",
            telephone: "<?= userData.telephone; ?>",
            otp: "<?= userData.otp; ?>"
        };

        function editTelephone() {
            document.getElementById("telephone-display").style.display = "none";
            document.getElementById("telephone-edit").style.display = "block";
        }

        function cancelEdit() {
            document.getElementById("telephone-display").style.display = "block";
            document.getElementById("telephone-edit").style.display = "none";
        }

        function saveTelephone() {
            var newTelephone = document.getElementById("telephone-input").value;

            google.script.run.withSuccessHandler(function(response) {
                if (response === 'success') {
                    document.getElementById("telephone-text").innerText = newTelephone;
                    userData.telephone = newTelephone;
                    cancelEdit();
                } else {
                    alert('Failed to save data. Please try again later.');
                }
            }).saveData({ id: userData.uid, telephone: newTelephone });
        }

        function toggleUID() {
            var uidElement = document.getElementById("uid-display");
            uidElement.style.display = uidElement.style.display === "none" ? "block" : "none";
        }


        google.script.run.withSuccessHandler(function(result) {
            if (result) {
                document.getElementById("otp-display").innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="fill: rgba(255, 196, 63, 1);">
                        <path d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.379-2.143-4.288-4.521-3.965C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.035C6.138 3.712 4 5.621 4 8c0 .173.012.347.035.521C2.802 9.215 2 10.535 2 12s.802 2.785 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.379 2.138 4.283 4.521 3.965C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.035C17.857 20.283 20 18.379 20 16c0-.173-.012-.347-.035-.521C21.198 14.785 22 13.465 22 12s-.802-2.785-2.035-3.479zm-9.01 7.895-3.667-3.714 1.424-1.404 2.257 2.286 4.327-4.294 1.408 1.42-5.749 5.706z"></path>
                    </svg>`;
            } else {
                document.getElementById("otp-display").innerText = "OTP ไม่ถูกต้อง";
            }
        }).verifyOTPAndClear(userData.uid, userData.otp);
  let map, userMarker, startMarker;
      let userLat = null, userLon = null;
      let startLat = 16.5554488, startLon = 99.7297617;

      let products = [];
      let cart = {};
      let orderType = "";
      let selectedProductType = "ประเภทสินค้า";
      let productType = "";      // ประเภทสินค้า (ปิ้งทาซอสหม่าล่า, ยำสามรส, ชาบู)
      let currentShabuType = ""; // ประเภทน้ำซุป (น้ำดำ, น้ำหม่าล่า)
      var userData = {
        uid: "<?= userData.uid; ?>",
        telephone: "<?= userData.telephone; ?>"
      };
      const checkoutBtn = document.getElementById("checkout-btn");

      document.getElementById("nextButton").addEventListener("click", function () {
        let cartOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasCart"));
        cartOffcanvas.hide();
        setTimeout(() => {
          new bootstrap.Offcanvas(document.getElementById("offcanvasSearch")).show();
        }, 300);
      });

      function getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            userLat = position.coords.latitude;
            userLon = position.coords.longitude;

            document.getElementById("location").innerHTML = `<b>พิกัดของคุณ:</b> ${userLat.toFixed(6)}, ${userLon.toFixed(6)}`;
            document.getElementById("distance").innerHTML = `<b>🚗 ระยะทางห่างจากร้าน:</b> ${calculateDistance(startLat, startLon, userLat, userLon).toFixed(2)} กม.`;

            checkoutBtn.disabled = false;
            showMap(userLat, userLon);
          }, error => {
            alert("ไม่สามารถดึงตำแหน่งได้: " + error.message);
          });
        } else {
          alert("เบราว์เซอร์ของคุณไม่รองรับการแชร์ตำแหน่ง");
        }
      }

      function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371, dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      }

      const toRad = degrees => degrees * (Math.PI / 180);

      function showMap(lat, lon) {
        if (!map) {
          map = L.map('map').setView([lat, lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
          startMarker = L.marker([startLat, startLon]).addTo(map).bindPopup("📍 ตำแหน่งร้าน").openPopup();
        }
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([lat, lon]).addTo(map).bindPopup("📍 ตำแหน่งของคุณ").openPopup();
        map.setView([lat, lon], 13);
      }

      function fetchProducts() {
        google.script.run.withSuccessHandler(renderProducts).getProducts();
      }

      ///รายการสินค้าและตะกร้า///
      function renderProducts(data) {
        products = data;
        let productList = document.getElementById("product-list");
        productList.innerHTML = data.map((product, index) => {
            let cartQty = cart[index] ? cart[index].quantity : 0; // ตรวจสอบว่ามีสินค้าอยู่ในตะกร้าหรือไม่
            let remainingStock = product.stock - cartQty; // คำนวณสต็อกคงเหลือจริง

            return `
            <div class="product-item">
              <a class="btn-wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
              </a>
              <figure>
                <a><img src="${product.image}" class="tab-image" alt="${product.name}"></a>
              </figure>
              <h3>${product.name}</h3>
              <span class="qty">เหลือ: <span id="stock-${index}">${remainingStock}</span> ชิ้น</span>
              <span class="price">ราคา: ${product.price} บาท</span>
              <div class="d-flex align-items-center justify-content-between">
                <div class="input-group product-qty">
                  <button class="btn btn-danger" onclick="updateCart(${index}, -1)">-</button>
                  <input type="text" class="form-control text-center" id="qty-${index}" value="${cartQty}" readonly>
                  <button class="btn btn-success" onclick="updateCart(${index}, 1)">+</button>
                </div>
              </div>
            </div>
            `;
        }).join("");

        renderCart();  
      }

      function updateCart(index, change) {
        if (!products[index]) {
            console.error(`สินค้า index ${index} ไม่ถูกต้อง`);
            return;
        }

        let product = products[index];
        if (!cart[index]) {
            cart[index] = { name: product.name, quantity: 0, price: product.price };
        }

        let newQty = (cart[index].quantity || 0) + change;
        
        if (newQty > 0 && newQty <= product.stock) {
            cart[index].quantity = newQty;
        } else if (newQty <= 0) {
            delete cart[index]; // ลบออกจากตะกร้า
        }

        renderCart();

        // อัปเดตค่าในหน้าเว็บ
        if (document.getElementById(`qty-${index}`)) {
            document.getElementById(`qty-${index}`).value = cart[index] ? cart[index].quantity : 0;
        }

        if (document.getElementById(`stock-${index}`)) {
            let remainingStock = product.stock - (cart[index] ? cart[index].quantity : 0);
            document.getElementById(`stock-${index}`).innerText = remainingStock;
        }
      }

      function renderCart() {
          let cartList = document.getElementById("cart-list");
          cartList.innerHTML = Object.entries(cart)
              .map(([index, item]) => `
              <li class="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                      <h6>${item.name}</h6><small>${item.quantity * item.price} บาท</small>
                  </div>
                  <span class="d-flex align-items-center">
                      <button class="btn btn-danger" onclick="updateCart(${index}, -1)">-</button>
                      <span class="mx-2" id="quantity-${index}">${item.quantity} ชิ้น</span>
                      <button class="btn btn-success" onclick="updateCart(${index}, 1)">+</button>
                      <button type="button" class="btn-close" onclick="removeFromCart(${index})"></button>
                  </span>
              </li>`).join("");

          let totalPrice = Object.values(cart).reduce((sum, item) => sum + item.quantity * item.price, 0);
          document.getElementById("total-price").innerText = ` ${totalPrice} บาท`;
          document.getElementById("cart-total-price").innerHTML = `<span>รวมทั้งหมด:</span> <strong>${totalPrice} บาท</strong>`;
      }

      function removeFromCart(index) {
          delete cart[index];
          renderCart();
          if (document.getElementById(`qty-${index}`)) {
              document.getElementById(`qty-${index}`).value = 0;
          }
      }

      // ฟังก์ชันนี้จะถูกเรียกเมื่อเลือกประเภทสินค้าที่ต้องการ
      function setProductType(type) {
          selectedProductType = type; // กำหนดประเภทสินค้า
          updateCartTitle(); // อัปเดตชื่อประเภทที่แสดงในตะกร้า
      }

      // ฟังก์ชันนี้ใช้สำหรับอัปเดตข้อความประเภทสินค้าในตะกร้า
      function updateCartTitle() {
        const cartTitle = document.getElementById("cart-type-title");
          if (cartTitle) {
              cartTitle.innerText = `ตะกร้าสินค้า: ${productType}`;
          }
      }

      // รอให้ DOM โหลดเสร็จแล้วจึงเริ่มทำงาน
      document.addEventListener("DOMContentLoaded", function() {
          setProductType("อาหาร"); // ตัวอย่างการตั้งค่าให้แสดงประเภท "อาหาร"
      });

      ///รายการสินค้าและตะกร้า///
      function checkout() { 
        if (!userData || !userData.uid) {
            alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
            return;
        }

        let orderItems = Object.values(cart).filter(item => item.quantity > 0);
        if (orderItems.length === 0) {
            alert("กรุณาเลือกสินค้าในตะกร้าก่อนทำการสั่งซื้อ!");
            return;
        }
        if (!orderType) {
            alert("กรุณาเลือกประเภทการจัดส่งก่อนทำการสั่งซื้อ!");
            return;
        }
        if (!userLat || !userLon) {
            alert("กรุณาหาพิกัดก่อนกดสั่งซื้อ");
            return;
        }

        let checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = true;
        checkoutBtn.innerText = "กำลังดำเนินการ...";

        let fullOrderData = {
            type: orderType,
            productType: productType,
            shabuType: currentShabuType,
            items: orderItems
        };

        let userOrderData = { 
            uid: userData.uid,  // ✅ เพิ่ม UID ของผู้ใช้
            lat: userLat, 
            lon: userLon 
        };

        console.log("ส่งข้อมูลคำสั่งซื้อ:", fullOrderData);

        google.script.run.withSuccessHandler(() => {
            alert(`สั่งซื้อสำเร็จ (${orderType}, ${productType}, ${currentShabuType})!`);
            cart = {};
            renderCart();
            fetchProducts();
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = "สั่งซื้อ";
        }).saveOrderAndUserClick(userOrderData, fullOrderData);
      }

      // เลือกประเภทการจัดส่ง
      function selectOrderType(type) {
          orderType = type;
          console.log("เลือกประเภทการจัดส่ง: ", orderType);

          // อัปเดตคลาสปุ่มที่เลือก
          document.getElementById("btn-delivery").classList.toggle("btn-active", type === "ส่งทันที");
          document.getElementById("btn-pickup").classList.toggle("btn-active", type === "รับที่ร้าน");

          // อัปเดตชื่อประเภทการจัดส่งในตะกร้า
          const orderTitle = document.getElementById("order-type-title");
          if (orderTitle) {
              orderTitle.innerText = `ประเภทการจัดส่ง: ${orderType}`;
          }
      }

      // ฟังก์ชันเลือกประเภทสินค้า
      function selectProductType(type) {
          productType = type;
          console.log("เลือกประเภทสินค้า: ", productType);

          // อัปเดตประเภทสินค้าในตะกร้า
          updateCartTitle();

          // จัดการปุ่มเลือกประเภทสินค้า
          document.getElementById("btn-piking-tasoss").classList.remove("btn-active");
          document.getElementById("btn-samros").classList.remove("btn-active");
          document.getElementById("btn-shabu").classList.remove("btn-active");

          if (type === 'ปิ้งทาซอสหม่าล่า') {
              document.getElementById("btn-piking-tasoss").classList.add("btn-active");
              toggleShabuOptions(false);
          } else if (type === 'ยำสามรส') {
              document.getElementById("btn-samros").classList.add("btn-active");
              toggleShabuOptions(false);
          } else if (type === 'ชาบู') {
              document.getElementById("btn-shabu").classList.add("btn-active");
              toggleShabuOptions(true);
          }
      }

      // เลือกประเภทน้ำซุปสำหรับชาบู
      function selectShabuType(type) {
          if (currentShabuType === type) {
              currentShabuType = "";
              console.log("ยกเลิกการเลือกน้ำซุป");
          } else {
              currentShabuType = type;
              console.log("เลือกประเภทน้ำซุป: " + currentShabuType);
          }
          updateShabuButtons();
          updateCartTitle();
      }

      // อัปเดตสถานะปุ่มน้ำซุป
      function updateShabuButtons() {
          const buttons = document.querySelectorAll('#shabu-options button');
          buttons.forEach(button => {
              button.classList.toggle('btn-active', button.innerText === currentShabuType);
          });
      }

      // แสดง/ซ่อนตัวเลือกน้ำซุปสำหรับชาบู
      function toggleShabuOptions(show) {
          let shabuOptions = document.getElementById("shabu-options");
          shabuOptions.style.display = show ? "block" : "none";
          if (!show) {
              currentShabuType = "";
              updateShabuButtons();
          }
      }

      // ฟังก์ชันอัปเดตชื่อประเภทสินค้าในตะกร้า
      function updateCartTitle() {
        let cartTitle = document.getElementById("cart-type-title");
        if (cartTitle) {
            let displayText = productType;
            if (productType === "ชาบู" && currentShabuType) {
                displayText += ` (${currentShabuType})`;
            }
            cartTitle.innerText = `ตะกร้าสินค้า: ${displayText || '-'}`;
        }
    }

      window.onload = fetchProducts;
