import Hero from "./Hero";
import { stageClasses } from "../config/colors";

export default function PageHero({ lines, accentIndex, color }) {
  const c = stageClasses[color];
  return <Hero lines={lines} accentIndex={accentIndex} bgClass={c.bg} compact />;
}
