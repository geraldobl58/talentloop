import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold">
      <Image
        src="/assets/images/logo.svg"
        alt="TalentLoop Logo"
        width={50}
        height={50}
      />
    </Link>
  );
};
