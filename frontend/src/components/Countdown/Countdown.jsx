import { useState, useEffect } from "react";
import "./Countdown.css";

function Countdown() {
  const [time, setTime] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <div className="countdown">
      <div>{hours} Giờ</div>
      <div>{minutes} Phút</div>
      <div>{seconds} Giây</div>
    </div>
  );
}

export default Countdown;