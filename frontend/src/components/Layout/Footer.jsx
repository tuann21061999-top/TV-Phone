import { Link } from "react-router-dom";
import { Twitter, Instagram, Linkedin, Zap, Smartphone, MapPin, Phone, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="relative bg-[#0f172a] border-t border-white/5 pt-[80px] pb-[30px] text-[#94a3b8] overflow-hidden">

      {/* Nhúng keyframes cho hiệu ứng điện thoại lơ lửng */}
      <style>
        {`
          @keyframes floatAbstract {
            0%, 100% { transform: translateY(0) rotate(20deg); }
            50% { transform: translateY(-30px) rotate(15deg); }
          }
          .animate-floatAbstract {
            animation: floatAbstract 8s ease-in-out infinite;
          }
        `}
      </style>

      {/* Vành đai ánh sáng (Aesthetic Glow) */}
      <div className="absolute top-0 -left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-[1]"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(56,189,248,0.1)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-[1]"></div>

      {/* Trang trí điện thoại lơ lửng góc phải (Abstract) */}
      <div className="absolute right-[5%] top-[30px] z-[1] pointer-events-none opacity-10 animate-floatAbstract max-[900px]:-right-[50px] max-[900px]:opacity-5">
        <Smartphone className="w-[350px] h-[350px] text-[#38bdf8] rotate-[20deg] drop-shadow-[0_0_40px_rgba(56,189,248,0.5)]" strokeWidth={1} />
      </div>

      <div className="relative z-[2] w-full max-w-[1600px] px-10 mx-auto">
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[2fr_1fr_1.5fr] gap-10 min-[900px]:gap-[60px] mb-[50px]">

          {/* Cột 1: Thông tin thương hiệu */}
          <div className="min-[900px]:pr-10">
            <div className="flex items-center gap-2 font-extrabold text-[24px] mb-[15px] text-[#f8fafc]">
              <Zap size={24} className="text-[#38bdf8]" />
              <span>V&T Nexis</span>
            </div>
            <p className="text-[15px] text-[#94a3b8] mb-6 leading-[1.7]">
              Tương lai công nghệ trong tầm tay bạn. Khám phá các thiết bị di động và đồ điện tử đẳng cấp nhất cùng V&T Nexis.
            </p>
            <div className="flex gap-3">
              <a href="#" className="inline-flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-[#f8fafc] transition-all duration-300 hover:bg-[#38bdf8] hover:text-[#0f172a] hover:-translate-y-[3px] hover:shadow-[0_4px_15px_rgba(56,189,248,0.3)]">
                <Twitter size={18} />
              </a>
              <a href="#" className="inline-flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-[#f8fafc] transition-all duration-300 hover:bg-[#38bdf8] hover:text-[#0f172a] hover:-translate-y-[3px] hover:shadow-[0_4px_15px_rgba(56,189,248,0.3)]">
                <Instagram size={18} />
              </a>
              <a href="#" className="inline-flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-[#f8fafc] transition-all duration-300 hover:bg-[#38bdf8] hover:text-[#0f172a] hover:-translate-y-[3px] hover:shadow-[0_4px_15px_rgba(56,189,248,0.3)]">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h3 className="m-0 mb-5 text-[16px] text-[#f8fafc] font-semibold uppercase tracking-[1px]">Khám phá siêu phẩm</h3>
            <a href="/phones" className="block mb-3 text-[#94a3b8] no-underline transition-colors duration-300 text-[15px] hover:text-[#38bdf8]">Điện thoại di động</a>
            <a href="/electronics" className="block mb-3 text-[#94a3b8] no-underline transition-colors duration-300 text-[15px] hover:text-[#38bdf8]">Máy tính & Đồ điện tử</a>
            <a href="/accessories" className="block mb-3 text-[#94a3b8] no-underline transition-colors duration-300 text-[15px] hover:text-[#38bdf8]">Phụ kiện công nghệ</a>
            <a href="/promotions" className="block mb-3 text-[#94a3b8] no-underline transition-colors duration-300 text-[15px] hover:text-[#38bdf8]">Săn sale chớp nhoáng</a>
          </div>

          {/* Cột 3: Liên hệ */}
          <div>
            <h3 className="m-0 mb-5 text-[16px] text-[#f8fafc] font-semibold uppercase tracking-[1px]">Kết nối với chúng tôi</h3>
            <div className="flex flex-col gap-[15px]">
              <div className="flex items-start gap-3 text-[15px] text-[#94a3b8] leading-[1.5]">
                <MapPin size={18} className="text-[#38bdf8] mt-[2px] shrink-0" />
                <span>123 Đường Công Nghệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-start gap-3 text-[15px] text-[#94a3b8] leading-[1.5]">
                <Phone size={18} className="text-[#38bdf8] mt-[2px] shrink-0" />
                <span>Hotline: 1900 1234 (Miễn phí)</span>
              </div>
              <div className="flex items-start gap-3 text-[15px] text-[#94a3b8] leading-[1.5]">
                <Mail size={18} className="text-[#38bdf8] mt-[2px] shrink-0" />
                <span>Email: contact@vtnexis.vn</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-6 flex justify-between items-center flex-wrap text-[#64748b] text-[14px] max-[900px]:flex-col max-[900px]:gap-[15px] max-[900px]:text-center">
          <p className="m-0">© 2024 V&T Nexis Inc. All rights reserved.</p>
          <div className="flex gap-[25px]">
            <Link to="/privacy-policy" className="no-underline text-[#64748b] transition-colors duration-300 hover:text-[#f8fafc]">Chính sách bảo mật</Link>
            <Link to="/terms-of-service" className="no-underline text-[#64748b] transition-colors duration-300 hover:text-[#f8fafc]">Điều khoản bảo hành</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;