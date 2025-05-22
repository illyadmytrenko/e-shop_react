interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <img
      alt="logo"
      src="/logo.svg"
      width={56}
      height={63}
      className={className}
    />
  );
}
