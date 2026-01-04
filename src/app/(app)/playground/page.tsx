import { PlaygroundProvider } from "@/providers";
import PlaygroundPage from "./PlaygroundPage";

export default function Page() {
  return (
    <PlaygroundProvider>
      <PlaygroundPage />
    </PlaygroundProvider>
  );
}
