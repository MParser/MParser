import * as AiIcons from "vue-icons-plus/ai";
import * as BiIcons from "vue-icons-plus/bi";
import * as BsIcons from "vue-icons-plus/bs";
import * as ElementIcons from "vue-icons-plus/ep";
import * as GrIcons from "vue-icons-plus/gr";
import * as HiIcons from "vue-icons-plus/hi";
import * as RiIcons from "vue-icons-plus/ri";
import * as PiIcons from "vue-icons-plus/pi";

// 合并所有图标组
const iconGroups = [
  ElementIcons,
  AiIcons,
  BsIcons,
  BiIcons,
  GrIcons,
  HiIcons,
  RiIcons,
  PiIcons
];
const icons = iconGroups.reduce(
  (acc, iconGroup) => ({
    ...acc,
    ...Object.fromEntries(Object.entries(iconGroup))
  }),
  {}
);
export { icons };
