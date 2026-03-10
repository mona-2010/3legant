import dynamic from "next/dynamic.js";

export const NavigationHeader = dynamic(() => import("../components/layout/navigationHeader"), {
  ssr: false,
});

export const Header = dynamic(() => import("../components/layout/header"), {
  ssr: false,
});

export const TitleGrid = dynamic(() => import("../components/layout/titlegrid"), {
  ssr: false,
});

