"use client";

import { useState } from "react";
import { Plus, Search, ChevronRight, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountForm, type AccountFormData } from "@/components/accounts/account-form";
import { useAccounts } from "@/hooks/use-accounts";
import { useFormatters } from "@/hooks/use-formatters";
import { AccountType } from "@/types/enums";
import { ACCOUNT_TYPE_OPTIONS } from "@/lib/constants/options";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";

const ACCOUNT_TYPES = ACCOUNT_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
  color: opt.color || "text-gray-700",
}));

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<AccountType | "all">("all");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(["asset", "liability", "equity", "revenue", "expense"])
  );
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const accountHooks = useAccounts();
  const { formatCurrency } = useFormatters();

  // Fetch hierarchy
  const { data: hierarchy, isLoading } = accountHooks.getHierarchy();

  // Fetch types summary
  const { data: typesSummary } = accountHooks.getTypesSummary();

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await accountHooks.delete.mutateAsync({ id });
    }
  };

  const handleSubmit = async (data: AccountFormData) => {
    if (editingAccount) {
      await accountHooks.update.mutateAsync({
        id: editingAccount.id,
        ...data,
      });
      setIsFormOpen(false);
      setEditingAccount(null);
    } else {
      await accountHooks.create.mutateAsync(data);
      setIsFormOpen(false);
    }
  };

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const toggleAccount = (id: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAccounts(newExpanded);
  };

  const renderAccount = (account: any, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const matchesSearch =
      !search ||
      account.code.toLowerCase().includes(search.toLowerCase()) ||
      account.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return null;

    return (
      <div key={account.id}>
        <div
          className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleAccount(account.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-gray-500">
                {account.code}
              </span>
              <span className="text-sm text-gray-900">{account.name}</span>
              {account.isSystem && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  System
                </span>
              )}
              {!account.isActive && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  Inactive
                </span>
              )}
              {account.isBankAccount && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Bank
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="financial-value text-sm text-gray-900">
                {formatCurrency(Number(account.currentBalance))}
              </span>

              {!account.isSystem && (
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAccount(account)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id, account.name)}
                    className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {account.children.map((child: any) => renderAccount(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderTypeSection = (type: AccountType) => {
    const typeConfig = ACCOUNT_TYPES.find((t) => t.value === type);
    if (!typeConfig) return null;

    const accounts = hierarchy?.[type] || [];
    const isExpanded = expandedTypes.has(type);
    const summary = typesSummary?.find((s) => s.type === type);

    // Filter by selected type
    if (selectedType !== "all" && selectedType !== type) {
      return null;
    }

    return (
      <div key={type} className="rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => toggleType(type)}
          className="flex w-full items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <h3 className={`font-display text-lg font-semibold ${typeConfig.color}`}>
              {typeConfig.label}
            </h3>
            <span className="text-sm text-gray-500">({summary?.count || 0} accounts)</span>
          </div>
          <div className="financial-value text-financial-md text-gray-900">
            {formatCurrency(Number(summary?.totalBalance || 0))}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 p-2">
            {accounts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No accounts in this category
              </div>
            ) : (
              accounts.map((account) => renderAccount(account))
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-transition space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      {/* Header */}
      <div className="fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-md text-gray-900">Chart of Accounts</h1>
          <p className="mt-2 text-gray-600">
            Manage your company's account structure
          </p>
        </div>
        <Button onClick={handleCreateAccount}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as AccountType | "all")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Account hierarchy */}
      <div className="space-y-4">
        {ACCOUNT_TYPES.map((type) => renderTypeSection(type.value))}
      </div>

      {/* Account Form Dialog */}
      <AccountForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAccount(null);
        }}
        onSubmit={handleSubmit}
        account={editingAccount}
        isSubmitting={accountHooks.create.isPending || accountHooks.update.isPending}
      />
    </div>
  );
}
