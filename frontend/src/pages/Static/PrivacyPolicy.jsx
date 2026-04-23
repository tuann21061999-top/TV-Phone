import React from "react";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { Shield, Lock, Eye, Database, Bell, UserCheck, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: <Database size={22} />,
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      "**Thông tin cá nhân**: Khi bạn đăng ký tài khoản hoặc thực hiện mua hàng, chúng tôi thu thập họ tên, địa chỉ email, số điện thoại và địa chỉ giao hàng.",
      "**Thông tin thanh toán**: Thông tin thẻ tín dụng/ghi nợ được mã hóa và xử lý bởi các đối tác thanh toán bên thứ ba uy tín (VNPay, Momo). V&T Nexis không lưu trữ thông tin thẻ của bạn.",
      "**Dữ liệu sử dụng**: Chúng tôi tự động ghi lại địa chỉ IP, loại trình duyệt, lịch sử duyệt web và hành vi mua sắm nhằm cải thiện trải nghiệm dịch vụ.",
    ],
  },
  {
    icon: <Eye size={22} />,
    title: "2. Cách chúng tôi sử dụng thông tin",
    content: [
      "Xử lý đơn hàng, thanh toán và giao hàng đến tay bạn.",
      "Cá nhân hóa trải nghiệm mua sắm và hiển thị các sản phẩm phù hợp với sở thích của bạn.",
      "Gửi thông báo về đơn hàng, khuyến mãi và cập nhật sản phẩm (chỉ khi bạn đồng ý nhận).",
      "Phân tích dữ liệu để cải thiện hiệu suất website và chất lượng dịch vụ.",
    ],
  },
  {
    icon: <Lock size={22} />,
    title: "3. Bảo mật thông tin",
    content: [
      "V&T Nexis áp dụng các tiêu chuẩn bảo mật SSL/TLS để mã hóa toàn bộ dữ liệu truyền tải giữa trình duyệt và máy chủ.",
      "Dữ liệu của bạn được lưu trữ trên hạ tầng đám mây có chứng chỉ bảo mật ISO 27001.",
      "Chúng tôi giới hạn quyền truy cập thông tin khách hàng chỉ cho nhân viên có thẩm quyền và được đào tạo về bảo mật.",
    ],
  },
  {
    icon: <UserCheck size={22} />,
    title: "4. Chia sẻ thông tin với bên thứ ba",
    content: [
      "Chúng tôi **không bán** thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.",
      "Thông tin chỉ được chia sẻ với: Đối tác vận chuyển (GHN, GHTK) để thực hiện giao hàng; Đơn vị thanh toán (VNPay, Momo) để xử lý giao dịch.",
      "Trong trường hợp bắt buộc theo quy định pháp luật, chúng tôi có thể cung cấp thông tin cho cơ quan chức năng.",
    ],
  },
  {
    icon: <Bell size={22} />,
    title: "5. Cookie và công nghệ theo dõi",
    content: [
      "Website sử dụng cookie để ghi nhớ phiên đăng nhập, giỏ hàng và tùy chọn cá nhân của bạn.",
      "Bạn có thể tắt cookie thông qua cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của website.",
    ],
  },
  {
    icon: <RefreshCw size={22} />,
    title: "6. Quyền của bạn",
    content: [
      "**Quyền truy cập**: Bạn có thể yêu cầu xem toàn bộ thông tin cá nhân chúng tôi đang lưu giữ về bạn.",
      "**Quyền chỉnh sửa**: Cập nhật thông tin cá nhân bất kỳ lúc nào trong phần Hồ sơ tài khoản.",
      "**Quyền xóa**: Yêu cầu xóa tài khoản và toàn bộ dữ liệu cá nhân. Chúng tôi sẽ xử lý trong vòng 30 ngày làm việc.",
      "**Quyền từ chối**: Hủy đăng ký nhận email marketing bất kỳ lúc nào qua liên kết ở cuối email.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />
      
      {/* HERO SECTION */}
      <div className="py-12 px-5 text-center border-b border-slate-200 bg-slate-50 text-slate-900">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl w-[72px] h-[72px] mb-5">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900">Chính sách Bảo mật</h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-5">
            Tại V&T Nexis, chúng tôi đặt sự riêng tư và bảo mật thông tin của bạn lên hàng đầu. 
            Trang này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.
          </p>
          <span className="inline-block bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-[13px] text-blue-600 font-medium">
            Cập nhật lần cuối: 25 tháng 3, 2025
          </span>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto py-12 px-6 md:py-16 md:px-8">
        
        {/* INTRO CARD */}
        <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-600 rounded-xl p-5 md:p-6 mb-8 text-[15px] text-slate-800 leading-relaxed">
          <p className="m-0">
            Bằng cách sử dụng website <strong className="text-blue-900 font-bold">vtnexis.vn</strong>, bạn đồng ý với các điều khoản được mô tả trong chính sách này. 
            Chúng tôi cam kết tuân thủ Luật An toàn thông tin mạng và các quy định bảo vệ dữ liệu cá nhân hiện hành của Việt Nam.
          </p>
        </div>

        {/* SECTIONS */}
        <div className="flex flex-col gap-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-7 md:p-8 shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3.5 mb-4.5">
                <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 flex shrink-0">
                  {sec.icon}
                </div>
                <h2 className="text-lg font-bold text-slate-900 m-0">{sec.title}</h2>
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {sec.content.map((item, i) => (
                  <li 
                    key={i} 
                    className="relative pl-5 text-[15px] text-slate-600 leading-relaxed 
                               before:content-['●'] before:absolute before:left-0 before:text-blue-500 before:text-[10px] before:top-[2px]"
                    dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} 
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CONTACT CARD */}
        <div className="flex flex-col md:flex-row items-start gap-5 bg-gradient-to-br from-blue-800 to-blue-600 text-white rounded-2xl p-7 md:p-8 mt-8 shadow-lg">
          <Mail size={28} className="shrink-0 text-blue-200" />
          <div>
            <h3 className="text-lg font-bold m-0 mb-2">Liên hệ về vấn đề bảo mật</h3>
            <p className="m-0 text-[15px] leading-relaxed text-blue-50/90">
              Nếu bạn có bất kỳ câu hỏi nào liên quan đến chính sách này, vui lòng gửi email cho chúng tôi tại 
              <a href="mailto:privacy@vtnexis.vn" className="text-yellow-400 font-semibold underline ml-1 hover:text-yellow-300 transition-colors">
                privacy@vtnexis.vn
              </a> hoặc gọi hotline <strong className="text-white">1900 1234</strong>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;