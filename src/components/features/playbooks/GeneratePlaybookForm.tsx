"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout, FormLayoutProps } from "@/components/form/form-layout";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Toggle } from "@/components/ui";
import {
  GeneratePlaybookInput,
  generatePlaybookSchema,
} from "@/features/playbooks/domain";
import { supabase } from "@/lib/supabase/client";
import { LoadingState } from "@/components/states";
import { SessionContexts } from "@/types/tables";

export const GeneratePlaybookForm = ({
  ...props
}: FormLayoutProps<GeneratePlaybookInput>) => {
  const [contexts, setContexts] = useState<SessionContexts[]>([]);
  const [contextsLoading, setContextsLoading] = useState(true);
  useEffect(() => {
    const fetchContexts = async () => {
      const { data } = await supabase.from("session_contexts").select();
      setContextsLoading(false);
      setContexts(data || []);
    };
    fetchContexts();
  }, []);
  return (
    <FormLayout<GeneratePlaybookInput>
      className="bg-primary-foreground shadow-md p-6 rounded-xl"
      resolver={zodResolver(generatePlaybookSchema)}
      defaultValues={{
        course_name: "",
        topic: "",
        virtual: false,
        contexts: [],
      }}
      enableBeforeUnloadProtection={false}
      submitText="Create Playbook"
      submitButtonClassName="bg-gradient-to-r from-primary-400 to-secondary-500 hover:from-primary-400/90 hover:to-secondary-500/90 text-white border-0 shadow-md hover:shadow-xl transition-all duration-200"
      showsCancelButton={false}
      {...props}
    >
      {({ control }) => (
        <>
          <FormField
            name="course_name"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="What course is this Playbook for?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="topic"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="What topic will you be covering?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {contexts.length > 0 && (
            <FormField
              control={control}
              name="contexts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context Tags</FormLabel>
                  <div className="faded-col p-4 flex gap-4 max-h-40 overflow-auto flex-wrap">
                    {contextsLoading ? (
                      <LoadingState variant="container" />
                    ) : (
                      contexts.map((ctx) => (
                        <Toggle
                          variant={"outline"}
                          key={ctx.id}
                          size={"lg"}
                          pressed={field.value?.includes(ctx.context)}
                          onPressedChange={(pressed) => {
                            if (pressed) {
                              field.onChange([...field.value, ctx.context]);
                            } else {
                              field.onChange(
                                field.value.filter(
                                  (c: string) => c !== ctx.context
                                )
                              );
                            }
                          }}
                        >
                          {ctx.context}
                        </Toggle>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </FormLayout>
  );
};
