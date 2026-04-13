import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Search, Send, MessageSquare, User, XCircle } from "lucide-react";
import { toast } from "sonner";

const SOCKET_URL = `${import.meta.env.VITE_API_URL}`;

function ManageChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [selectedUserEmail, setSelectedUserEmail] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("active");
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
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, { headers });
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

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (adminId) fetchConversations(activeTab);
    }, [activeTab, adminId]);

    // ─── Fetch danh sách conversations ────────────────────────────
    const fetchConversations = async (tabStr = activeTab) => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/chat/admin/conversations?tab=${tabStr}`,
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
                `${import.meta.env.VITE_API_URL}/api/chat/conversation/${userId}`,
                { headers }
            );
            setMessages(data);

            // Đánh dấu đã đọc
            await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/mark-read/${userId}`, {}, { headers });

            // Cập nhật unread count
            setConversations((prev) =>
                prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
            );
        } catch (error) {
            console.error("Lỗi load chat history:", error);
        }
    };

    // ─── Kết thúc trò chuyện ──────────────────────────────────────
    const handleEndChat = async () => {
        if (!selectedUserId) return;
        if (!window.confirm("Bạn có chắc chắn muốn kết thúc và xóa toàn bộ dữ liệu trò chuyện này?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/admin/conversation/${selectedUserId}`, { headers });
            
            if (socketRef.current && adminId) {
                socketRef.current.emit("end_conversation", {
                    adminId,
                    userId: selectedUserId
                });
            }

            toast.success("Đã xóa và kết thúc trò chuyện thành công");
            setSelectedUserId(null);
            setSelectedUserName("");
            setSelectedUserEmail("");
            setMessages([]);
            fetchConversations();
        } catch (error) {
            console.error("Lỗi kết thúc trò chuyện:", error);
            toast.error("Không thể kết thúc trò chuyện: " + (error.response?.data?.message || error.message));
        }
    };

    // ─── Auto-scroll ──────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
        <div className="grid grid-cols-[320px_1fr] h-[calc(100vh-130px)] min-h-[500px] w-full box-border bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] max-[768px]:grid-cols-1 max-[768px]:h-auto">
            {/* Sidebar: Danh sách conversation */}
            <div className="border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC] min-h-0 max-h-full overflow-hidden max-[768px]:max-h-[250px]">
                <div className="p-[16px] border-b border-[#E2E8F0] bg-white">
                    <h3 className="m-0 mb-[10px] text-[16px] text-[#1E293B]">💬 Tin nhắn</h3>
                    <div className="flex gap-[8px] mb-[12px]">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`flex-1 p-[6px] text-[13px] cursor-pointer rounded-[4px] border border-[#E2E8F0] transition-colors ${activeTab === 'active' ? 'bg-[#E2E8F0]' : 'bg-white'}`}
                        >
                            Đang hoạt động
                        </button>
                        <button
                            onClick={() => setActiveTab("archived")}
                            className={`flex-1 p-[6px] text-[13px] cursor-pointer rounded-[4px] border border-[#E2E8F0] transition-colors ${activeTab === 'archived' ? 'bg-[#E2E8F0]' : 'bg-white'}`}
                        >
                            Lịch sử
                        </button>
                    </div>
                    <div className="flex items-center gap-[8px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] py-[8px] px-[12px]">
                        <Search size={14} color="#94A3B8" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-none outline-none bg-transparent w-full text-[13px]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-[40px] px-[20px] text-[#94A3B8] text-center gap-[10px]">
                            <MessageSquare size={32} />
                            <p className="m-0 text-[13px]">Chưa có cuộc hội thoại nào</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.userId}
                                className={`flex items-center gap-[12px] py-[14px] px-[16px] cursor-pointer border-b border-[#F1F5F9] transition-colors duration-200 relative hover:bg-[#EFF6FF] ${selectedUserId === conv.userId ? "bg-[#DBEAFE] border-l-[3px] border-l-[#2563EB]" : ""}`}
                                onClick={() => selectConversation(conv.userId, conv.userName, conv.userEmail)}
                            >
                                <div className="w-[42px] h-[42px] rounded-full bg-[linear-gradient(135deg,#E0E7FF,#C7D2FE)] flex items-center justify-center text-[#4338CA] font-bold text-[16px] shrink-0">
                                    {getInitials(conv.userName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold text-[#1E293B] m-0 mb-[3px]">{conv.userName}</p>
                                    <p className="text-[12px] text-[#64748B] m-0 truncate">{conv.lastMessage}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[11px] text-[#94A3B8] block mb-[4px]">{formatTime(conv.lastMessageTime)}</span>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-[#EF4444] text-white text-[10px] font-bold py-[2px] px-[7px] rounded-[10px] inline-block">{conv.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col bg-white min-h-0 max-h-full overflow-hidden">
                {!selectedUserId ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] gap-[10px]">
                        <MessageSquare size={48} />
                        <h3 className="text-[#64748B] m-0">Chọn một cuộc trò chuyện</h3>
                        <p className="m-0 text-[13px]">Chọn khách hàng ở bên trái để bắt đầu chat</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-[12px] py-[16px] px-[20px] border-b border-[#E2E8F0] bg-white">
                            <div className="flex items-center gap-[12px] flex-1">
                                <div className="w-[36px] h-[36px] rounded-full bg-[linear-gradient(135deg,#E0E7FF,#C7D2FE)] flex items-center justify-center text-[#4338CA] font-bold text-[14px] shrink-0">
                                    {getInitials(selectedUserName)}
                                </div>
                                <div>
                                    <p className="text-[15px] font-semibold text-[#1E293B] m-0">{selectedUserName}</p>
                                    <p className="text-[12px] text-[#64748B] m-0">{selectedUserEmail}</p>
                                </div>
                            </div>
                            {activeTab !== "archived" && (
                                <button 
                                    className="flex items-center gap-[6px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] rounded-[6px] py-[6px] px-[12px] text-[13px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#F87171]" 
                                    onClick={handleEndChat} 
                                    title="Kết thúc trò chuyện"
                                >
                                    <XCircle size={16} />
                                    <span>Kết thúc</span>
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[10px] bg-[#F8FAFC] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] gap-[10px]">
                                    <p className="m-0 text-[13px]">Bắt đầu trò chuyện với khách hàng</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={`max-w-[70%] py-[10px] px-[14px] rounded-[14px] text-[13px] leading-[1.5] break-words ${
                                            msg.senderId === adminId || msg.senderId?._id === adminId
                                                ? "self-end bg-[linear-gradient(135deg,#2563EB,#3B82F6)] text-white rounded-br-[4px]"
                                                : "self-start bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-[4px]"
                                        }`}
                                    >
                                        {msg.content}
                                        <span className="text-[10px] opacity-70 mt-[4px] block">{formatTime(msg.createdAt)}</span>
                                    </div>
                                ))
                            )}
                            {isTyping && <div className="self-start text-[12px] text-[#94A3B8] italic">Khách hàng đang nhập...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex items-center gap-[10px] py-[14px] px-[20px] border-t border-[#E2E8F0] bg-white">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn trả lời..."
                                value={inputMsg}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="flex-1 border border-[#E2E8F0] rounded-[24px] py-[10px] px-[18px] text-[13px] outline-none transition-all duration-200 focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                            />
                            <button
                                className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-full bg-[linear-gradient(135deg,#2563EB,#7C3AED)] text-white border-none cursor-pointer flex items-center justify-center transition-transform duration-200 shrink-0 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSend}
                                disabled={!inputMsg.trim()}
                            >
                                <Send className="w-[20px] h-[20px] min-w-[20px] min-h-[20px]" color="#ffffff" strokeWidth={2.5} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ManageChat;
