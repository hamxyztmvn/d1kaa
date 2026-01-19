// Global variables
let currentProduct = {
    name: '',
    price: 0,
    quantity: 1
};

// Check QRIS image on page load
document.addEventListener('DOMContentLoaded', function() {
    checkQRISImage();
    
    // Event listener untuk quantity input
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            this.value = value;
            currentProduct.quantity = value;
            calculateTotal();
        });
    }
    
    // Event listener untuk klik di luar modal
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Event listener untuk QRIS modal
    const qrisModal = document.getElementById('qrisFallbackModal');
    if (qrisModal) {
        qrisModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeQRISModal();
            }
        });
    }
    
    // Event listener untuk video
    const video = document.getElementById('mainVideo');
    if (video) {
        video.preload = 'auto';
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('playsinline', '');
    }
    
    // Event listener untuk klik di manapun untuk trigger video sound
    document.addEventListener('click', function() {
        const video = document.getElementById('mainVideo');
        if (video && video.paused) {
            video.play().catch(e => {
                console.log("Butuh interaksi untuk play video");
            });
        }
    });
});

// Fungsi untuk check QRIS image
function checkQRISImage() {
    const qrisImg = document.getElementById('qrisImg');
    if (qrisImg) {
        qrisImg.onload = function() {
            console.log("QRIS image loaded successfully");
        };
        qrisImg.onerror = function() {
            console.log("QRIS image failed to load");
            // Tidak otomatis tampilkan modal, biarkan user klik dulu
        };
    }
}

// Fungsi untuk skip loading awal
function skipInitialLoading() {
    const loader = document.getElementById('initialLoader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        startVideoWithSound();
    }, 300);
}

// Fungsi untuk memulai video dengan sound
function startVideoWithSound() {
    const video = document.getElementById('mainVideo');
    if (!video) return;
    
    // Mulai dengan muted untuk autoplay
    video.muted = true;
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log("Video playing (muted)");
            
            // Coba unmute setelah video mulai play
            setTimeout(() => {
                video.muted = false;
                video.volume = 0.5;
            }, 500);
            
        }).catch(error => {
            console.log("Autoplay blocked");
        });
    }
}

// Auto hide loading awal setelah 1.5 detik
setTimeout(() => {
    const loader = document.getElementById('initialLoader');
    if (loader.style.display !== 'none') {
        skipInitialLoading();
    }
}, 1500);

// Fungsi untuk navigasi halaman
function navTo(pageId) {
    const pageLoader = document.getElementById('pageLoader');
    
    // Tampilkan loading
    pageLoader.style.display = 'flex';
    pageLoader.style.opacity = '1';

    // Sembunyikan halaman saat ini
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    setTimeout(() => {
        // Tampilkan halaman baru
        document.getElementById(pageId).classList.add('active');
        
        // Sembunyikan loading
        pageLoader.style.opacity = '0';
        setTimeout(() => {
            pageLoader.style.display = 'none';
        }, 200);
        
        // Jika kembali ke home, play video lagi
        if (pageId === 'home') {
            setTimeout(() => {
                startVideoWithSound();
            }, 100);
        }
    }, 150);
}

// Fungsi untuk order produk
function orderProduct(productName, productPrice) {
    // Set data produk saat ini
    currentProduct.name = productName;
    currentProduct.price = productPrice;
    currentProduct.quantity = 1;
    
    // Update modal
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = formatPrice(productPrice);
    document.getElementById('quantity').value = 1;
    
    // Hitung total
    calculateTotal();
    
    // Tampilkan modal
    document.getElementById('orderModal').style.display = 'flex';
}

// Fungsi untuk menutup modal order
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// Fungsi untuk menutup modal QRIS
function closeQRISModal() {
    document.getElementById('qrisFallbackModal').style.display = 'none';
}

// Fungsi untuk mengubah quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let currentValue = parseInt(quantityInput.value) || 1;
    let newValue = currentValue + change;
    
    // Batasi antara 1-10
    if (newValue >= 1 && newValue <= 10) {
        quantityInput.value = newValue;
        currentProduct.quantity = newValue;
        calculateTotal();
    }
}

