import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import Home from "./pages/Home/Home";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import PageTransition from "./components/PageTransition/PageTransition";
import "./App.css";

// Lazy-load route components to keep the initial bundle small.
const PhonePage = lazy(() => import("./components/PhonePage/PhonePage"));
const ElectronicPage = lazy(() => import("./components/ElectronicPage/ElectronicPage"));
const AccessoryPage = lazy(() => import("./components/AccessoryPage/AccessoryPage"));
const Promotions = lazy(() => import("./pages/Promotions/Promotions"));
const ContactPage = lazy(() => import("./pages/ContactPage/ContactPage"));
const News = lazy(() => import("./pages/News/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail/NewsDetail"));
const ProductDetail = lazy(() => import("./pages/ProductDetail/ProductDetail"));
const SearchPage = lazy(() => import("./pages/SearchPage/SearchPage"));
const SpecDetail = lazy(() => import("./pages/SpecDetail/SpecDetail"));
const ProductCompare = lazy(() => import("./pages/ProductCompare/ProductCompare"));
const ReviewPage = lazy(() => import("./pages/ReviewPage/ReviewPage"));
const Cart = lazy(() => import("./components/Cart/Cart"));
const LoginPage = lazy(() => import("./components/LoginPages/LoginPage"));
const RegisterPage = lazy(() => import("./components/RegisterPage/RegisterPage"));
const ForgotPassword = lazy(() => import("./components/LoginPages/ForgotPassword"));
const Profile = lazy(() => import("./components/Profile/Profile"));
const AdminPage = lazy(() => import("./pages/Admin/AdminPage"));
const ManageProduct = lazy(() => import("./components/ManageProduct/ManagePhone"));
const ManageElectronic = lazy(() => import("./components/ManageProduct/ManageElectronic"));
const ManageAccessory = lazy(() => import("./components/ManageProduct/ManageAccessory"));
const AddressModal = lazy(() => import("./components/Profile/AddressModal"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage/CheckoutPage"));
const Payment = lazy(() => import("./pages/Payment/Payment"));
const PaymentResult = lazy(() => import("./pages/PaymentResult/PaymentResult"));
const ManageOrder = lazy(() => import("./components/ManageOrder/ManageOrder"));
const OrderDetail = lazy(() => import("./pages/OrderDetail/OrderDetail"));
const ReviewOrder = lazy(() => import("./pages/ReviewOrder/ReviewOrder"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService/TermsOfService"));
const GlobalDeliveryConfirm = lazy(() => import("./components/GlobalDeliveryConfirm/GlobalDeliveryConfirm"));
const ChatWidget = lazy(() => import("./components/ChatWidget/ChatWidget"));

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-right" richColors />
      <Suspense fallback={null}>
        <GlobalDeliveryConfirm />
        <ChatWidget />
      </Suspense>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
              Đang tải trang...
            </div>
          }
        >
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
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default App;