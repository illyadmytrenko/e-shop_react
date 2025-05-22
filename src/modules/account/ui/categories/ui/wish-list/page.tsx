import WishList from "./wish-list";

interface PageProps {
  userId: number;
}

export default function Page({ userId }: PageProps) {
  return <WishList userId={userId} />;
}
