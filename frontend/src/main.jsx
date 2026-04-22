import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import "./index.css";
import App from "./App";

// Cấu hình đánh chặn (Interceptor) toàn cục cho Axios
// Xóa sạch Token nếu Server từ chối lệnh với mã 401 (Hết hạn hoặc sai token)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
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