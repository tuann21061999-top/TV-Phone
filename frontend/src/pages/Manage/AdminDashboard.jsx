import React, { useState, useEffect } from 'react';
import { Download, Wallet, ShoppingBag, Users, LineChart as ChartIcon, TrendingUp, ShieldCheck, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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

  const [filterPeriod, setFilterPeriod] = useState("year"); // "year", "month", "day"
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [topProductLimit, setTopProductLimit] = useState(4);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, favRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/orders/admin/stats/dashboard?period=${filterPeriod}&year=${filterYear}&month=${filterMonth}&topProductLimit=${topProductLimit}`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/favorites/admin/stats`, { headers }).catch(() => ({ data: [] })),
      ]);

      setData(dashRes.data);
      setFavoriteStats(favRes.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPeriod, filterYear, filterMonth, topProductLimit]);

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

  const handleExportReport = () => {
    try {
      // Thêm BOM để Excel đọc được tiếng Việt (UTF-8)
      let csvContent = "\uFEFF"; 
      
      // 1. Overview
      csvContent += "TỔNG QUAN HỆ THỐNG\n";
      csvContent += "Tổng Doanh Thu,Tổng Lợi Nhuận Gộp,Đơn Hàng Mới,Tổng Khách Hàng\n";
      csvContent += `"${data.overview.totalRevenue}","${data.overview.totalProfit}","${data.overview.totalOrders}","${data.overview.totalUsers}"\n\n`;

      // 2. Chart Data
      csvContent += "CHI TIẾT DOANH THU\n";
      csvContent += "Thời gian,Doanh thu\n";
      data.chartData.forEach(row => {
        csvContent += `"${row.name}","${row.revenue}"\n`;
      });
      csvContent += "\n";

      // 3. Top Products
      csvContent += "TOP SẢN PHẨM BÁN CHẠY\n";
      csvContent += "Tên sản phẩm,Lượt bán,Doanh thu\n";
      data.topProducts.forEach(prod => {
        csvContent += `"${prod.name}","${prod.sales}","${prod.revenue}"\n`;
      });

      // Tạo Blob và tự động tải xuống
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Bao_Cao_Doanh_Thu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất báo cáo!");
    }
  };

  if (loading) return <div className="dashboard-loading">Đang tổng hợp dữ liệu từ hệ thống...</div>;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 m-0">Dữ liệu được cập nhật theo thời gian thực (Real-time) từ các đơn hàng thành công.</p>
        </div>
        <button onClick={handleExportReport} className="flex items-center gap-2 bg-white border border-slate-200 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-sm shrink-0 cursor-pointer">
          <Download size={18} /> Xuất báo cáo
        </button>
      </div>

      {/* 4 THẺ TỔNG QUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600"><Wallet size={20} /></div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-600"><TrendingUp size={14} /> Thực tế</span>
          </div>
          <p className="text-sm text-slate-500 mb-1.5">Tổng Doanh Thu</p>
          <h3 className="text-2xl font-bold text-slate-900">{data.overview.totalRevenue.toLocaleString()}đ</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600"><ChartIcon size={20} /></div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-600"><TrendingUp size={14} /> Thực tế</span>
          </div>
          <p className="text-sm text-slate-500 mb-1.5">Tổng Lợi Nhuận Gộp</p>
          <h3 className="text-2xl font-bold text-emerald-500">{data.overview.totalProfit.toLocaleString()}đ</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500"><ShoppingBag size={20} /></div>
          </div>
          <p className="text-sm text-slate-500 mb-1.5">Đơn Hàng Mới (Tháng này)</p>
          <h3 className="text-2xl font-bold text-slate-900">{data.overview.totalOrders.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600"><Users size={20} /></div>
          </div>
          <p className="text-sm text-slate-500 mb-1.5">Tổng Khách Hàng</p>
          <h3 className="text-2xl font-bold text-slate-900">{data.overview.totalUsers.toLocaleString()}</h3>
        </div>
      </div>

      {/* BIỂU ĐỒ & TOP SẢN PHẨM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Biểu đồ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-5 gap-3">
            <h3 className="text-base font-semibold text-slate-900 m-0">Doanh thu</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-sm text-slate-700 bg-slate-50 cursor-pointer"
              >
                <option value="year">Theo Các Năm</option>
                <option value="month">Theo Tháng (trong năm)</option>
                <option value="day">Theo Ngày (trong tháng)</option>
              </select>

              {(filterPeriod === "month" || filterPeriod === "day") && (
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-sm text-slate-700 bg-slate-50 cursor-pointer"
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>Năm {y}</option>;
                  })}
                </select>
              )}

              {filterPeriod === "day" && (
                <select 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-sm text-slate-700 bg-slate-50 cursor-pointer"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="w-full">
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-900 m-0">Sản phẩm bán chạy</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {data.topProducts.length === 0 ? <p className="text-slate-500 text-sm">Chưa có dữ liệu bán hàng</p> : null}
            {data.topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="m-0 font-semibold text-sm text-slate-900 truncate">{prod.name}</h4>
                  <p className="m-0 text-xs text-slate-500">{prod.sales} lượt bán</p>
                </div>
                <div className="font-bold text-blue-600 text-sm whitespace-nowrap">{formatCurrency(prod.revenue)}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto px-1 pt-4 space-y-2">
            {topProductLimit === 4 ? (
              <button 
                onClick={() => setTopProductLimit(10)}
                className="w-full p-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Tải thêm (Xem top 10)
              </button>
            ) : (
              <button 
                onClick={() => setTopProductLimit(4)}
                className="w-full p-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Thu gọn
              </button>
            )}
            <Link to="/admin/products" className="block text-center w-full p-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
              Xem kho hàng
            </Link>
          </div>
        </div>
      </div>

      {/* BẢNG ĐƠN HÀNG VÀ BẢO HÀNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Danh sách đơn mới */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-x-auto">
          <div className="flex justify-between items-center mb-5 min-w-[500px]">
            <h3 className="text-base font-semibold text-slate-900 m-0">Đơn hàng mới nhất</h3>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Tất cả đơn hàng</Link>
          </div>
          <div className="min-w-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-slate-500 text-xs font-semibold border-b border-slate-200">MÃ ĐƠN</th>
                  <th className="p-3 text-slate-500 text-xs font-semibold border-b border-slate-200">KHÁCH HÀNG</th>
                  <th className="p-3 text-slate-500 text-xs font-semibold border-b border-slate-200">SẢN PHẨM</th>
                  <th className="p-3 text-slate-500 text-xs font-semibold border-b border-slate-200">GIÁ TRỊ</th>
                  <th className="p-3 text-slate-500 text-xs font-semibold border-b border-slate-200">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => {
                  const statusObj = getStatusStyle(order.status);
                  const initial = order.shippingInfo?.fullName?.charAt(0) || "U";
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-3 text-sm text-slate-700 border-b border-slate-100">
                        <strong className="text-slate-900">#{order._id.slice(-6).toUpperCase()}</strong>
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-700 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {initial}
                          </div>
                          <span className="font-medium">{order.shippingInfo?.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-700 border-b border-slate-100 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {order.items[0]?.name} {order.items.length > 1 ? `(+${order.items.length - 1})` : ''}
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-700 border-b border-slate-100">
                        <strong className="text-slate-900">{order.total.toLocaleString()}đ</strong>
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-700 border-b border-slate-100">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusObj.class === 'badge-done' ? 'bg-emerald-50 text-emerald-600' :
                          statusObj.class === 'badge-shipping' ? 'bg-blue-50 text-blue-600' :
                            statusObj.class === 'badge-pending' ? 'bg-amber-50 text-amber-600' :
                              statusObj.class === 'badge-cancelled' ? 'bg-red-50 text-red-600' :
                                'bg-slate-50 text-slate-600'
                          }`}>
                          {statusObj.text}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thống kê Gói Bảo Hành */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-slate-900 m-0 flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-500" /> Dịch vụ Bảo hành
            </h3>
            <select
              value={warrantyFilter}
              onChange={(e) => setWarrantyFilter(e.target.value)}
              className="px-2 py-1 rounded-md border border-slate-200 outline-none text-sm text-slate-700 bg-white"
            >
              <option value="all">Tất cả</option>
              {data.warrantyStats.map(w => <option key={w._id} value={w._id}>{w._id || 'Cơ bản'}</option>)}
            </select>
          </div>
          <div>
            {data.warrantyStats.filter(w => warrantyFilter === "all" || w._id === warrantyFilter).map((w, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-purple-50 rounded-xl mb-3 border border-dashed border-purple-200">
                <div>
                  <h4 className="m-0 mb-1 text-sm font-semibold text-purple-900">{w._id || "Bảo hành Cơ bản"}</h4>
                  <p className="m-0 text-[13px] text-purple-600">Đã bán: <strong className="text-purple-700">{w.count}</strong> gói</p>
                </div>
                <div className="font-bold text-purple-700">+{formatCurrency(w.revenue)}</div>
              </div>
            ))}
            {data.warrantyStats.length === 0 && <p className="text-slate-500 text-sm">Chưa có dữ liệu bảo hành</p>}
          </div>
        </div>

      </div>

      {/* TOP 10 SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
        <div className="flex flex-wrap items-center justify-between mb-5 gap-2">
          <h3 className="text-base font-semibold text-slate-900 m-0 flex items-center gap-2">
            <Heart size={18} className="text-red-500" /> Top 10 sản phẩm được yêu thích
          </h3>
          <span className="text-[13px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">Dữ liệu từ lượt yêu thích của khách hàng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favoriteStats.length === 0 ? (
            <p className="text-slate-500 text-sm">Chưa có dữ liệu yêu thích</p>
          ) : (
            favoriteStats.map((item, idx) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-red-600 flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm border border-red-200/50">
                  #{idx + 1}
                </div>
                <img src={item.productImage || "/no-image.png"} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0 p-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="m-0 mb-1 text-sm font-semibold text-slate-900 truncate">{item.productName}</h4>
                  <p className="m-0 text-xs font-medium text-red-500 flex items-center gap-1">
                    <Heart size={12} fill="currentColor" />
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