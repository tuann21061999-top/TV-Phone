import { useEffect, useState } from "react";
import "./Product.css";
import ProductCard from "./ProductCard";
import axios from "axios";

function ProductGrid({ type }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products?type=${type}`
        );
        setProducts(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [type]);

  return (
    <section className="product-section">
      <h2>Sản phẩm</h2>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;