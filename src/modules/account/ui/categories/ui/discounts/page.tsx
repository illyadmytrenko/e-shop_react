import { UserInfo } from "@/common/types/user-info";
import Discounts from "./discounts";

interface PageProps {
  userInfo: UserInfo | null;
  userDiscount: number;
}

export default function Page({ userInfo, userDiscount }: PageProps) {
  console.log(userDiscount);
  return <Discounts userInfo={userInfo} userDiscount={userDiscount} />;
}
