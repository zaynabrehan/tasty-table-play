interface JushhLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl md:text-6xl",
  xl: "text-6xl md:text-8xl",
};

const taglineSizeMap = {
  sm: "text-[8px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

const JushhLogo = ({ size = "md", showTagline = false, className = "" }: JushhLogoProps) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <span className={`${sizeMap[size]} font-display font-extrabold leading-none tracking-tight`}>
        <span className="text-orange-dark">Ju</span>
        <span className="text-red-dark">shh</span>
        <span className="text-red-dark">!!</span>
      </span>
      {showTagline && (
        <span className={`${taglineSizeMap[size]} font-body text-primary tracking-wider mt-1`}>
          Food That Makes You Go Shh..
        </span>
      )}
    </div>
  );
};

export default JushhLogo;
