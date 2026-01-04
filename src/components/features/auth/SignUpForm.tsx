import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { SignUpFormInput } from "../../../features/auth/domain";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export function SignUpForm({ onSwitchToLogin }: SignupFormProps) {
  const { control } = useFormContext<SignUpFormInput>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Name */}
      <div className="flex gap-5">
        <FormField
          control={control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">First Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Last Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Email Address</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Password */}
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Password</FormLabel>
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

      {/* Switch to login */}
      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Button
              type="button"
              variant={"link"}
              className="text-secondary-400 p-1"
              onClick={onSwitchToLogin}
            >
              Log in
            </Button>
          </p>
        </div>
      )}
    </>
  );
}
