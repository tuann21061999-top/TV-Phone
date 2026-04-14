export const getBannerStyles = (theme = "blue") => {
  switch(theme) {
    case "purple":
      return {
        bg: "bg-gradient-to-br from-fuchsia-50 via-white to-purple-50",
        blob1: "bg-purple-300/40",
        blob2: "bg-fuchsia-300/40",
        btn: "bg-purple-600 hover:bg-purple-700 shadow-[0_8px_20px_rgba(147,51,234,0.35)]",
        badge: "bg-white/80 backdrop-blur-md border border-purple-100 text-purple-600 shadow-sm",
        title: "text-purple-950",
        subtitle: "text-purple-800/80"
      };
    case "rose":
      return {
        bg: "bg-gradient-to-br from-rose-50 via-white to-orange-50",
        blob1: "bg-rose-300/40",
        blob2: "bg-orange-300/40",
        btn: "bg-rose-600 hover:bg-rose-700 shadow-[0_8px_20px_rgba(225,29,72,0.35)]",
        badge: "bg-white/80 backdrop-blur-md border border-rose-100 text-rose-600 shadow-sm",
        title: "text-rose-950",
        subtitle: "text-rose-800/80"
      };
    case "emerald":
      return {
        bg: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
        blob1: "bg-emerald-300/50",
        blob2: "bg-teal-300/40",
        btn: "bg-emerald-600 hover:bg-emerald-700 shadow-[0_8px_20px_rgba(5,150,105,0.35)]",
        badge: "bg-white/80 backdrop-blur-md border border-emerald-100 text-emerald-700 shadow-sm",
        title: "text-emerald-950",
        subtitle: "text-emerald-800/80"
      };
    case "dark":
      return {
        bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-800/80",
        blob1: "bg-blue-500/30",
        blob2: "bg-indigo-500/30",
        btn: "bg-blue-500 hover:bg-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_10px_25px_rgba(59,130,246,0.5)]",
        badge: "bg-slate-800/80 backdrop-blur-md border border-slate-700 text-blue-400 shadow-lg",
        title: "text-white",
        subtitle: "text-slate-300"
      };
    default: // blue
      return {
        bg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
        blob1: "bg-blue-400/30",
        blob2: "bg-indigo-400/30",
        btn: "bg-blue-600 hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.35)]",
        badge: "bg-white/80 backdrop-blur-md border border-blue-100 text-blue-600 shadow-sm",
        title: "text-slate-900",
        subtitle: "text-slate-600"
      };
  }
};
