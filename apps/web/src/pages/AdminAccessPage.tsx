import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  AdminUserAccount,
  getAdminUserAccounts,
  resetAdminUserPassword,
  updateAdminUserUsername,
} from "../lib/api";

const roleStyles: Record<
  AdminUserAccount["role"],
  string
> = {
  ADMIN:
    "bg-violet-50 text-violet-700",
  STAFF:
    "bg-blue-50 text-blue-700",
  DRIVER:
    "bg-amber-50 text-amber-700",
  CUSTOMER:
    "bg-emerald-50 text-emerald-700",
};

export function AdminAccessPage() {
  const [accounts, setAccounts] =
    useState<AdminUserAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState<AdminUserAccount | null>(
      null,
    );

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [usernameAccount, setUsernameAccount] =
    useState<AdminUserAccount | null>(null);

  const [newUsername, setNewUsername] =
    useState("");

  const [usernameSaving, setUsernameSaving] =
    useState(false);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminUserAccounts();

      setAccounts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load accounts.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  const filteredAccounts =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return accounts;
      }

      return accounts.filter(
        (account) =>
          account.name
            .toLowerCase()
            .includes(value) ||
          account.email
            .toLowerCase()
            .includes(value) ||
          (account.username ?? "")
            .toLowerCase()
            .includes(value) ||
          account.role
            .toLowerCase()
            .includes(value),
      );
    }, [accounts, search]);

  function openUsernameEditor(
    account: AdminUserAccount,
  ) {
    setUsernameAccount(account);
    setNewUsername(account.username ?? "");
    setError("");
    setSuccess("");
  }

  function closeUsernameEditor() {
    if (usernameSaving) {
      return;
    }

    setUsernameAccount(null);
    setNewUsername("");
  }

  async function handleUsernameUpdate(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!usernameAccount) {
      return;
    }

    const normalized =
      newUsername.trim().toLowerCase();

    if (
      !/^[a-zA-Z0-9._-]{3,30}$/.test(
        normalized,
      )
    ) {
      setError(
        "Username must be 3–30 characters using letters, numbers, dots, underscores or hyphens.",
      );
      return;
    }

    try {
      setUsernameSaving(true);
      setError("");
      setSuccess("");

      const updated =
        await updateAdminUserUsername(
          usernameAccount.id,
          normalized,
        );

      setAccounts((current) =>
        current.map((account) =>
          account.id === updated.id
            ? updated
            : account,
        ),
      );

      setSuccess(
        `Username changed to @${updated.username}.`,
      );

      setUsernameAccount(null);
      setNewUsername("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change username.",
      );
    } finally {
      setUsernameSaving(false);
    }
  }

  function openReset(
    account: AdminUserAccount,
  ) {
    setSelected(account);
    setPassword("");
    setConfirmPassword("");
    setSuccess("");
    setError("");
  }

  function closeReset() {
    if (saving) {
      return;
    }

    setSelected(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleReset(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "The passwords do not match.",
      );
      return;
    }

    try {
      setSaving(true);

      await resetAdminUserPassword(
        selected.id,
        password,
      );

      setSuccess(
        `Password reset for ${selected.name}.`,
      );

      setSelected(null);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin only
              </span>

              <span className="text-xs text-slate-400">
                Account security
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              User access
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View login accounts and securely
              reset passwords.
            </p>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#073b2e] text-white">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">
                Login accounts
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {accounts.length} registered
                account
                {accounts.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="relative sm:w-[330px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                className="kr-input pl-9"
                placeholder="Search user, username or email..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-slate-500">
                Loading accounts...
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAccounts.map(
              (account) => (
                <article
                  key={account.id}
                  className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {account.name}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${roleStyles[account.role]}`}
                        >
                          {account.role}
                        </span>

                        {account.status ===
                          "DISABLED" && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700">
                            DISABLED
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {account.email}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Username:{" "}
                        <span className="font-semibold text-slate-600">
                          {account.username ??
                            "Not set"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        openUsernameEditor(account)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      Change username
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openReset(account)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:text-primary"
                    >
                      <KeyRound className="h-4 w-4" />
                      Reset password
                    </button>
                  </div>
                </article>
              ),
            )}

            {filteredAccounts.length ===
              0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No matching accounts.
              </div>
            )}
          </div>
        )}
      </section>

      {usernameAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  Account identity
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Change username
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {usernameAccount.name} ·{" "}
                  {usernameAccount.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeUsernameEditor}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleUsernameUpdate}
              className="space-y-4 p-5"
            >
              <label className="kr-label">
                Login username

                <input
                  className="kr-input"
                  value={newUsername}
                  onChange={(event) =>
                    setNewUsername(
                      event.target.value
                        .toLowerCase()
                        .replace(/\s/g, ""),
                    )
                  }
                  placeholder="username"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </label>

              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
                The user will use the new username
                the next time they sign in. Their
                email login will continue to work.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUsernameEditor}
                  disabled={usernameSaving}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={usernameSaving}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#073b2e] text-sm font-bold text-white disabled:opacity-60"
                >
                  {usernameSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}

                  Save username
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700">
                  Admin security
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Reset password
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selected.name} ·{" "}
                  {selected.username ??
                    selected.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReset}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleReset}
              className="space-y-4 p-5"
            >
              <label className="kr-label">
                New password

                <div className="relative">
                  <input
                    className="kr-input pr-11"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="kr-label">
                Confirm password

                <input
                  className="kr-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  maxLength={72}
                  required
                />
              </label>

              <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                The existing password cannot be
                viewed. Resetting it replaces the
                old password and invalidates the
                user's refresh sessions.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReset}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#073b2e] text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}

                  Reset password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
