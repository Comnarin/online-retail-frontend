"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api";
import { 
  CreditCard, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Calendar,
  Hash
} from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-transactions", page, search],
    queryFn: async () => {
      const resp = await transactionsApi.list({ page, limit: 10, search });
      return resp;
    },
  });

  const transactions = data?.data || [];
  const totalPages = data?.total_pages || 0;

  // Native date formatting to avoid date-fns dependency
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-main-text tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard size={20} />
            </div>
            Transaction Logs
          </h1>
          <p className="text-sm text-text-faint mt-1">Audit trail for all financial movements.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-primary transition-colors" size={16} />
          <input 
            placeholder="Search Order Number..."
            className="w-full h-11 bg-surface border border-surface-border rounded-xl pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-alt border-b border-surface-border">
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-faint uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-black/5 rounded-lg" /></td>
                  </tr>
                ))
              ) : transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-surface-alt/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-text-faint group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Hash size={14} />
                      </div>
                      <span className="text-[13px] font-mono font-medium text-main-text">
                        {tx.id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/orders?id=${tx.order_id}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
                    >
                      #{tx.order?.order_number?.slice(-8) || "N/A"}
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500">
                         {tx.customer?.name?.[0] || "?"}
                       </div>
                       <span className="text-[13px] font-medium text-main-text">{tx.customer?.name || "Deleted User"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-main-text">฿{tx.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100`}>
                      {tx.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-text-faint">
                      <Calendar size={12} />
                      {formatDate(tx.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && transactions.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center text-black/10 mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-lg font-bold text-main-text">No Transactions</h3>
            <p className="text-sm text-text-faint">No financial records were found for this period.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-surface-alt border-t border-surface-border flex items-center justify-between">
            <span className="text-[12px] font-medium text-text-faint">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-main-text hover:bg-surface disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-lg border border-surface-border flex items-center justify-center text-main-text hover:bg-surface disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
