import "./Category.css";
import {
  Smartphone,
  Headphones,
  BatteryCharging,
  Shield,
  Cable
} from "lucide-react";

function Category() {
  const list = [
    { name: "Điện thoại", icon: <Smartphone size={40} /> },
    { name: "Tai nghe", icon: <Headphones size={40} /> },
    { name: "Sạc", icon: <BatteryCharging size={40} /> },
    { name: "Ốp lưng", icon: <Shield size={40} /> },
    { name: "Phụ kiện", icon: <Cable size={40} /> },
  ];

  return (
    <section className="category">
      <h2>Khám phá theo danh mục</h2>

      <div className="category-grid">
        {list.map((item, i) => (
          <div key={i} className="category-card">
            <div className="category-icon">
              {item.icon}
            </div>
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Category;