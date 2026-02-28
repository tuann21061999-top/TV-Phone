import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Package, 
  MapPin, 
  Tag, 
  LogOut, 
  ChevronRight, 
  Smartphone 
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    navigate("/login");
    return;
  }

  const parsedUser = JSON.parse(savedUser);

  // 👉 Nếu là admin thì chuyển sang trang Admin
  if (parsedUser.role === "admin") {
    navigate("/admin");
    return;
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setUser(parsedUser);
}, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload(); // Đảm bảo header cập nhật lại
  };

  if (!user) return null; // Tránh lỗi render khi chưa kịp lấy user

  return (
    <div className="profile-page">
      <Header />
      <div className="container profile-container">
        <div className="profile-grid">
          
          {/* Sidebar bên trái */}
          <aside className="profile-sidebar">
            <div className="user-info-card">
              <div className="avatar-placeholder">
                <img src="https://via.placeholder.com/80" alt="Avatar" />
              </div>
              <div className="user-meta">
                <h3>{user.name}</h3>
                <span className="badge">KHÁCH HÀNG THÂN THIẾT</span>
              </div>
            </div>

            <nav className="profile-nav">
              <button className="nav-item active">
                <User size={20} /> <span>Thông tin cá nhân</span>
              </button>
              <button className="nav-item">
                <Package size={20} /> <span>Đơn hàng của tôi</span>
              </button>
              <button className="nav-item">
                <MapPin size={20} /> <span>Sổ địa chỉ</span>
              </button>
              <button className="nav-item">
                <Tag size={20} /> <span>Mã giảm giá</span>
              </button>
              <hr />
              <button className="nav-item logout-btn" onClick={handleLogout}>
                <LogOut size={20} /> <span>Đăng xuất</span>
              </button>
            </nav>
          </aside>

          {/* Nội dung chính bên phải */}
          <main className="profile-content">
            <section className="profile-section">
              <div className="section-header">
                <h2>Hồ sơ cá nhân</h2>
                <button className="edit-btn">Chỉnh sửa hồ sơ</button>
              </div>
              <p className="section-desc">Quản lý thông tin tài khoản và đơn hàng của bạn</p>

              <div className="info-list">
                <div className="info-item">
                  <span className="label">Họ tên</span>
                  <span className="value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="info-item">
  <span className="label">Số điện thoại</span>
  <span className="value">
    {/* Thử hiển thị cả user.phone và user.phoneNumber để kiểm tra */}
    {user.phone || user.phoneNumber || "Chưa cập nhật"}
  </span>
</div>
              </div>
            </section>

            <section className="orders-section">
              <div className="section-header">
                <h2>Đơn hàng gần đây</h2>
                <a href="/orders" className="view-all">Xem tất cả</a>
              </div>
              
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>MÃ ĐƠN HÀNG</th>
                      <th>SẢN PHẨM</th>
                      <th>NGÀY ĐẶT</th>
                      <th>TỔNG TIỀN</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Đây là dữ liệu mẫu, sau này bạn sẽ map từ API Order */}
                    <tr>
                      <td><span className="order-id">#TS-9821</span></td>
                      <td>iPhone 15 Pro Max 256GB</td>
                      <td>12/10/2023</td>
                      <td><strong>32.990.000đ</strong></td>
                      <td><span className="status shipping">Đang giao</span></td>
                    </tr>
                    <tr>
                      <td><span className="order-id">#TS-9750</span></td>
                      <td>Ốp lưng Silicone MagSafe</td>
                      <td>05/10/2023</td>
                      <td><strong>1.290.000đ</strong></td>
                      <td><span className="status completed">Đã hoàn thành</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;