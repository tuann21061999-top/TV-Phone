import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MessageCircle, X, Send, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = `${import.meta.env.VITE_API_URL}`;

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
    const [isChatArchived, setIsChatArchived] = useState(false);
    const [aiMessages, setAiMessages] = useState([
        { _id: "1", content: "Chào bạn! Mình là Trợ lý ảo AI của V&T Nexis, mình có thể gợi ý điện thoại gì cho bạn hôm nay?", senderId: "ai", createdAt: new Date().toISOString() }
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
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
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
            setIsChatArchived(false);
            if (!isOpen) setHasUnread(true); // Hiện dot unread nếu chat đang đóng
        });

        socket.on("user_typing", () => setIsTyping(true));
        socket.on("user_stop_typing", () => setIsTyping(false));

        socket.on("conversation_ended", () => {
            setIsChatArchived(true);
        });

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
                const adminRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/admins`, { headers });
                if (adminRes.data.length === 0) return;
                const admin = adminRes.data[0];
                setAdminId(admin._id);

                // 2. Lấy lịch sử chat
                const chatRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/chat/conversation/${admin._id}`,
                    { headers }
                );
                
                if (chatRes.data.length > 0) {
                    setIsChatArchived(chatRes.data[chatRes.data.length - 1].isArchived || false);
                } else {
                    setIsChatArchived(false);
                }

                // Lọc bỏ đi các tin nhắn đã bị admin archived, chỉ giữ lại lượt hội thoại (session) chưa kết thúc
                const activeMessages = chatRes.data.filter(m => !m.isArchived);
                setMessages(activeMessages);
                
                setHasUnread(false);

                // 3. Đánh dấu đã đọc
                await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/mark-read/${admin._id}`, {}, { headers });
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

                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
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
            {/* Inject keyframe cho hiệu ứng trượt lên mượt mà */}
            <style>
                {`
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-chatSlideUp {
                    animation: chatSlideUp 0.3s ease-out forwards;
                }
                `}
            </style>

            {/* Nút mở chat */}
            <button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none cursor-pointer flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.4)] z-[9998] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)]"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {hasUnread && !isOpen && <span className="absolute top-[2px] right-[2px] w-[14px] h-[14px] bg-red-500 rounded-full border-2 border-white" />}
            </button>

            {/* Khung chat */}
            {isOpen && (
                <div className="fixed bottom-[90px] right-6 w-[370px] h-[500px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col z-[9999] overflow-hidden min-h-0 animate-chatSlideUp max-[480px]:w-[calc(100vw-16px)] max-[480px]:right-2 max-[480px]:bottom-[80px] max-[480px]:h-[60vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-[18px] py-[14px] bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        <div className="flex items-center gap-[10px]">
                            <div className="w-[36px] h-[36px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <Headphones size={18} />
                            </div>
                            <div>
                                <h4 className="m-0 text-[14px] font-semibold">Hỗ trợ V&T Nexis</h4>
                                <div className="flex gap-[5px] mt-1">
                                    <button
                                        onClick={() => setChatMode("admin")}
                                        className={`text-[11px] px-2 py-0.5 rounded-full border-none cursor-pointer font-semibold transition-colors ${chatMode === "admin" ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}
                                    >
                                        CSKH
                                    </button>
                                    <button
                                        onClick={() => setChatMode("ai")}
                                        className={`text-[11px] px-2 py-0.5 rounded-full border-none cursor-pointer font-semibold transition-colors ${chatMode === "ai" ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}
                                    >
                                        AI Tư vấn
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            className="bg-transparent border-none text-white cursor-pointer opacity-80 flex transition-opacity duration-200 hover:opacity-100 p-0"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[10px] bg-[#F8FAFC] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {chatMode === "admin" ? (
                            <>
                                {loading ? (
                                    <div className="flex items-center justify-center p-5 text-slate-400 text-[13px]">Đang tải lịch sử chat...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-slate-400 py-10 px-5 text-[13px]">
                                        <p>👋 Xin chào! Hãy gửi tin nhắn để gặp chuyên viên hỗ trợ.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={msg._id || idx}
                                            className={`max-w-[80%] px-[14px] py-[10px] rounded-2xl text-[13px] leading-relaxed break-words ${msg.senderId === currentUser._id || msg.senderId?._id === currentUser._id
                                                    ? "self-end bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm shadow-sm"
                                                    : "self-start bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
                                                }`}
                                        >
                                            {msg.content}
                                            <span className="text-[10px] opacity-70 mt-1 block">{formatTime(msg.createdAt)}</span>
                                        </div>
                                    ))
                                )}
                                {isTyping && <div className="self-start text-[12px] text-slate-400 italic py-1">Admin đang nhập...</div>}
                            </>
                        ) : (
                            <>
                                {aiMessages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`max-w-[80%] px-[14px] py-[10px] rounded-2xl text-[13px] leading-relaxed break-words ${msg.senderId === currentUser._id
                                                ? "self-end bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm shadow-sm"
                                                : "self-start bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
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
                                        <span className="text-[10px] opacity-70 mt-1 block">{formatTime(msg.createdAt)}</span>
                                    </div>
                                ))}
                                {aiLoading && <div className="self-start text-[12px] text-slate-400 italic py-1">AI đang suy nghĩ...</div>}
                            </>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {isChatArchived && chatMode === "admin" ? (
                        <div className="flex flex-col items-center justify-center p-4 border-t border-slate-200 bg-white text-center">
                            <p className="text-[13px] text-slate-500 mb-2 mt-2 m-0">Admin đã kết thúc cuộc trò chuyện này.</p>
                            <button 
                                className="text-[13px] text-blue-600 font-semibold bg-transparent border-none cursor-pointer hover:underline p-0 mb-2"
                                onClick={() => {
                                    setIsChatArchived(false);
                                    setMessages([]);
                                }}
                            >
                                Nhấn vào đây để mở cuộc trò chuyện mới
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-[14px] py-[12px] border-t border-slate-200 bg-white">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={inputMsg}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-[13px] outline-none transition-all duration-200 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
                            />
                            <button
                                className="w-[38px] h-[38px] min-w-[38px] min-h-[38px] rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSend}
                                disabled={!inputMsg.trim()}
                            >
                                <Send size={20} color="#ffffff" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ChatWidget;
