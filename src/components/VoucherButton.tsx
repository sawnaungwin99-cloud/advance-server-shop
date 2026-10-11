import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadVoucher, type VoucherData } from "@/lib/voucher";

export function VoucherButton({ data }: { data: VoucherData }) {
  return (
    <Button
      size="sm"
      className="glow-cyan"
      onClick={() =>
        downloadVoucher(data).catch(() => toast.error("Voucher ဒေါင်းလုဒ် မရပါ"))
      }
    >
      <Download className="size-4" /> Download Voucher
    </Button>
  );
}
