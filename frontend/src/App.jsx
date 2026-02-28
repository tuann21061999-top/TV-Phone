import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

import Home from "./pages/Home/Home";
import PhonePage from "./components/PhonePage/PhonePage";
import ElectronicPage from "./components/ElectronicPage/ElectronicPage";
import AccessoryPage from "./components/AccessoryPage/AccessoryPage";
import PromotionPage from "./pages/PromotionPage/PromotionPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import News from "./pages/News/News";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import LoginPage from "./pages/LoginPages/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import Profile from "./pages/Profile/Profile";
import AdminPage from "./pages/Admin/AdminPage";
import ManageProduct from "./components/ManageProduct/ManageProduct";
import "./App.css";

// Khởi tạo Cloudinary bên ngoài component để tránh khởi tạo lại nhiều lần
// eslint-disable-next-line react-refresh/only-export-components
export const cld = new Cloudinary({ 
  cloud: { cloudName: 'dg4tvqz7g' } 
});

function App() {
  return (
    <>
      {/* Toaster đặt ngoài Routes để hiển thị thông báo toàn ứng dụng */}
      <Toaster position="top-right" richColors />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/phones" element={<PhonePage />} />
        <Route path="/electronics" element={<ElectronicPage />} />
        <Route path="/accessories" element={<AccessoryPage />} />
        <Route path="/promotions" element={<PromotionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<ManageProduct />} />
      </Routes>
    </>
  );
}

export default App;