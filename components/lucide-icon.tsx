import { icons, HelpCircle, type LucideProps } from "lucide-react";

type Props = Omit<LucideProps, "name"> & { name?: string | null };

/**
 * แสดง Lucide icon จากชื่อ (string) ที่เก็บใน DB เช่น "Building2", "Car"
 * ถ้าไม่พบชื่อ จะ fallback เป็น HelpCircle
 */
export function LucideIcon({ name, ...props }: Props) {
  const Icon =
    (name && (icons as Record<string, React.ComponentType<LucideProps>>)[name]) || HelpCircle;
  return <Icon {...props} />;
}
