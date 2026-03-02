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
import Cart from "./components/Cart/Cart";
import LoginPage from "./components/LoginPages/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import Profile from "./components/Profile/Profile";
import AdminPage from "./pages/Admin/AdminPage";
import ManageProduct from "./components/ManageProduct/ManagePhone";
import ManageElectronic from "./components/ManageProduct/ManageElectronic";
import ManageAccessory from "./components/ManageProduct/ManageAccessory";
import AddressModal from "./components/Profile/AddressModal";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import Payment from "./pages/Payment/Payment";
import ManageOrder from "./components/ManageOrder/ManageOrder";
import OrderDetail from "./pages/OrderDetail/OrderDetail";
import GlobalDeliveryConfirm from "./components/GlobalDeliveryConfirm/GlobalDeliveryConfirm";
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
        <GlobalDeliveryConfirm /> {/* Component này sẽ luôn lắng nghe và hiển thị khi có thông báo cần xác nhận giao hàng */}
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
        <Route path="/admin/electronics" element={<ManageElectronic />} />
        <Route path="/admin/accessories" element={<ManageAccessory />} />
        <Route path="/profile/address" element={<AddressModal />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin/orders" element={<ManageOrder />} />
        <Route path="/order/:id" element={<OrderDetail />} />
      </Routes>
    </>
  );
}

export default App;