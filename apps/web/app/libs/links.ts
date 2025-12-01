interface NavLink {
  label: string;
  href: string;
}

export const routes: NavLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Planos",
    href: "/plans",
  },
  {
    label: "Dúvidas",
    href: "/faq",
  },
  {
    label: "Contato",
    href: "/contact",
  },
];
