import { CheckCircle2, Clock, Truck, AlertCircle, Package, XCircle, Hourglass } from "lucide-react";

const statusConfig: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  delivered:              { icon: <CheckCircle2 size={11} />, cls: "bg-green-bg text-green-tx",  label: "Delivered"  },
  completed:             { icon: <CheckCircle2 size={11} />, cls: "bg-green-bg text-green-tx",  label: "Completed"  },
  pending:               { icon: <Clock       size={11} />, cls: "bg-amber-bg text-amber-tx",  label: "Pending"    },
  pending_verification:  { icon: <Hourglass   size={11} />, cls: "bg-orange-100 text-orange-700", label: "Verifying" },
  processing:            { icon: <Clock       size={11} />, cls: "bg-amber-bg text-amber-tx",  label: "Processing" },
  confirmed:             { icon: <Package     size={11} />, cls: "bg-blue-bg text-blue-tx",   label: "Confirmed"  },
  shipped:               { icon: <Truck       size={11} />, cls: "bg-blue-bg text-blue-tx",   label: "Shipped"    },
  shipping:              { icon: <Truck       size={11} />, cls: "bg-blue-bg text-blue-tx",   label: "Shipping"   },
  cancelled:             { icon: <XCircle     size={11} />, cls: "bg-red-bg text-red-tx",    label: "Cancelled"  },
  refunded:              { icon: <AlertCircle size={11} />, cls: "bg-gray-bg text-gray-tx",   label: "Refunded"   },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const cfg = statusConfig[s] ?? { icon: null, cls: "bg-gray-bg text-gray-tx", label: status };

  return (
    <span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
