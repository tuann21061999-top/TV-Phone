import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Search, Send, MessageSquare, User } from "lucide-react";
import "./ManageChat.css";

const SOCKET_URL = "http://localhost:5000";

function ManageChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [selectedUserEmail, setSelectedUserEmail] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [adminId, setAdminId] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // ─── Fetch admin profile & init socket ────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/users/profile", { headers });
                setAdminId(data._id);

                // Kết nối socket
                const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
                socketRef.current = socket;

                socket.on("connect", () => {
                    socket.emit("join_room", data._id);
                });

                socket.on("receive_message", (msg) => {
                    setMessages((prev) => [...prev, msg]);
                    // Refresh conversations list
                    fetchConversations();
                });

                socket.on("user_typing", ({ senderId }) => {
                    if (senderId === selectedUserId) setIsTyping(true);
                });
                socket.on("user_stop_typing", ({ senderId }) => {
                    if (senderId === selectedUserId) setIsTyping(false);
                });

            } catch (error) {
                console.error("Lỗi init admin chat:", error);
            }
        };

        init();
        fetchConversations();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Fetch danh sách conversations ────────────────────────────
    const fetchConversations = async () => {
        try {
            const { data } = await axios.get(
                "http://localhost:5000/api/chat/admin/conversations",
                { headers }
            );
            setConversations(data);
        } catch (error) {
            console.error("Lỗi fetch conversations:", error);
        }
    };

    // ─── Chọn conversation → load history ────────────────────────
    const selectConversation = async (userId, userName, userEmail) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setSelectedUserEmail(userEmail);

        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/chat/conversation/${userId}`,
                { headers }
            );
            setMessages(data);

            // Đánh dấu đã đọc
            await axios.put(`http://localhost:5000/api/chat/mark-read/${userId}`, {}, { headers });

            // Cập nhật unread count
            setConversations((prev) =>
                prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
            );
        } catch (error) {
            console.error("Lỗi load chat history:", error);
        }
    };

    // ─── Auto-scroll ──────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // ─── Gửi tin nhắn ────────────────────────────────────────────
    const handleSend = () => {
        if (!inputMsg.trim() || !selectedUserId || !socketRef.current || !adminId) return;

        socketRef.current.emit("send_message", {
            senderId: adminId,
            receiverId: selectedUserId,
            content: inputMsg.trim(),
        });

        // Optimistic update
        setMessages((prev) => [
            ...prev,
            {
                _id: Date.now().toString(),
                senderId: adminId,
                receiverId: selectedUserId,
                content: inputMsg.trim(),
                createdAt: new Date().toISOString(),
            },
        ]);

        setInputMsg("");

        socketRef.current.emit("stop_typing", {
            senderId: adminId,
            receiverId: selectedUserId,
        });
    };

    const handleInputChange = (e) => {
        setInputMsg(e.target.value);

        if (socketRef.current && selectedUserId) {
            socketRef.current.emit("typing", {
                senderId: adminId,
                receiverId: selectedUserId,
            });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit("stop_typing", {
                    senderId: adminId,
                    receiverId: selectedUserId,
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
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();

        if (isToday) {
            return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        }
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredConversations = conversations.filter(
        (c) =>
            c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── RENDER ───────────────────────────────────────────────────
    return (
        <div className="manage-chat-container">
            {/* Sidebar: Danh sách conversation */}
            <div className="mc-sidebar">
                <div className="mc-sidebar-header">
                    <h3>💬 Tin nhắn</h3>
                    <div className="mc-sidebar-search">
                        <Search size={14} color="#94A3B8" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mc-conversation-list">
                    {filteredConversations.length === 0 ? (
                        <div className="mc-no-convs">
                            <MessageSquare size={32} />
                            <p>Chưa có cuộc hội thoại nào</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.userId}
                                className={`mc-conv-item ${selectedUserId === conv.userId ? "active" : ""}`}
                                onClick={() => selectConversation(conv.userId, conv.userName, conv.userEmail)}
                            >
                                <div className="mc-conv-avatar">{getInitials(conv.userName)}</div>
                                <div className="mc-conv-info">
                                    <p className="mc-conv-name">{conv.userName}</p>
                                    <p className="mc-conv-preview">{conv.lastMessage}</p>
                                </div>
                                <div className="mc-conv-meta">
                                    <span className="mc-conv-time">{formatTime(conv.lastMessageTime)}</span>
                                    {conv.unreadCount > 0 && (
                                        <span className="mc-unread-badge">{conv.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="mc-chat-area">
                {!selectedUserId ? (
                    <div className="mc-empty-state">
                        <MessageSquare size={48} />
                        <h3>Chọn một cuộc trò chuyện</h3>
                        <p>Chọn khách hàng ở bên trái để bắt đầu chat</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="mc-chat-header">
                            <div className="mc-conv-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                                {getInitials(selectedUserName)}
                            </div>
                            <div>
                                <p className="mc-chat-user-name">{selectedUserName}</p>
                                <p className="mc-chat-user-email">{selectedUserEmail}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="mc-chat-messages">
                            {messages.length === 0 ? (
                                <div className="mc-empty-state">
                                    <p>Bắt đầu trò chuyện với khách hàng</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`mc-msg ${msg.senderId === adminId || msg.senderId?._id === adminId
                                            ? "sent"
                                            : "received"
                                            }`}
                                    >
                                        {msg.content}
                                        <span className="mc-msg-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                ))
                            )}
                            {isTyping && <div className="mc-typing">Khách hàng đang nhập...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="mc-chat-input">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn trả lời..."
                                value={inputMsg}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="mc-send-btn"
                                onClick={handleSend}
                                disabled={!inputMsg.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ManageChat;
