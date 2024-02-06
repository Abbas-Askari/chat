import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const parsed = formSchema.parse({
  email: "asd@123.com",
  name: "John Doe",
  password: "password",
  confirmPassword: "password",
  img: "asdasd",
});

console.log({ parsed });

type errors = {
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  backend?: string;
};

function Signup() {
  const [errors, setErrors] = useState<errors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    setLoading(true);
    try {
      const validatedData = formSchema.parse(data);
      setErrors({});
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });
      if (res.ok) {
        const data = await res.json();
        navigate("/login");
        console.log(data);
      } else {
        const data = await res.json();
        setErrors((prev) => ({
          ...prev,
          backend: data.message,
        }));
      }
    } catch (err) {
      setErrors({});

      if (err instanceof z.ZodError) {
        for (let issue of err.issues) {
          console.log(issue);
          setErrors((prev) => ({
            ...prev,
            [issue.path[0]]: issue.message,
          }));
        }
        console.log(err.flatten());
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className=" h-screen flex items-center justify-center">
      <form
        action=""
        className="bg-base-200 p-8 rounded-box flex flex-col gap-4  "
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold text-center">Login</h1>
        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Email: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {errors.email}
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            name="email"
            className={
              "input input-bordered w-full " +
              (errors.email ? " input-error" : "")
            }
          />
        </label>
        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Name: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {errors.name}
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            name="name"
            className={
              "input input-bordered w-full " +
              (errors.name ? " input-error" : "")
            }
          />
        </label>

        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Password: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {errors.password}
            </span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            name="password"
            className={
              "input input-bordered w-full " +
              (errors.password ? " input-error" : "")
            }
          />
        </label>

        <label className="form-control w-full ">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Confirm Password: </span>
            <span className="label-text-alt text-xs text-error self-end">
              {errors.confirmPassword}
            </span>
          </div>
          <input
            type="password"
            placeholder="Type here"
            name="confirmPassword"
            className={
              "input input-bordered w-full " +
              (errors.confirmPassword ? " input-error" : "")
            }
          />
        </label>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/signup" className="text-primary">
            Login
          </Link>
        </div>
        <span className="text-error text-xs text-center">{errors.backend}</span>
        <button disabled={loading} className="btn btn-outline btn-primary">
          Login{" "}
          {loading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </form>
    </div>
  );
}

export default Signup;
