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
    { name: "Điện thoại", icon: <Smartphone size={40} />, path: "/phones" },
    { name: "Tai nghe", icon: <Headphones size={40} />, path: "/electronics", category: "Tai nghe" },
    { name: "Củ sạc", icon: <BatteryCharging size={40} />, path: "/accessories", category: "Củ sạc" },
    { name: "Ốp lưng", icon: <Shield size={40} />, path: "/accessories", category: "Ốp lưng" },
    { name: "Phụ kiện", icon: <Cable size={40} />, path: "/accessories" },
  ];

  return (
    <section className="py-10 px-5 md:px-[80px] text-center max-w-[1400px] mx-auto">
      <h2 className="mb-[30px] text-[24px] font-bold text-slate-800">
        Khám phá theo danh mục
      </h2>

      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {list.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.path, { state: { category: item.category } })}
            className="p-[25px] rounded-xl bg-[#f8f9fa] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:bg-[#e9ecef] flex flex-col items-center justify-center shadow-sm"
          >
            <div className="mb-2.5 text-[#0d6efd]">
              {item.icon}
            </div>
            <p className="m-0 font-medium text-slate-700">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Category;