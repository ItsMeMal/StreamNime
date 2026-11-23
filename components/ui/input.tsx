"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  const classes = ["ui-input", className].filter(Boolean).join(" ");
  return <input ref={ref} type={type} className={classes} {...props} />;
});