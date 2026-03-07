import "./Category.css";
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
    { name: "Sạc", icon: <BatteryCharging size={40} />, path: "/accessories", category: "Củ sạc" },
    { name: "Ốp lưng", icon: <Shield size={40} />, path: "/accessories", category: "Ốp lưng" },
    { name: "Phụ kiện", icon: <Cable size={40} />, path: "/accessories" },
  ];

  return (
    <section className="category">
      <h2>Khám phá theo danh mục</h2>

      <div className="category-grid">
        {list.map((item, i) => (
          <div
            key={i}
            className="category-card"
            onClick={() => navigate(item.path, { state: { category: item.category } })}
            style={{ cursor: "pointer" }}
          >
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