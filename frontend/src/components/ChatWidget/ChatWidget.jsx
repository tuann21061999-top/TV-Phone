import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MessageCircle, X, Send, Headphones } from "lucide-react";
import "./ChatWidget.css";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = "http://localhost:5000";

function ChatWidget() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [adminId, setAdminId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatMode, setChatMode] = useState("admin"); // 'admin' hoặc 'ai'
    const [aiMessages, setAiMessages] = useState([
        { _id: "1", content: "Chào bạn! Mình là Trợ lý ảo AI của TechStore, mình có thể gợi ý điện thoại gì cho bạn hôm nay?", senderId: "ai", createdAt: new Date().toISOString() }
    ]);
    const [aiLoading, setAiLoading] = useState(false);

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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isTyping, aiMessages, aiLoading, chatMode]);

    // ─── Gửi tin nhắn ────────────────────────────────────────────
    const handleSend = async () => {
        if (!inputMsg.trim()) return;

        if (chatMode === "ai") {
            const userMsg = inputMsg.trim();
            setInputMsg("");

            const newAiMessages = [
                ...aiMessages,
                { _id: Date.now().toString(), content: userMsg, senderId: currentUser._id, createdAt: new Date().toISOString() }
            ];
            setAiMessages(newAiMessages);
            setAiLoading(true);

            try {
                const history = newAiMessages.slice(1, -1).map(m => ({ // Bỏ câu chào đầu để tiết kiệm token
                    role: m.senderId === "ai" ? "model" : "user",
                    text: m.content
                }));

                const res = await axios.post("http://localhost:5000/api/ai/chat", {
                    message: userMsg,
                    history: history
                });

                setAiMessages(prev => [
                    ...prev,
                    { _id: Date.now().toString(), content: res.data.reply, senderId: "ai", createdAt: new Date().toISOString() }
                ]);
            } catch (error) {
                setAiMessages(prev => [
                    ...prev,
                    { _id: Date.now().toString(), content: "Xin lỗi, Hệ thống AI đang bận hoặc vượt quá giới hạn API. Vui lòng thử lại sau!", senderId: "ai", createdAt: new Date().toISOString() }
                ]);
            } finally {
                setAiLoading(false);
            }
            return;
        }

        // Logic Chat Admin (Socket)
        if (!adminId || !socketRef.current) return;

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

        if (chatMode === "admin" && socketRef.current && adminId) {
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
    // Hàm xử lý khi người dùng bấm vào link do AI tạo ra
    const handleAiLinkClick = (e) => {
        // Kiểm tra xem thẻ bị click có phải là thẻ <a> không
        if (e.target.tagName === 'A') {
            e.preventDefault(); // Chặn tải lại trang
            const href = e.target.getAttribute('href');

            if (href) {
                setIsOpen(false); // Đóng khung chat lại cho gọn (tuỳ chọn, bạn có thể xóa dòng này nếu muốn giữ chat mở)
                navigate(href);   // Chuyển sang trang sản phẩm cực mượt
            }
        }
    };
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
                                <h4>Hỗ trợ TechStore</h4>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                                    <button
                                        onClick={() => setChatMode("admin")}
                                        style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: 'none', background: chatMode === "admin" ? '#fff' : 'rgba(255,255,255,0.3)', color: chatMode === "admin" ? '#2563eb' : '#fff', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        CSKH
                                    </button>
                                    <button
                                        onClick={() => setChatMode("ai")}
                                        style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: 'none', background: chatMode === "ai" ? '#fff' : 'rgba(255,255,255,0.3)', color: chatMode === "ai" ? '#2563eb' : '#fff', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        AI Tư vấn
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-widget-messages">
                        {chatMode === "admin" ? (
                            <>
                                {loading ? (
                                    <div className="chat-loading">Đang tải lịch sử chat...</div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-empty">
                                        <p>👋 Xin chào! Hãy gửi tin nhắn để gặp chuyên viên hỗ trợ.</p>
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
                            </>
                        ) : (
                            <>
                                {aiMessages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`chat-msg ${msg.senderId === currentUser._id
                                            ? "sent"
                                            : "received"
                                            }`}
                                    >
                                        {/* Phân tách: Nếu là AI thì render HTML để có Link, nếu là User thì in text thường để chống hack */}
                                        {msg.senderId === "ai" ? (
                                            <div
                                                style={{ whiteSpace: 'pre-line' }}
                                                dangerouslySetInnerHTML={{ __html: msg.content }}
                                                onClick={handleAiLinkClick}
                                            />
                                        ) : (
                                            <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
                                        )}
                                        <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                ))}
                                {aiLoading && <div className="chat-typing">AI đang suy nghĩ...</div>}
                            </>
                        )}

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
                            <Send size={20} color="#ffffff" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
