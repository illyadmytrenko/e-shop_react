import { UserInfo } from "@/common/types/user-info";
import PersonalData from "./personal-data";

interface PageProps {
  userInfo: UserInfo | null;
  handleInputClick: (
    h5: string,
    inputName: string[],
    inputType: string[],
    inputValue: string[],
    placeholder: string[]
  ) => void;
}

export default function Page({ userInfo, handleInputClick }: PageProps) {
  return (
    <PersonalData userInfo={userInfo} handleInputClick={handleInputClick} />
  );
}
