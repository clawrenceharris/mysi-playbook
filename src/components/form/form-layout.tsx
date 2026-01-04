/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, type ReactNode } from "react";
import {
  useForm,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
  Resolver,
} from "react-hook-form";
import { Form, FormDescription, FormMessage } from "../ui/form";
import { Button } from "../ui";
import { Loader2 } from "lucide-react";
import { getUserErrorMessage } from "@/utils/error";
import { cn } from "@/lib/utils";

export interface FormLayoutProps<T extends FieldValues>
  extends UseFormProps<T> {
  children?: ((methods: UseFormReturn<T>) => ReactNode) | ReactNode;
  showsSubmitButton?: boolean;
  showsCancelButton?: boolean;
  submitText?: string;
  cancelText?: string;
  onSubmit?: (data: T) => any | Promise<any>;
  onCancel?: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  isOpen?: boolean;
  description?: string;
  resolver?: Resolver<T, any, T>;
  descriptionStyle?: React.CSSProperties;
  defaultValues?: DefaultValues<T>;
  enableBeforeUnloadProtection?: boolean;
  submitButtonClassName?: string;
  className?: string;
}

export function FormLayout<T extends FieldValues>({
  children,
  showsSubmitButton = true,
  showsCancelButton = true,
  submitText = "Done",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  resolver,
  className,
  onSuccess,
  submitButtonClassName,
  isLoading = false,
  mode = "onSubmit",
  isOpen = true,
  description,
  descriptionStyle,
  enableBeforeUnloadProtection = false,
  ...formProps
}: FormLayoutProps<T>) {
  const form = useForm<T>({
    ...formProps,
    resolver,
    mode,
  });

  useEffect(() => {
    if (!enableBeforeUnloadProtection || !isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableBeforeUnloadProtection, isOpen, form.formState.isDirty]);

  // #region agent log
  useEffect(() => {
    console.log("FormLayout: isLoading changed to", isLoading);
    fetch('http://127.0.0.1:7242/ingest/64a3f3e8-235c-40b2-ad71-c3a7282cd6ca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'form-layout.tsx:render',message:'FormLayout render',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, [isLoading]);
  console.log("FormLayout: render with isLoading", isLoading);
  // #endregion

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit?.(data);

      onSuccess?.();
    } catch (error) {
      console.error(error);
      form.setError("root", { message: getUserErrorMessage(error) });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-5", className)}
      >
        {description && (
          <FormDescription style={descriptionStyle}>
            {description}
          </FormDescription>
        )}

        <div className="space-y-6">
          {/* General Error */}
          {form.formState.errors.root && (
            <div className="p-3 text-sm flex gap-5 justify-between items-center bg-red-500/20 rounded-md">
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
              <Button
                className="bg-destructive-500 text-white"
                type="submit"
                variant={"destructive"}
                size={"sm"}
              >
                Retry
              </Button>
            </div>
          )}
          {typeof children === "function" ? children(form) : children}
        </div>

        <div className="justify-end flex gap-2 items-center">
          {showsCancelButton && (
            <Button
              size={"lg"}
              variant={"link"}
              type="button"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}

          {showsSubmitButton && (
            <Button type="submit" className={submitButtonClassName} size={"lg"}>
              {isLoading ? <Loader2 className="animate-spin" /> : submitText}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
