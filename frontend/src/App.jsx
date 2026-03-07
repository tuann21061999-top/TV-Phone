import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

import Home from "./pages/Home/Home";
import PhonePage from "./components/PhonePage/PhonePage";
import ElectronicPage from "./components/ElectronicPage/ElectronicPage";
import AccessoryPage from "./components/AccessoryPage/AccessoryPage";
import Promotions from "./pages/Promotions/Promotions";
import ContactPage from "./pages/ContactPage/ContactPage";
import News from "./pages/News/News";
import NewsDetail from "./pages/NewsDetail/NewsDetail";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import SpecDetail from "./pages/SpecDetail/SpecDetail";
import ReviewPage from "./pages/ReviewPage/ReviewPage";
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
import ChatWidget from "./components/ChatWidget/ChatWidget";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import "./App.css";

// Khởi tạo Cloudinary bên ngoài component để tránh khởi tạo lại nhiều lần
// eslint-disable-next-line react-refresh/only-export-components
export const cld = new Cloudinary({
  cloud: { cloudName: 'dg4tvqz7g' }
});

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <GlobalDeliveryConfirm />
      <ChatWidget />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/phones" element={<PhonePage />} />
        <Route path="/electronics" element={<ElectronicPage />} />
        <Route path="/accessories" element={<AccessoryPage />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/product/:slug/specs" element={<SpecDetail />} />
        <Route path="/product/:slug/reviews" element={<ReviewPage />} />
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