import { Input, Label, FormItem } from "@/components/ui";
import type {
  DisplayPromptConfig,
  DisplayPromptConfig as DisplayPromptConfigType,
} from "../../../features/playground/domain";

export interface DisplayPromptConfigProps {
  config: DisplayPromptConfigType;
  onChange: (config: Partial<DisplayPromptConfigType>) => void;
}

export function DisplayPromptConfig({
  config,
  onChange,
}: DisplayPromptConfigProps) {
  return (
    <div className="space-y-4">
      <FormItem>
        <Label className="sr-only" htmlFor="title">
          Title
        </Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title"
        />
      </FormItem>
      <FormItem>
        <Label className="sr-only" htmlFor="content">
          Content
        </Label>
        <Input
          id="content"
          value={config.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Enter the content of the prompt"
        />
      </FormItem>
    </div>
  );
}
