import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { FileText, ShoppingBag, RefreshCw, Truck, CreditCard, ShieldAlert, Scale, Phone } from "lucide-react";

const sections = [
  {
    icon: <ShoppingBag size={22} />,
    title: "1. Điều kiện mua hàng",
    content: [
      "Để đặt hàng tại TechNova, bạn phải đủ 18 tuổi hoặc có sự đồng ý của người giám hộ hợp pháp.",
      "Bạn cam kết cung cấp thông tin chính xác (tên, địa chỉ, số điện thoại) khi đặt hàng. Mọi tổn thất phát sinh do thông tin sai lệch thuộc về trách nhiệm của người mua.",
      "TechNova có quyền từ chối đơn hàng nếu phát hiện dấu hiệu gian lận hoặc vi phạm điều khoản.",
    ],
  },
  {
    icon: <CreditCard size={22} />,
    title: "2. Thanh toán và giá cả",
    content: [
      "Giá sản phẩm hiển thị trên website bao gồm thuế VAT và cập nhật theo thời gian thực. TechNova bảo lưu quyền điều chỉnh giá mà không cần thông báo trước.",
      "Chúng tôi hỗ trợ các phương thức: Thanh toán khi nhận hàng (COD), Thẻ tín dụng/ghi nợ, Ví điện tử VNPay/Momo và Chuyển khoản ngân hàng.",
      "Đơn hàng sẽ được xác nhận xử lý sau khi thanh toán được xác minh thành công.",
    ],
  },
  {
    icon: <Truck size={22} />,
    title: "3. Giao hàng và vận chuyển",
    content: [
      "**Thời gian giao hàng**: Nội thành TP.HCM và Hà Nội: 1–2 ngày làm việc. Tỉnh thành khác: 2–5 ngày làm việc.",
      "Phí vận chuyển được tính tự động dựa trên địa chỉ và trọng lượng đơn hàng, hiển thị rõ ràng trước khi xác nhận.",
      "Khách hàng có thể theo dõi tình trạng đơn hàng trong mục Đơn hàng của tôi hoặc qua mã vận đơn được gửi qua email/SMS.",
    ],
  },
  {
    icon: <RefreshCw size={22} />,
    title: "4. Chính sách đổi trả và hoàn tiền",
    content: [
      "**Đổi trả trong 7 ngày**: Áp dụng cho sản phẩm lỗi kỹ thuật, hàng sai mẫu, thiếu phụ kiện. Sản phẩm phải còn nguyên tem, hộp và đầy đủ phụ kiện đi kèm.",
      "**Không áp dụng đổi trả**: Sản phẩm đã qua sử dụng, không còn tem niêm phong, hoặc hư hỏng do người dùng.",
      "**Hoàn tiền**: Thực hiện trong 5–7 ngày làm việc sau khi nhận và kiểm tra hàng hoàn. Hình thức hoàn tiền theo phương thức thanh toán ban đầu.",
    ],
  },
  {
    icon: <ShieldAlert size={22} />,
    title: "5. Bảo hành sản phẩm",
    content: [
      "Thời gian bảo hành theo quy định của nhà sản xuất, thường từ 12–24 tháng tùy sản phẩm và được ghi rõ trong chi tiết sản phẩm.",
      "Bảo hành không áp dụng cho: Hư hỏng do va đập vật lý, tiếp xúc với nước, tự ý sửa chữa hoặc mở máy.",
      "Để được bảo hành, bạn cần xuất trình biên lai mua hàng hoặc tra mã đơn hàng trong hệ thống.",
    ],
  },
  {
    icon: <Scale size={22} />,
    title: "6. Quyền sở hữu trí tuệ",
    content: [
      "Toàn bộ nội dung trên website TechNova (hình ảnh, mô tả, logo, thiết kế) là tài sản của TechNova và được bảo hộ bởi Luật Sở hữu trí tuệ Việt Nam.",
      "Nghiêm cấm sao chép, phân phối hoặc sử dụng nội dung trên website vào mục đích thương mại khi chưa có sự cho phép bằng văn bản.",
    ],
  },
  {
    icon: <Scale size={22} />,
    title: "7. Giới hạn trách nhiệm",
    content: [
      "TechNova không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, vô tình hay đặc biệt nào phát sinh từ việc sử dụng sản phẩm hoặc dịch vụ.",
      "Trách nhiệm pháp lý tối đa của TechNova không vượt quá giá trị đơn hàng gốc của giao dịch liên quan.",
    ],
  },
];

function TermsOfService() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />

      {/* HERO SECTION */}
      <div className="bg-slate-50 border-b border-slate-200 py-12 px-5 text-center text-slate-900">
        <div className="max-w-[700px] mx-auto">
          <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 border-[1.5px] border-emerald-200 rounded-2xl w-[72px] h-[72px] mb-5">
            <FileText size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold m-0 mb-4 text-slate-900">Điều khoản Dịch vụ</h1>
          <p className="text-base text-slate-600 leading-relaxed m-0 mb-5">
            Vui lòng đọc kỹ các điều khoản và điều kiện này trước khi sử dụng dịch vụ của TechNova. Bằng cách truy cập hoặc sử dụng website, bạn đồng ý bị ràng buộc bởi các điều khoản này.
          </p>
          <span className="inline-block bg-emerald-50 border border-emerald-200 rounded-full py-1.5 px-4 text-[13px] text-emerald-600 font-medium">
            Cập nhật lần cuối: 25 tháng 3, 2025
          </span>
        </div>
      </div>

      {/* CONTAINER */}
      <div className="max-w-[860px] mx-auto py-12 px-6 md:px-8 pb-16">

        {/* INTRO CARD */}
        <div className="bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl py-5 px-6 mb-8 text-emerald-900 text-[15px] leading-relaxed">
          <p className="m-0">
            Các điều khoản này áp dụng cho tất cả người dùng của website <strong className="font-bold">technova.vn</strong>, bao gồm khách truy cập, người mua hàng và bất kỳ người nào tương tác với nội dung hoặc dịch vụ của chúng tôi.
          </p>
        </div>

        {/* SECTIONS */}
        <div className="flex flex-col gap-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="bg-emerald-50 text-emerald-600 rounded-xl p-2.5 flex items-center justify-center shrink-0">
                  {sec.icon}
                </div>
                <h2 className="text-lg text-slate-900 m-0 font-bold">{sec.title}</h2>
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {sec.content.map((item, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-[15px] text-slate-700 leading-relaxed before:content-['●'] before:absolute before:left-0 before:text-emerald-500 before:text-[10px] before:top-[7px]"
                    dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CONTACT CARD */}
        <div className="flex flex-col md:flex-row items-start gap-5 bg-gradient-to-br from-emerald-800 to-emerald-600 text-white rounded-2xl p-6 md:p-8 mt-8 shadow-lg">
          <Phone size={28} className="shrink-0 text-emerald-200" />
          <div>
            <h3 className="text-lg m-0 mb-2 font-bold">Cần hỗ trợ thêm?</h3>
            <p className="m-0 text-[15px] leading-relaxed text-white/90">
              Nếu bạn có thắc mắc về điều khoản dịch vụ, hãy liên hệ với chúng tôi qua email <a href="mailto:support@technova.vn" className="text-yellow-400 font-semibold underline hover:text-yellow-300 transition-colors">support@technova.vn</a> hoặc gọi <strong className="font-bold text-white">1900 1234</strong> (miễn phí, 8:00–21:00 hàng ngày).
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TermsOfService;
