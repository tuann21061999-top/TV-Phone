import React, { useState, useEffect } from 'react';
import { Download, Wallet, ShoppingBag, Users, LineChart as ChartIcon, TrendingUp, ShieldCheck, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState({
    overview: { totalRevenue: 0, totalProfit: 0, totalOrders: 0, totalUsers: 0 },
    chartData: [],
    topProducts: [],
    warrantyStats: [],
    recentOrders: []
  });
  const [favoriteStats, setFavoriteStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warrantyFilter, setWarrantyFilter] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [dashRes, favRes] = await Promise.all([
          axios.get("http://localhost:5000/api/orders/admin/stats/dashboard", { headers }),
          axios.get("http://localhost:5000/api/favorites/admin/stats", { headers }).catch(() => ({ data: [] })),
        ]);

        setData(dashRes.data);
        setFavoriteStats(favRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'Tr';
    return amount.toLocaleString() + 'đ';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'done': return { text: 'Đã giao', class: 'badge-done' };
      case 'shipping': return { text: 'Đang giao', class: 'badge-shipping' };
      case 'preparing': return { text: 'Đang đóng gói', class: 'badge-shipping' };
      case 'pending': return { text: 'Chờ thanh toán', class: 'badge-pending' };
      case 'waiting_approval': return { text: 'Chờ xác nhận', class: 'badge-pending' };
      case 'cancelled': return { text: 'Đã hủy', class: 'badge-cancelled' };
      case 'returned': return { text: 'Trả hàng', class: 'badge-cancelled' };
      default: return { text: status, class: 'badge-pending' };
    }
  };

  if (loading) return <div className="dashboard-loading">Đang tổng hợp dữ liệu từ hệ thống...</div>;

  return (
    <div className="admin-dashboard-page">

      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-title">
          <h1>Tổng quan hệ thống</h1>
          <p>Dữ liệu được cập nhật theo thời gian thực (Real-time) từ các đơn hàng thành công.</p>
        </div>
        <button className="btn-export"><Download size={18} /> Xuất báo cáo</button>
      </div>

      {/* 4 THẺ TỔNG QUAN */}
      <div className="dash-grid-4">
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon-wrapper blue"><Wallet size={20} /></div>
            <span className="trend up"><TrendingUp size={14} /> Thực tế</span>
          </div>
          <p>Tổng Doanh Thu</p>
          <h3>{data.overview.totalRevenue.toLocaleString()}đ</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon-wrapper green"><ChartIcon size={20} /></div>
            <span className="trend up"><TrendingUp size={14} /> Thực tế</span>
          </div>
          <p>Tổng Lợi Nhuận Gộp</p>
          <h3 style={{ color: '#10b981' }}>{data.overview.totalProfit.toLocaleString()}đ</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon-wrapper orange"><ShoppingBag size={20} /></div>
          </div>
          <p>Đơn Hàng Mới (Tháng này)</p>
          <h3>{data.overview.totalOrders.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon-wrapper purple"><Users size={20} /></div>
          </div>
          <p>Tổng Khách Hàng</p>
          <h3>{data.overview.totalUsers.toLocaleString()}</h3>
        </div>
      </div>

      {/* BIỂU ĐỒ & TOP SẢN PHẨM */}
      <div className="dash-grid-2-1">

        {/* Biểu đồ */}
        <div className="dash-box">
          <div className="box-header">
            <h3>Doanh thu theo tháng (Đơn hoàn thành)</h3>
            <span className="box-subtitle">6 tháng gần nhất</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sản phẩm */}
        <div className="dash-box">
          <div className="box-header">
            <h3>Sản phẩm bán chạy</h3>
          </div>
          <div className="top-products-list">
            {data.topProducts.length === 0 ? <p className="text-muted">Chưa có dữ liệu bán hàng</p> : null}
            {data.topProducts.map((prod, idx) => (
              <div key={idx} className="top-product-item">
                <img src={prod.image} alt={prod.name} />
                <div className="tp-info">
                  <h4>{prod.name}</h4>
                  <p>{prod.sales} lượt bán</p>
                </div>
                <div className="tp-revenue">{formatCurrency(prod.revenue)}</div>
              </div>
            ))}
          </div>
          <Link to="/admin/products" className="btn-view-all">Xem kho hàng</Link>
        </div>
      </div>

      {/* BẢNG ĐƠN HÀNG VÀ BẢO HÀNH */}
      <div className="dash-grid-2-1">

        {/* Danh sách đơn mới */}
        <div className="dash-box">
          <div className="box-header">
            <h3>Đơn hàng mới nhất</h3>
            <Link to="/admin/orders">Tất cả đơn hàng</Link>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>KHÁCH HÀNG</th>
                <th>SẢN PHẨM</th>
                <th>GIÁ TRỊ</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map(order => {
                const statusObj = getStatusStyle(order.status);
                const initial = order.shippingInfo?.fullName?.charAt(0) || "U";
                return (
                  <tr key={order._id}>
                    <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
                    <td>
                      <div className="customer-cell">
                        <div className="avatar-mini">{initial}</div>
                        <span>{order.shippingInfo?.fullName}</span>
                      </div>
                    </td>
                    <td className="truncate-text">{order.items[0]?.name} {order.items.length > 1 ? `(+${order.items.length - 1})` : ''}</td>
                    <td><strong>{order.total.toLocaleString()}đ</strong></td>
                    <td><span className={`status-badge ${statusObj.class}`}>{statusObj.text}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Thống kê Gói Bảo Hành */}
        <div className="dash-box">
          <div className="box-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} color="#8b5cf6" /> Dịch vụ Bảo hành</h3>
            <select value={warrantyFilter} onChange={(e) => setWarrantyFilter(e.target.value)} className="warranty-select">
              <option value="all">Tất cả</option>
              {data.warrantyStats.map(w => <option key={w._id} value={w._id}>{w._id || 'Cơ bản'}</option>)}
            </select>
          </div>
          <div className="warranty-list">
            {data.warrantyStats.filter(w => warrantyFilter === "all" || w._id === warrantyFilter).map((w, idx) => (
              <div key={idx} className="warranty-item">
                <div className="w-info">
                  <h4>{w._id || "Bảo hành Cơ bản"}</h4>
                  <p>Đã bán: <strong>{w.count}</strong> gói</p>
                </div>
                <div className="w-revenue">+{formatCurrency(w.revenue)}</div>
              </div>
            ))}
            {data.warrantyStats.length === 0 && <p className="text-muted">Chưa có dữ liệu bảo hành</p>}
          </div>
        </div>

      </div>

      {/* TOP 10 SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT */}
      <div className="dash-box" style={{ marginTop: '24px' }}>
        <div className="box-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="#ef4444" /> Top 10 sản phẩm được yêu thích
          </h3>
          <span className="box-subtitle">Dữ liệu từ lượt yêu thích của khách hàng</span>
        </div>
        <div className="top-products-list">
          {favoriteStats.length === 0 ? (
            <p className="text-muted">Chưa có dữ liệu yêu thích</p>
          ) : (
            favoriteStats.map((item, idx) => (
              <div key={item.productId} className="top-product-item">
                <div className="fav-rank">#{idx + 1}</div>
                <img src={item.productImage || "/no-image.png"} alt={item.productName} />
                <div className="tp-info">
                  <h4>{item.productName}</h4>
                  <p style={{ color: '#ef4444' }}>
                    <Heart size={13} fill="#ef4444" stroke="#ef4444" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {item.favoriteCount} lượt thích
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;