import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../utils/hooks";
import { setToken, setUser } from "../slices/auth-slice";

type Errors = {
  email?: string;
  password?: string;
  backend?: string;
};

function LoginPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    console.log({ data });
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
        console.log({ data });
        navigate("/");
      } else {
        const data = await res.json();
        if (data.path) setErrors({ [data.path]: data.message });
        else setErrors({ backend: data.message });
      }
    } catch (err) {
      if ((err as Error).hasOwnProperty("message"))
        setErrors((err as any).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" h-screen flex items-center justify-center">
      <form
        action=""
        onSubmit={handleSubmit}
        className="bg-base-200 p-8 rounded-box flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-center">Login</h1>
        <label className="form-control w-full max-w-xs">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Email: </span>
            <span className="label-text-alt text-error text-xs self-end">
              {errors.email}
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            name="email"
            className="input input-bordered w-full max-w-xs"
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label py-0 gap-4">
            <span className="label-text text-base">Password: </span>
            <span className="label-text-alt text-error text-xs self-end">
              {errors.password}
            </span>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
          />
        </label>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary">
            Register
          </Link>
        </div>
        {errors.backend && (
          <div className="text-error text-xs text-center">{errors.backend}</div>
        )}
        <button disabled={loading} className="btn btn-outline btn-primary">
          Login
          {loading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
