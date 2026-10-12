import DemoPreparation from "@/components/demo/demo-preparation";
import DemoEntryController from "@/components/demo/demo-entry-controller";

export default function DemoEntryPage() {
  return (
    <DemoEntryController>
      <DemoPreparation />
    </DemoEntryController>
  );
}
