# Hướng Dẫn Tích Hợp Google Places API

## 1. Lấy Google Maps API Key

### Bước 1: Tạo Project trên Google Cloud Console
- Truy cập [Google Cloud Console](https://console.cloud.google.com)
- Đăng nhập bằng tài khoản Google của bạn
- Tạo một project mới: Click "Tạo dự án" → Nhập tên → Create

### Bước 2: Kích Hoạt APIs
- Vào **APIs & Services** → **Library**
- Tìm kiếm và bật các API sau:
  - **Maps JavaScript API** (cho bản đồ)
  - **Places API** (cho địa chỉ)
  - **Geocoding API** (tùy chọn, để chuyển đổi tọa độ)

### Bước 3: Tạo API Key
- Vào **APIs & Services** → **Credentials**
- Click **Create Credentials** → **API Key**
- Copy API key đã tạo

### Bước 4: Thiết Lập Hạn Chế (Bảo Mật)
- Chọn API Key vừa tạo
- Dưới **API restrictions**, chọn:
  - Maps JavaScript API
  - Places API
- Dưới **Application restrictions**, chọn **HTTP referrers**
- Thêm domain của bạn: `http://localhost:3000/*`, `http://localhost:5173/*`, `https://yourdomain.com/*`

## 2. Cấu Hình Frontend

### Bước 1: Cập nhật .env.local
Trong file `frontend/.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Thay thế `YOUR_API_KEY_HERE` bằng API key vừa tạo

### Bước 2: Xác Minh Cài Đặt
- Khởi động server frontend:
  ```bash
  cd frontend
  npm run dev
  ```
- Mở Profile page và thử thêm địa chỉ
- Trường Google Places Autocomplete sẽ tự động hoạt động

## 3. Cấu Hình Backend (tùy chọn)

Nếu muốn validate địa chỉ từ backend:

### Bước 1: Cài đặt package
```bash
cd backend
npm install @googlemaps/js-core axios
```

### Bước 2: Cập nhật userController.js
```javascript
const axios = require('axios');

// Validate address using Google Places API
const validateAddress = async (addressData) => {
  try {
    const { detail, coordinates } = addressData;
    
    if (!coordinates.lat || !coordinates.lng) {
      return { valid: false, message: 'Tọa độ không hợp lệ' };
    }
    
    // Verify using Google Geocoding API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.results.length > 0) {
      return { valid: true, message: 'Địa chỉ hợp lệ' };
    }
    
    return { valid: false, message: 'Địa chỉ không hợp lệ hoặc không tồn tại' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { valid: false, message: 'Lỗi xác minh địa chỉ' };
  }
};

// API endpoint
exports.addAddress = async (req, res) => {
  try {
    const { fullName, phone, detail, province, district, ward, coordinates, isDefault } = req.body;
    
    // Validate required fields
    if (!fullName || !phone || !detail) {
      return res.status(400).json({ message: 'Thông tin không đầy đủ' });
    }
    
    // Validate address with Google Places
    const validation = await validateAddress({ detail, coordinates });
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    
    // Save address to database
    const address = {
      fullName,
      phone,
      detail,
      province,
      district,
      ward,
      coordinates,
      isDefault: isDefault || false
    };
    
    // Add to user's addresses
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { addresses: address } },
      { new: true }
    );
    
    res.status(200).json({ message: 'Địa chỉ đã được thêm', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lưu địa chỉ', error: error.message });
  }
};
```

### Bước 3: Cập nhật .env backend
```
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

## 4. Dữ Liệu Địa Chỉ Được Lưu

Mỗi địa chỉ được lưu với cấu trúc:
```javascript
{
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  detail: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
  province: "TP. Hồ Chí Minh",
  district: "Quận 1",
  ward: "Phường Bến Nghé",
  coordinates: {
    lat: 10.773241,
    lng: 106.696477
  },
  isDefault: true,
  createdAt: "2025-02-28T10:30:00Z"
}
```

## 5. Các Tính Năng Nâng Cao

### Validation phía Client
- Kiểm tra tất cả trường bắt buộc
- Autocomplete từ Google Places
- Hiển thị tọa độ để xác minh

### Validation phía Server
- Xác minh tọa độ qua Geocoding API
- Kiểm tra địa chỉ tồn tại ở Việt Nam
- Lưu dữ liệu an toàn

### Tính Năng Bổ Sung
- Hiệu chỉnh địa chỉ hiện có
- Xóa địa chỉ
- Đặt địa chỉ mặc định
- Tính khoảng cách từ vị trí hiện tại

## 6. Troubleshooting

### Autocomplete không hiển thị
- Kiểm tra API Key có chính xác
- Xác minh **Maps JavaScript API** đã được bật
- Xác minh **Places API** đã được bật
- Kiểm tra HTTP referrer restrictions

### Lỗi "InvalidKeyMapError"
- API Key không hợp lệ hoặc đã hết hạn
- Tạo key mới trên Google Cloud Console

### Lỗi CORS
- Đảm bảo API Key được cấu hình cho HTTP Referrer chính xác

## 7. Biến Môi Trường Cần Thiết

**Frontend (.env.local):**
```
VITE_GOOGLE_MAPS_API_KEY=your_frontend_api_key
```

**Backend (.env):**
```
GOOGLE_MAPS_API_KEY=your_backend_api_key
```

---

**Hoàn Thành!** Giờ bạn đã có thể sử dụng Google Places API để thêm địa chỉ với autocomplete.
