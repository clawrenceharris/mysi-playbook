import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { CreateSessionInput } from "@/features/sessions/domain";

import { useFormContext } from "react-hook-form";

export const CreateSessionForm = () => {
  const { control } = useFormContext<CreateSessionInput>();

  return (
    <>
      <FormField
        name="course_name"
        defaultValue=""
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course</FormLabel>
            <FormControl>
              <Input placeholder="Course name, code or subject" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="topic"
        defaultValue=""
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Topic, unit, module, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* <FormField
        name="description"
        defaultValue=""
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Description" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      /> */}
      <div className="flex gap-4">
        <FormField
          name="start_date"
          defaultValue={new Date().toISOString().split("T")[0]}
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="start_time"
          defaultValue={new Date().toISOString().split("T")[1].slice(0, 5)}
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time</FormLabel>
              <FormControl>
                <Input {...field} type="time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* <Label htmlFor="virtual">Virtual:</Label>
      <Controller
        name="virtual"
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            id="virtual"
          />
        )}
      /> */}
    </>
  );
};
