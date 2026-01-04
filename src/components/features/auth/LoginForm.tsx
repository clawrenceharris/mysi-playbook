"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, FormMessage, Input } from "@/components/ui";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { LoginFormInput } from "../../../features/auth/domain";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: (email: string) => void;
  className?: string;
}

export function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
}: LoginFormProps) {
  const { getValues, control } = useFormContext<LoginFormInput>();
  const [showPassword, setShowPassword] = useState(false);
  const handleForgotPassword = () => {
    onForgotPassword?.(getValues("email"));
  };
  return (
    <>
      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Email Address</FormLabel>
            <FormControl>
              <Input
                type="email"
                disabled={field.disabled}
                placeholder="Enter your email"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Password */}
      <div>
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>

              <div className="relative">
                <FormControl>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={field.disabled}
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="link"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex my-4 justify-end">
          {onForgotPassword && (
            <Button
              variant={"link"}
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Button>
          )}
        </div>
      </div>

      {/* Switch to signup */}
      {onSwitchToSignup && (
        <div className="text-center mt-4 bg-muted">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant={"link"}
              className="text-secondary-400 p-1"
              onClick={onSwitchToSignup}
            >
              Sign up
            </Button>
          </p>
        </div>
      )}
    </>
  );
}
