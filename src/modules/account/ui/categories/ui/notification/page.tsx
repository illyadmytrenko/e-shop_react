import { UserInfo } from "@/common/types/user-info";
import Notification from "./notification";

interface PageProps {
  userInfo: UserInfo | null;
}

export default function Page({ userInfo }: PageProps) {
  return <Notification userInfo={userInfo} />;
}