// Fungsi untuk menghitung total
function calculateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const totalPrice = currentProduct.price * quantity;
    document.getElementById('totalPrice').textContent = formatPrice(totalPrice);
}

// Fungsi untuk format harga
function formatPrice(price) {
    return 'Rp ' + price.toLocaleString('id-ID');
}

// Fungsi untuk mengirim ke Telegram
function sendToTelegram() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const totalPrice = currentProduct.price * quantity;
    
    // Format pesan untuk Telegram sesuai permintaan
    const message = encodeURIComponent(
        `Halo Admin, Saya ingin order:\n\n` +
        `📋 ORDER DETAILS\n` +
        `────────────────────\n` +
        `🛒 Product: ${currentProduct.name}\n` +
        `📦 Quantity: ${quantity}\n` +
        `💰 Price per unit: ${formatPrice(currentProduct.price)}\n` +
        `💵 Total Price: ${formatPrice(totalPrice)}\n\n` +
        `✅ Please process my order.`
    );
    
    // Username Telegram Anda
    const telegramUsername = 'IsRealHamxyz';
    
    // Redirect ke Telegram
    window.open(`https://t.me/${telegramUsername}?text=${message}`, '_blank');
    
    // Tutup modal
    closeModal();
    
    // Tampilkan notifikasi
    showNotification('✅ Order details sent to Telegram!');
}

// Fungsi untuk show QRIS fallback
function showQRISFallback() {
    document.getElementById('qrisFallbackModal').style.display = 'flex';
}

// Fungsi untuk generate temporary QRIS
function generateQRISFallback() {
    const qrisImg = document.getElementById('qrisImg');
    
    // Buat QRIS placeholder menggunakan API QR code
    const qrText = 'https://t.me/IsRealHamxyz';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}&bgcolor=ffffff&color=000000`;
    
    // Ganti src image dengan QR code baru
    qrisImg.src = qrUrl;
    qrisImg.alt = 'Generated QRIS Code';
    
    // Tutup modal
    closeQRISModal();
    
    // Tampilkan notifikasi
    showNotification('🔳 Temporary QRIS generated!');
}

// Fungsi untuk copy QRIS link
function copyQRISLink() {
    const qrisImg = document.getElementById('qrisImg');
    const qrisUrl = qrisImg.src;
    
    // Buat temporary input untuk copy
    const tempInput = document.createElement('input');
    tempInput.value = qrisUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy ke clipboard
    navigator.clipboard.writeText(qrisUrl)
        .then(() => {
            showNotification('📋 QRIS link copied to clipboard!');
        })
        .catch(err => {
            document.execCommand('copy');
            showNotification('📋 QRIS link copied!');
        });
    
    // Hapus temporary input
    document.body.removeChild(tempInput);
}

// Fungsi untuk download QRIS
function downloadQR() {
    const qrisImg = document.getElementById('qrisImg');
    
    // Check if image is loaded
    if (!qrisImg.complete || qrisImg.naturalWidth === 0) {
        showNotification('⚠️ QRIS image not loaded!');
        return;
    }
    
    // Coba download
    try {
        const link = document.createElement('a');
        link.href = qrisImg.src;
        link.download = "QRIS_HAMXYZ.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('📁 QRIS downloaded successfully!');
    } catch (error) {
        console.error("Download error:", error);
        showNotification('❌ Failed to download QRIS!');
    }
}

// Fungsi untuk copy nomor DANA
function copyNum() {
    navigator.clipboard.writeText("081335783149")
        .then(() => {
            showNotification('📋 Nomor DANA berhasil disalin!');
        })
        .catch(err => {
            console.error('Gagal menyalin: ', err);
            alert("Gagal menyalin, silakan salin manual: 081335783149");
        });
}

// Fungsi untuk notifikasi
function showNotification(message) {
    // Hapus notifikasi lama jika ada
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--electric-blue);
        color: #000;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 700;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        font-family: 'Plus Jakarta Sans', sans-serif;
        box-shadow: 0 5px 15px rgba(0, 229, 255, 0.3);
        white-space: nowrap;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Tambahkan style untuk animasi notifikasi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes slideDown {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);
