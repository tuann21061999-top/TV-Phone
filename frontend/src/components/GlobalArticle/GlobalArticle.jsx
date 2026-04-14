import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, User, Eye, ChevronRight, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function GlobalArticle({ pageCode }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGlobalArticle = async () => {
      try {
        // Gọi API lấy bài viết có displayLocations chứa pageCode
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news?displayLocation=${pageCode}`);
        if (data && data.length > 0) {
          setArticle(data[0]); // Chốt hiển thị bài viết mới nhất được gán
        }
      } catch (error) {
        console.error(`Lỗi lấy bài viết cho trang ${pageCode}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalArticle();
  }, [pageCode]);

  if (loading || !article) return null;

  const createdDate = new Date(article.createdAt);
  const dateStr = createdDate.toLocaleDateString("vi-VN");
  const timeStr = createdDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="w-full bg-white border-t-8 border-blue-50 py-10 md:py-14 mt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      <div className="max-w-[820px] mx-auto px-5 w-full font-['Inter',sans-serif]">
        
        {/* Tiêu đề & Thông tin cơ bản */}
        <header className="mb-8">
            <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-[13px] font-semibold">
                    {article.category}
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                    <User size={14}/> Viết bởi {article.author}
                </span>
            </div>
            
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-slate-900 leading-[1.3] mb-5 tracking-[-0.01em]">
                {article.title}
            </h2>
            
            <div className="flex items-center gap-5 text-slate-500 text-sm border-b border-slate-100 pb-5 flex-wrap">
                <span className="flex items-center gap-1.5"><Calendar size={16} /> {dateStr}</span>
                <span className="flex items-center gap-1.5"><Clock size={16} /> {timeStr}</span>
                <span className="flex items-center gap-1.5"><Eye size={16} /> {article.views} lượt xem</span>
            </div>
        </header>

        {/* Nội dung đầy đủ của bài viết */}
        <article className="max-w-none">
            {article.contentBlocks?.map((block, idx) => {
                // Heading block → mục chính lớn
                if (block.type === "heading") {
                    return (
                        <h2 key={idx} className="text-[20px] md:text-[24px] font-bold text-slate-900 leading-snug mt-10 mb-3 pb-2 border-b-2 border-blue-500/30">
                            {block.value}
                        </h2>
                    );
                }
                if (block.type === "text") {
                    return (
                        <div 
                            key={idx}
                            className="text-[16px] md:text-[17px] leading-[1.85] text-slate-600 mb-5
                                [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-4
                                [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-3
                                [&_p]:mb-4
                                [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:list-disc
                                [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal
                                [&_li]:mb-2 [&_li]:leading-[1.7]
                                [&_a]:text-blue-500 [&_a]:underline
                                [&_strong]:text-slate-800 [&_strong]:font-semibold"
                            dangerouslySetInnerHTML={{ __html: block.value }} 
                        />
                    );
                }
                // Image block
                return (
                    <div key={idx} className="text-center my-4">
                        <img src={block.value} alt={`Hình minh họa ${idx + 1}`} className="max-w-full rounded-xl shadow-sm mx-auto" />
                    </div>
                );
            })}
        </article>

        {/* Cục điều hướng đọc thêm tại trang tin tức thực */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-center">
            <button 
                onClick={() => navigate(`/news/${article.slug}`)} 
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 text-[15px] cursor-pointer border-none"
            >
                Mở rộng thảo luận <ChevronRight size={18} />
            </button>
        </div>

      </div>
    </section>
  );
}

export default GlobalArticle;
