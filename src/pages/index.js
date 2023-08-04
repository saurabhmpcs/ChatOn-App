import useAuthUser from "../hooks/useAuthUser";
import Login from "../components/Login";
import Sidebar from "../components/Sidebar";
import Chat from "@/components/Chat";

export default function Home() {
  const user = useAuthUser();

  if (!user) return <Login />;

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar user={user} />
        <Chat user={user} />
      </div>
    </div>
  );
}
