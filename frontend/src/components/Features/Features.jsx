import {
  BadgeCheck,
  Truck,
  ShieldCheck,
  Headset
} from "lucide-react";

function Features() {
  const list = [
    {
      icon: <BadgeCheck size={28} />,
      text: "Sản phẩm chính hãng",
    },
    {
      icon: <Truck size={28} />,
      text: "Giao hàng nhanh",
    },
    {
      icon: <ShieldCheck size={28} />,
      text: "Bảo hành 12 tháng",
    },
    {
      icon: <Headset size={28} />,
      text: "Hỗ trợ 24/7",
    },
  ];

  return (
    <section className="flex flex-wrap justify-center gap-10 py-[30px] px-5 md:px-[80px] bg-[#f8f9fa]">
      {list.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 font-medium transition-transform duration-300 ease-in-out cursor-default hover:-translate-y-[3px] text-slate-800"
        >
          <div className="text-[#0d6efd] flex items-center justify-center">
            {item.icon}
          </div>
          <p className="m-0">{item.text}</p>
        </div>
      ))}
    </section>
  );
}

export default Features;