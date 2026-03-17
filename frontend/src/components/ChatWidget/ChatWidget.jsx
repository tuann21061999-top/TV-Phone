import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MessageCircle, X, Send, Headphones } from "lucide-react";
import "./ChatWidget.css";

const SOCKET_URL = "http://localhost:5000";

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [adminId, setAdminId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [loading, setLoading] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const token = localStorage.getItem("token");

    // ─── Kiểm tra có phải user đã đăng nhập (không phải admin) ───
    useEffect(() => {
        if (!token) return;

        const fetchUser = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Chỉ hiện chat widget cho role "user", không hiện cho admin
                if (data.role === "admin") {
                    setCurrentUser(null);
                    return;
                }

                setCurrentUser(data);
            } catch {
                setCurrentUser(null);
            }
        };

        fetchUser();
    }, [token]);

    // ─── Kết nối Socket.io khi user mở chat ──────────────────────
    useEffect(() => {
        if (!currentUser) return;

        const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join_room", currentUser._id);
        });

        // Lắng nghe tin nhắn đến
        socket.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (!isOpen) setHasUnread(true); // Hiện dot unread nếu chat đang đóng
        });

        socket.on("user_typing", () => setIsTyping(true));
        socket.on("user_stop_typing", () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // ─── Fetch admin ID & lịch sử chat khi mở ────────────────────
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const init = async () => {
            try {
                setLoading(true);
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Lấy admin đầu tiên
                const adminRes = await axios.get("http://localhost:5000/api/chat/admins", { headers });
                if (adminRes.data.length === 0) return;
                const admin = adminRes.data[0];
                setAdminId(admin._id);

                // 2. Lấy lịch sử chat
                const chatRes = await axios.get(
                    `http://localhost:5000/api/chat/conversation/${admin._id}`,
                    { headers }
                );
                setMessages(chatRes.data);
                setHasUnread(false);

                // 3. Đánh dấu đã đọc
                await axios.put(`http://localhost:5000/api/chat/mark-read/${admin._id}`, {}, { headers });
            } catch (error) {
                console.error("Lỗi init chat:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentUser]);

    // ─── Auto-scroll xuống cuối ───────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // ─── Gửi tin nhắn ────────────────────────────────────────────
    const handleSend = () => {
        if (!inputMsg.trim() || !adminId || !socketRef.current) return;

        socketRef.current.emit("send_message", {
            senderId: currentUser._id,
            receiverId: adminId,
            content: inputMsg.trim(),
        });

        // Thêm tin nhắn hiển thị ngay (optimistic update)
        setMessages((prev) => [
            ...prev,
            {
                _id: Date.now().toString(), // temp ID
                senderId: currentUser._id,
                receiverId: adminId,
                content: inputMsg.trim(),
                createdAt: new Date().toISOString(),
            },
        ]);

        setInputMsg("");

        // Stop typing
        socketRef.current.emit("stop_typing", {
            senderId: currentUser._id,
            receiverId: adminId,
        });
    };

    // ─── Typing indicator ────────────────────────────────────────
    const handleInputChange = (e) => {
        setInputMsg(e.target.value);

        if (socketRef.current && adminId) {
            socketRef.current.emit("typing", {
                senderId: currentUser._id,
                receiverId: adminId,
            });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit("stop_typing", {
                    senderId: currentUser._id,
                    receiverId: adminId,
                });
            }, 1500);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    // ─── Không render nếu chưa login hoặc là admin ───────────────
    if (!currentUser) return null;

    return (
        <>
            {/* Nút mở chat */}
            <button className="chat-widget-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {hasUnread && !isOpen && <span className="unread-dot" />}
            </button>

            {/* Khung chat */}
            {isOpen && (
                <div className="chat-widget-box">
                    {/* Header */}
                    <div className="chat-widget-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">
                                <Headphones size={18} />
                            </div>
                            <div className="chat-header-text">
                                <h4>Hỗ trợ TechNova</h4>
                                <p>Thường trả lời trong vài phút</p>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-widget-messages">
                        {loading ? (
                            <div className="chat-loading">Đang tải lịch sử chat...</div>
                        ) : messages.length === 0 ? (
                            <div className="chat-empty">
                                <p>👋 Xin chào! Hãy gửi tin nhắn để được hỗ trợ nhé.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className={`chat-msg ${msg.senderId === currentUser._id || msg.senderId?._id === currentUser._id
                                        ? "sent"
                                        : "received"
                                        }`}
                                >
                                    {msg.content}
                                    <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            ))
                        )}
                        {isTyping && <div className="chat-typing">Admin đang nhập...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-widget-input">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={inputMsg}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={!inputMsg.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
