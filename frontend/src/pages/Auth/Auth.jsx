import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import "./Auth.css";
import { StoreContext } from "../../components/context/StoreContext";

const Auth = ({ defaultMode = "signup" }) => {
  const isDefaultLogin = defaultMode === "login";
  const [mode, setMode] = useState(isDefaultLogin ? "login" : "signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { url, setToken, setRole, setUserInfo } = useContext(StoreContext);

  const heading = useMemo(() => {
    return mode === "signup" ? "Create account" : "Sign in";
  }, [mode]);

  const subText = useMemo(() => {
    return mode === "signup"
      ? "Start by creating your account"
      : "Sign in with your account";
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const validateClientInput = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "signup" && formData.name.trim().length < 2) {
      return "Invalid name";
    }

    if (!emailRegex.test(formData.email)) {
      return "Invalid email";
    }

    if (formData.password.length < 8) {
      return "Invalid password";
    }

    return "";
  };

  const persistAuth = (responseData) => {
    setToken(responseData.token);
    setRole(responseData.role || "user");
    setUserInfo({
      name: responseData.name,
      email: responseData.email,
      role: responseData.role || "user",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const clientValidationMessage = validateClientInput();
    if (clientValidationMessage) {
      setErrorMessage(clientValidationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === "signup" ? "/api/user/register" : "/api/user/login";
      const payload =
        mode === "signup"
          ? {
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
            }
          : {
              email: formData.email.trim(),
              password: formData.password,
            };

      const response = await axios.post(`${url}${endpoint}`, payload);

      if (!response.data.success) {
        setErrorMessage(response.data.message || "Authentication failed");
        return;
      }

      if (mode === "signup") {
        setSuccessMessage("Account created successfully. Redirecting...");
        redirectTimeoutRef.current = setTimeout(() => {
          persistAuth(response.data);
          navigate("/");
        }, 1000);
        return;
      }

      persistAuth(response.data);
      navigate("/");
    } catch (error) {
      if (!error.response) {
        setErrorMessage("Server unavailable. Please start backend on port 4000.");
      } else {
        setErrorMessage(error.response?.data?.message || "Authentication failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (targetMode) => {
    setMode(targetMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{heading}</h1>
        <p className="auth-subtext">{subText}</p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          ) : null}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
          {successMessage ? <p className="auth-success">{successMessage}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

Auth.propTypes = {
  defaultMode: PropTypes.string,
};

export default Auth;
