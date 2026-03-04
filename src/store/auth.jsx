import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "./tokenStore.js";
import { authService } from "../services/auth.service.js";
import { usersService } from "../services/users.service.js";
import { DEV_BYPASS_AUTH, DEV_ME } from "../dev/devConfig.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function bootstrap() {
    setLoading(true);
    try {
      // Dev: preview UI without backend/auth
      if (DEV_BYPASS_AUTH) {
        setMe(DEV_ME);
        return;
      }
      if (!tokenStore.getAccessToken()) {
        setMe(null);
        return;
      }
      const data = await usersService.me();
      setMe(data);
    } catch (e) {
      // token invalid -> clear
      tokenStore.clear();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      me,
      loading,
      async login(payload) {
        if (DEV_BYPASS_AUTH) {
          // Cho phép chọn role khi login ở mode bypass
          const role = payload.role || DEV_ME.role;
          const fullName = role === "SUPER_ADMIN" ? "Admin Hệ Thống" : (role === "TREE_ADMIN" ? "Quản Trị Viên Nhánh" : "Thành Viên Thường");
          setMe({ ...DEV_ME, role, fullName });
          return { accessToken: "dev-token" };
        }
        // Change key from email to username if it's there
        const body = { ...payload };
        if (body.email) {
          body.username = body.email;
          delete body.email;
        }

        const data = await authService.login(body);
        // kỳ vọng data chứa accessToken
        if (data?.accessToken) tokenStore.setAccessToken(data.accessToken);
        await bootstrap();
        return data;
      },
      async register(payload) {
        if (DEV_BYPASS_AUTH) {
          setMe(DEV_ME);
          return { accessToken: "dev-token" };
        }
        const data = await authService.register(payload);
        if (data?.accessToken) tokenStore.setAccessToken(data.accessToken);
        await bootstrap();
        return data;
      },
      async logout() {
        if (DEV_BYPASS_AUTH) {
          setMe(DEV_ME); // keep preview mode logged in
          return;
        }
        try {
          await authService.logout();
        } finally {
          tokenStore.clear();
          setMe(null);
        }
      },
      refreshMe: bootstrap,
    }),
    [me, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
