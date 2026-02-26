import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
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
        <Route path="/news" element={<News />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/electronics" element={<ElectronicPage />} />
      </Routes>
    </>
  );
}

export default App;