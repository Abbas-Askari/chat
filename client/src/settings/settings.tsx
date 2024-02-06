import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { z } from "zod";
import { logout, updateUserAsync } from "../slices/auth-slice";
import { Navigate, useNavigate } from "react-router-dom";

const formSchema = z
  .object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long",
    }),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
    avatar: z.any().optional(),
  })
  .refine((data) => !!data.newPassword === !!data.currentPassword, {
    message: "Current password is required to change password",
    path: ["currentPassword"],
  })
  .refine((data) => !data.newPassword || data.newPassword.length >= 6, {
    message: "Password must be at least 6 characters long",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Settings() {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [imageFile, setImageFile] = useState<File | null | string>(
    user?.avatar ?? ""
  );
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      const validatedData = formSchema.parse(data);
      if (!validatedData.currentPassword) {
        delete validatedData.currentPassword;
        delete validatedData.newPassword;
        delete validatedData.confirmPassword;
      }
      if (typeof imageFile === "string") {
        delete validatedData.avatar;
      }
      dispatch(updateUserAsync(validatedData));

      console.log({ validatedData });
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        action=""
        className=" p-8 flex flex-col gap-4  overflow-auto"
      >
        <h1 className="text-xl font-bold text-center">Change Account</h1>
        <label htmlFor="avatar" className=" flex flex-col items-center">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-32">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" />
              ) : imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="avatar"
                  className="rounded-full"
                />
              ) : (
                <span className="text-xl">
                  {user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </span>
              )}
            </div>
          </div>
          <span className="label-text text-base">Click to change</span>
          <input
            accept="image/*"
            id="avatar"
            type="file"
            name="avatar"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] || null);
            }}
            className={
              "input input-bordered w-full hidden"
              //   (errors.email ? " input-error" : "")
            }
          />
        </label>

        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Name: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {/* {errors.name} */}
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            name="name"
            defaultValue={user?.name}
            className={
              "input input-bordered w-full "
              //   (errors.name ? " input-error" : "")
            }
          />
        </label>

        <label htmlFor="" className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Current Password: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {/* {errors.email} */}
            </span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            name="currentPassword"
            className={
              "input input-bordered w-full "
              //   (errors.email ? " input-error" : "")
            }
          />
        </label>

        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">New Password: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {/* {errors.password} */}
            </span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            name="newPassword"
            className={
              "input input-bordered w-full "
              //   (errors.password ? " input-error" : "")
            }
          />
        </label>

        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Confirm Password: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {/* {errors.confirmPassword} */}
            </span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            name="confirmPassword"
            className={
              "input input-bordered w-full "
              //   (errors.confirmPassword ? " input-error" : "")
            }
          />
        </label>
        <span className="text-error text-xs text-center">{}</span>
        <div className="w-full flex justify-center gap-4">
          <button type="reset" className="btn flex-1">
            Reset
          </button>
          <button disabled={loading} className="btn flex-1  btn-primary">
            Update{" "}
            {loading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
          </button>
        </div>
      </form>
      <div className="px-8 flex gap-4">
        <button
          className="btn  flex-1"
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </button>
        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className="btn btn-outline btn-accent flex-1 btn-block"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;
