import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) =>
<div ref={ref} className={cn("bg-card text-card-foreground shadow-sm rounded-3xl mt-0 border-solid border-4 border-sidebar-ring mb-[15px]", className)} {...props} />
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div ref={ref} className={cn("flex-col space-y-1.5 p-6 rounded-3xl shadow-2xl ml-[10px] mr-[10px] bg-yellow-50 text-primary flex items-center justify-center pt-[5px] pb-[5px] mt-[10px] mb-[10px]", className)} {...props} />

);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) =>
  <h3 ref={ref} className={cn("text-2xl leading-none tracking-tight font-extrabold text-green-700", className)} {...props} />

);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) =>
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />

);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 rounded-3xl shadow-2xl mx-[10px] bg-[#a8a885] my-[10px] mt-[10px] pt-[10px]", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />

);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };