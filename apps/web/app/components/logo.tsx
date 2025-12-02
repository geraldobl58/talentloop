import Image from "next/image";

export const Logo = () => {
  return (
    <Image
      src="/assets/images/logo.svg"
      alt="TalentLoop Logo"
      width={50}
      height={50}
      priority
    />
  );
};
