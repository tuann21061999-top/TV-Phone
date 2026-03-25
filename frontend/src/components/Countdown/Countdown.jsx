import { useState, useEffect, useCallback } from "react";
import "./Countdown.css";

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
      return <span className="expired-text">Đã kết thúc</span>;
  }

  return (
    <div className="countdown-timer">
        {timeLeft.days > 0 && <div className="time-box"><span>{timeLeft.days}</span><span>Ngày</span></div>}
        <div className="time-box"><span>{timeLeft.hours.toString().padStart(2, '0')}</span><span>Giờ</span></div>
        <span className="colon">:</span>
        <div className="time-box"><span>{timeLeft.minutes.toString().padStart(2, '0')}</span><span>Phút</span></div>
        <span className="colon">:</span>
        <div className="time-box"><span>{timeLeft.seconds.toString().padStart(2, '0')}</span><span>Giây</span></div>
    </div>
  );
}

export default Countdown;