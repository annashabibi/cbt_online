import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const API_URL = "http://localhost:3000";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username wajib diisi");
      return;
    }

    if (!password) {
      toast.error("Password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/akun-siswa/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (Array.isArray(result.message)) {
          throw new Error(result.message.join(", "));
        }

        throw new Error(
          result.message || "Login gagal",
        );
      }

      // Simpan JWT
      localStorage.setItem(
        "accessToken",
        result.accessToken,
      );

      // Simpan informasi user
      localStorage.setItem(
        "user",
        JSON.stringify(result.user),
      );

      toast.success("Login berhasil");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Login gagal",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {/* HEADER */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-bold text-gray-900">
              U
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Login Siswa
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Masuk untuk mengikuti ulangan
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* USERNAME */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Masukkan username"
                autoComplete="username"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              />

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-gray-900 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Memproses..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}
          <div className="mt-6 text-center text-sm text-gray-500">

            Belum punya akun?{" "}

            <Link
              to="/register"
              className="font-semibold text-yellow-600 hover:text-yellow-700"
            >
              Registrasi
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}