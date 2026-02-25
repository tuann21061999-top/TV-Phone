import "./Features.css";
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
    <section className="features">
      {list.map((item, i) => (
        <div key={i} className="feature-item">
          <div className="feature-icon">{item.icon}</div>
          <p>{item.text}</p>
        </div>
      ))}
    </section>
  );
}

export default Features;