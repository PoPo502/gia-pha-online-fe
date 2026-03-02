import { useAuth } from "../store/auth.jsx";
import HomeSuperAdmin from "./HomeSuperAdmin.jsx";
import HomeTreeAdmin from "./HomeTreeAdmin.jsx";
import HomeUser from "./HomeUser.jsx";

export default function Home() {
  const { me } = useAuth();
  const role = me?.role || "USER";

  switch (role) {
    case "SUPER_ADMIN":
      return <HomeSuperAdmin />;
    case "TREE_ADMIN":
      return <HomeTreeAdmin />;
    default:
      return <HomeUser />;
  }
}