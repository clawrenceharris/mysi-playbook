/* eslint-disable react-hooks/exhaustive-deps */
import { FormLayout, FormLayoutProps } from "@/components/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { BreakoutRoom, useSessionCall } from "@/providers";
import { generateRooms } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface BreakoutCreatorProps extends FormLayoutProps<{ maxSize: number }> {
  onClose: () => void;
  participants: { sessionId: string; userId: string; name: string }[];
}
export function BreakoutCreator({
  participants,
  onClose,
  ...props
}: BreakoutCreatorProps) {
  const { isCreatingRooms, createBreakoutRooms } = useSessionCall();
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const {
    control,
    formState: { defaultValues },
  } = useForm<{ maxSize: number }>();
  const handleMaxSizeChange = useCallback(
    (maxSize: number) => {
      const generated = generateRooms(participants, maxSize);
      setRooms(generated);
    },
    [participants]
  );

  useEffect(() => {
    if (!defaultValues?.maxSize) return;
    handleMaxSizeChange(defaultValues.maxSize);
  }, []);
  function handleSubmit() {
    createBreakoutRooms(rooms);
    onClose();
  }
  return (
    <FormLayout<{ maxSize: number }>
      enableBeforeUnloadProtection={false}
      defaultValues={{ maxSize: 2 }}
      isLoading={isCreatingRooms}
      onSuccess={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="p-4 border overflow-hidden rounded-xl bg-muted/30 space-y-4">
        <FormField
          rules={{
            required: true,
          }}
          control={control}
          name="maxSize"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="sr-only">Number of Rooms</FormLabel>
              <FormControl>
                <Input
                  onChange={(e) => {
                    onChange(e);
                    const size = parseInt(e.currentTarget.value);
                    handleMaxSizeChange(size);
                  }}
                  type="number"
                  placeholder="Number of Breakout Rooms"
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="overflow-y-auto max-h-50 h-full">
          {rooms.length > 0 && (
            <div className="space-y-2 mt-4">
              {rooms.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-md border bg-white/40 p-3 flex flex-wrap gap-2"
                >
                  <strong className="w-full mb-1">
                    Room {i + 1} ({r.members.length})
                  </strong>

                  {r.members.map((m) => (
                    <span
                      key={m.sessionId}
                      className="text-xs bg-primary/10 px-2 py-1 rounded-md"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormLayout>
  );
}
