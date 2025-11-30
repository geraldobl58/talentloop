import Link from "next/link";

export const Header = () => {
  return (
    <header>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">Sobre</Link>
        </li>
        <li>
          <Link href="/plans">Plans</Link>
        </li>
        <li>
          <Link href="/question">Duvidas</Link>
        </li>
        <li>
          <Link href="/contact">Contato</Link>
        </li>
      </ul>
    </header>
  );
};
