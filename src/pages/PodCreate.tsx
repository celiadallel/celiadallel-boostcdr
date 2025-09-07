import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PodCreate() {
  const nav = useNavigate();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Pod created (mock)");
    nav("/pods");
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Pod</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required placeholder="e.g., Product Leaders" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cap">Member cap</Label>
          <Input id="cap" type="number" min={3} max={50} defaultValue={20} />
        </div>
        <Button type="submit" className="w-full">Create</Button>
      </form>
    </div>
  );
}
