import styles from "./TopActions.module.css";
import { SaveButton } from "@/components/SaveButton";
import { LoadButton } from "@/components/LoadButton";
import { PrintButton } from "@/components/PrintButton";
import { ClearButton } from "@/components/ClearButton";

interface TopActionsProps {
  onSave: () => void;
  onLoad: (file: File) => void;
  onClear: () => void;
}

/**
 * Container for top-level action buttons (Save, Load, Clear, Print).
 */
export function TopActions({ onSave, onLoad, onClear }: TopActionsProps) {
  return (
    <div className={styles.container}>
      <SaveButton onSave={onSave} />
      
      <div className={styles.divider} />
      
      <LoadButton onLoad={onLoad} />

      <div className={styles.divider} />
      
      <ClearButton onClear={onClear} />

      <div className={styles.divider} />
      
      <PrintButton />
    </div>
  );
}
