import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col p-2 gap-2">
      <Button>Button</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button>Create a Game</Button>
      <Button>Button</Button>
    </div>
  );
}
