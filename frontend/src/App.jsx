import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Home from "./pages/Home/Home";
import PhonePage from "./pages/PhonePage/PhonePage";
import AccessoryPage from "./pages/AccessoryPage/AccessoryPage";
import PromotionPage from "./pages/PromotionPage/PromotionPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import LoginPage from "./pages/LoginPages/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import "./App.css";

function App() {
  return (
    <>
      {/* Toaster đặt ngoài Routes */}
      <Toaster position="top-right" richColors />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/phones" element={<PhonePage />} />
        <Route path="/accessories" element={<AccessoryPage />} />
        <Route path="/promotions" element={<PromotionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;