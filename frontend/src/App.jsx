import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import SearchPage from "./pages/SearchPage/SearchPage";
import SpecDetail from "./pages/SpecDetail/SpecDetail";
import ProductCompare from "./pages/ProductCompare/ProductCompare";
import ReviewPage from "./pages/ReviewPage/ReviewPage";
import Cart from "./components/Cart/Cart";
import LoginPage from "./components/LoginPages/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import ForgotPassword from "./components/LoginPages/ForgotPassword";
import Profile from "./components/Profile/Profile";
import AdminPage from "./pages/Admin/AdminPage";
import ManageProduct from "./components/ManageProduct/ManagePhone";
import ManageElectronic from "./components/ManageProduct/ManageElectronic";
import ManageAccessory from "./components/ManageProduct/ManageAccessory";
import AddressModal from "./components/Profile/AddressModal";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import Payment from "./pages/Payment/Payment";
import PaymentResult from "./pages/PaymentResult/PaymentResult";
import ManageOrder from "./components/ManageOrder/ManageOrder";
import OrderDetail from "./pages/OrderDetail/OrderDetail";
import ReviewOrder from "./pages/ReviewOrder/ReviewOrder";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService/TermsOfService";
import GlobalDeliveryConfirm from "./components/GlobalDeliveryConfirm/GlobalDeliveryConfirm";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PageTransition from "./components/PageTransition/PageTransition";
import "./App.css";

// Khởi tạo Cloudinary bên ngoài component để tránh khởi tạo lại nhiều lần
// eslint-disable-next-line react-refresh/only-export-components
export const cld = new Cloudinary({
  cloud: { cloudName: 'dg4tvqz7g' }
});

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-right" richColors />
      <GlobalDeliveryConfirm />
      <ChatWidget />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/phones" element={<PageTransition><PhonePage /></PageTransition>} />
          <Route path="/electronics" element={<PageTransition><ElectronicPage /></PageTransition>} />
          <Route path="/accessories" element={<PageTransition><AccessoryPage /></PageTransition>} />
          <Route path="/promotions" element={<PageTransition><Promotions /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/news" element={<PageTransition><News /></PageTransition>} />
          <Route path="/news/:slug" element={<PageTransition><NewsDetail /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/product/:slug/specs" element={<PageTransition><SpecDetail /></PageTransition>} />
          <Route path="/compare" element={<PageTransition><ProductCompare /></PageTransition>} />
          <Route path="/product/:slug/reviews" element={<PageTransition><ReviewPage /></PageTransition>} />
          <Route path="/admin" element={<AdminRoute><PageTransition><AdminPage /></PageTransition></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><PageTransition><ManageProduct /></PageTransition></AdminRoute>} />
          <Route path="/admin/electronics" element={<AdminRoute><PageTransition><ManageElectronic /></PageTransition></AdminRoute>} />
          <Route path="/admin/accessories" element={<AdminRoute><PageTransition><ManageAccessory /></PageTransition></AdminRoute>} />
          <Route path="/profile/address" element={<PageTransition><AddressModal /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
          <Route path="/payment-result" element={<PageTransition><PaymentResult /></PageTransition>} />
          <Route path="/admin/orders" element={<AdminRoute><PageTransition><ManageOrder /></PageTransition></AdminRoute>} />
          <Route path="/order/:id" element={<PageTransition><OrderDetail /></PageTransition>} />
          <Route path="/review-order/:id" element={<PageTransition><ReviewOrder /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;