import Orders from "./orders";

interface PageProps {
  userId: number;
}

export default function Page({ userId }: PageProps) {
  return <Orders userId={userId} />;
}
