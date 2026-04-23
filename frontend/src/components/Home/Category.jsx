import {
  Smartphone,
  Headphones,
  BatteryCharging,
  Shield,
  Cable
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Category() {
  const navigate = useNavigate();

  const list = [
    // Truyền thẳng component Icon thay vì thẻ JSX để dễ dàng thay đổi kích thước bằng Tailwind
    { name: "Điện thoại", icon: Smartphone, path: "/phones" },
    { name: "Tai nghe", icon: Headphones, path: "/electronics", category: "Tai nghe" },
    { name: "Củ sạc", icon: BatteryCharging, path: "/accessories", category: "Củ sạc" },
    { name: "Ốp lưng", icon: Shield, path: "/accessories", category: "Ốp lưng" },
    { name: "Phụ kiện", icon: Cable, path: "/accessories" },
  ];

  return (
    <section className="py-6 md:py-10 px-4 md:px-[80px] max-w-[1400px] mx-auto">
      <h2 className="mb-4 md:mb-[30px] text-[18px] md:text-[24px] font-bold text-slate-800 text-left md:text-center">
        Khám phá theo danh mục
      </h2>

      {/* Mobile: Flex vuốt ngang (overflow-x-auto) | PC: Grid 5 cột */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-3 md:gap-5 pb-4 md:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden snap-x">
        {list.map((item, i) => {
          const Icon = item.icon; // Lấy Component Icon ra để render
          
          return (
            <div
              key={i}
              onClick={() => navigate(item.path, { state: { category: item.category } })}
              className="snap-start shrink-0 w-[90px] md:w-auto p-3 md:p-[25px] rounded-xl bg-white md:bg-[#f8f9fa] border border-slate-100 md:border-transparent cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:bg-[#e9ecef] hover:shadow-md flex flex-col items-center justify-center shadow-sm"
            >
              {/* Vòng tròn nền cho Icon trên Mobile, PC thì trong suốt */}
              <div className="mb-2 md:mb-2.5 text-blue-600 bg-blue-50 md:bg-transparent p-3 md:p-0 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 md:w-10 md:h-10" strokeWidth={1.5} />
              </div>
              <p className="m-0 font-medium text-[12px] md:text-[15px] text-slate-700 text-center leading-tight">
                {item.name}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Category;