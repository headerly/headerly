import type { ProfileGroupColor } from "@/lib/schema";

export function getProfileGroupColorClass(color: ProfileGroupColor) {
  return {
    slate: "bg-slate-400!",
    blue: "bg-blue-400!",
    red: "bg-red-400!",
    yellow: "bg-yellow-300!",
    green: "bg-green-400!",
    pink: "bg-pink-400!",
    purple: "bg-purple-400!",
    cyan: "bg-cyan-300!",
    orange: "bg-orange-300!",
  }[color];
}
