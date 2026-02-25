import "./Product.css";
import ProductCard from "./ProductCard";

const products = [
  { name: "Nova X14 Pro", price: "23.790.000đ" },
  { name: "SonicBlast Headphones", price: "5.990.000đ" },
  { name: "Turbo Charge 65W", price: "850.000đ" },
  { name: "Silicone Case Matte", price: "450.000đ" },
];

function ProductGrid() {
  return (
    <section className="product-section">
      <h2>Sản phẩm nổi bật</h2>
      <div className="grid">
        {products.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;