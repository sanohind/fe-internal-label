import PageMeta from "../../components/common/PageMeta";
import { LabelTable } from "../../components/label-list";

export default function LabelList() {
  return (
    <>
      <PageMeta
        title="Label List"
        description="Label List"
      />
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Label List
        </h2>
        <LabelTable />
      </div>
    </>
  );
}
