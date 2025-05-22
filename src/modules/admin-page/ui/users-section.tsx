import { UserInfo } from "@/common/types/user-info";
import { AdminInput } from "../ui/ui/admin-input";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { Order } from "@/common/types/order";
import { Product } from "@/common/types/product";

interface UsersSectionProps {
  usersSectionRef: React.RefObject<HTMLDivElement>;
  users: UserInfo[] | undefined;
  editedUsers: { [key: number]: UserInfo };
  handleChange?: (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  handleNewChange?: (
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  handleSave: (id: number) => void;
  deleteUser: (id: number) => void;
}

const userFields: {
  name: keyof UserInfo;
  label: string;
  type: "text";
  isEditable?: boolean;
}[] = [
  { name: "userName", label: "Name", type: "text", isEditable: false },
  { name: "userEmail", label: "Email", type: "text", isEditable: false },
  { name: "userBonusPoints", label: "Bonus Points", type: "text" },
  { name: "userDiscount", label: "Discount", type: "text" },
];

export function UsersSection({
  usersSectionRef,
  users,
  editedUsers,
  handleChange,
  handleNewChange,
  handleSave,
  deleteUser,
}: UsersSectionProps) {
  const renderInputs = (user: UserInfo, id?: number, isNew: boolean = false) =>
    userFields.map((field) => (
      <div key={field.name}>
        <label
          className="text-xl mb-1"
          htmlFor={`${user[field.name]}${id ?? 0}`}
        >
          {field.label}
        </label>
        <AdminInput
          name={field.name}
          type={field.type}
          value={user[field.name] ?? ""}
          inputId={`${user[field.name]}${id ?? 0}`}
          {...(isNew
            ? { handleNewChange }
            : { handleChange, id: id as number })}
        />
      </div>
    ));

  return (
    <div
      className="max-h-[80vh] overflow-y-auto flex flex-col gap-6 px-3"
      ref={usersSectionRef}
    >
      <ul className="flex flex-col gap-6">
        {users?.map((user) => {
          const editedUser = editedUsers[user.userId] || user;
          return (
            <li
              key={user.userId}
              className="border-2 border-solid border-black rounded-md p-3"
            >
              <div className="flex gap-5 mb-5 pb-1 items-center overflow-x-auto">
                {renderInputs(editedUser, user.userId)}
              </div>
              <div className="flex gap-12">
                <CustomButton
                  size="md"
                  variant="blue"
                  onClick={() => handleSave(user.userId)}
                  activeAnimation="yDropdown"
                >
                  Save
                </CustomButton>
                <CustomButton
                  size="md"
                  variant="orange"
                  onClick={() => deleteUser(user.userId)}
                  activeAnimation="yDropdown"
                >
                  Delete
                </CustomButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
