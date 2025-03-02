import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", src, alt = "", fallback, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      sm: "h-6 w-6",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizes[size], className)}
        {...props}
      >
        {src && !imageError ? (
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <AvatarPrimitive.Fallback
            className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
          >
            {fallback ? (
              <span className="text-xs font-medium">{fallback}</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </AvatarPrimitive.Fallback>
        )}
      </AvatarPrimitive.Root>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
