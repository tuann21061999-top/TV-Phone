import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Shield, Lock, Eye, Database, Bell, UserCheck, RefreshCw, Mail } from "lucide-react";
import "./PrivacyPolicy.css";

const sections = [
  {
    icon: <Database size={22} />,
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      "**Thông tin cá nhân**: Khi bạn đăng ký tài khoản hoặc thực hiện mua hàng, chúng tôi thu thập họ tên, địa chỉ email, số điện thoại và địa chỉ giao hàng.",
      "**Thông tin thanh toán**: Thông tin thẻ tín dụng/ghi nợ được mã hóa và xử lý bởi các đối tác thanh toán bên thứ ba uy tín (VNPay, Momo). TechNova không lưu trữ thông tin thẻ của bạn.",
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
      "TechNova áp dụng các tiêu chuẩn bảo mật SSL/TLS để mã hóa toàn bộ dữ liệu truyền tải giữa trình duyệt và máy chủ.",
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
    <div className="policy-page">
      <Header />
      <div className="policy-hero">
        <div className="policy-hero-content">
          <div className="policy-hero-icon"><Shield size={40} /></div>
          <h1>Chính sách Bảo mật</h1>
          <p>Tại TechNova, chúng tôi đặt sự riêng tư và bảo mật thông tin của bạn lên hàng đầu. Trang này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.</p>
          <span className="policy-updated">Cập nhật lần cuối: 25 tháng 3, 2025</span>
        </div>
      </div>

      <div className="policy-container">
        <div className="policy-intro-card">
          <p>Bằng cách sử dụng website <strong>technova.vn</strong>, bạn đồng ý với các điều khoản được mô tả trong chính sách này. Chúng tôi cam kết tuân thủ Luật An toàn thông tin mạng và các quy định bảo vệ dữ liệu cá nhân hiện hành của Việt Nam.</p>
        </div>

        <div className="policy-sections">
          {sections.map((sec, idx) => (
            <div key={idx} className="policy-section-card">
              <div className="policy-section-header">
                <div className="policy-icon-box">{sec.icon}</div>
                <h2>{sec.title}</h2>
              </div>
              <ul className="policy-list">
                {sec.content.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="policy-contact-card">
          <Mail size={28} />
          <div>
            <h3>Liên hệ về vấn đề bảo mật</h3>
            <p>Nếu bạn có bất kỳ câu hỏi nào liên quan đến chính sách này, vui lòng gửi email cho chúng tôi tại <a href="mailto:privacy@technova.vn">privacy@technova.vn</a> hoặc gọi hotline <strong>1900 1234</strong>.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
