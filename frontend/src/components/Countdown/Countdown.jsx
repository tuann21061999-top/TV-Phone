import { useState, useEffect, useCallback } from "react";

function Countdown({ targetDate }) {
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return {};
    const difference = +new Date(targetDate) - +new Date();
    let left = {};

    if (difference > 0) {
      left = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return left;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateTimeLeft]);

  if (Object.keys(timeLeft).length === 0) {
    return <span className="block text-red-500 font-semibold text-[14px] my-2.5">Đã kết thúc</span>;
  }

  return (
    <div className="flex items-center gap-2 my-2.5">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center justify-center bg-[#1f2937] text-white rounded-lg p-2 min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          <span className="text-[18px] font-extrabold leading-none">{timeLeft.days}</span>
          <span className="text-[10px] uppercase opacity-80 mt-1">Ngày</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center bg-[#1f2937] text-white rounded-lg p-2 min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        <span className="text-[18px] font-extrabold leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase opacity-80 mt-1">Giờ</span>
      </div>

      <span className="font-black text-inherit text-[20px] mx-[2px]">:</span>

      <div className="flex flex-col items-center justify-center bg-[#1f2937] text-white rounded-lg p-2 min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        <span className="text-[18px] font-extrabold leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase opacity-80 mt-1">Phút</span>
      </div>

      <span className="font-black text-inherit text-[20px] mx-[2px]">:</span>

      <div className="flex flex-col items-center justify-center bg-[#1f2937] text-white rounded-lg p-2 min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        <span className="text-[18px] font-extrabold leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase opacity-80 mt-1">Giây</span>
      </div>
    </div>
  );
}

export default Countdown;