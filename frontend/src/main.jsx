import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import "./index.css";
import App from "./App";

// Cấu hình đánh chặn (Interceptor) toàn cục cho Axios
// Xóa sạch Token nếu Server từ chối lệnh với mã 401 (Hết hạn hoặc sai token)
axios.interceptors.request.use((config) => {
  // Bỏ qua ping health
  if (config.url && config.url.includes("/api/health")) {
    return config;
  }
  
  // Set timeout để hiển thị toast nếu request quá lâu (Cold Start)
  config.timeoutId = setTimeout(() => {
    toast.info("Hệ thống đang khởi động, vui lòng đợi trong giây lát...", {
      id: "cold-start-toast",
      duration: 5000,
    });
  }, 3000);

  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (response.config && response.config.timeoutId) {
      clearTimeout(response.config.timeoutId);
    }
    toast.dismiss("cold-start-toast");
    return response;
  },
  (error) => {
    if (error.config && error.config.timeoutId) {
      clearTimeout(error.config.timeoutId);
    }
    toast.dismiss("cold-start-toast");
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Mọi lỗi 401 sẽ tự động vô hiệu hóa token để frontend không spam request vô ích
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);