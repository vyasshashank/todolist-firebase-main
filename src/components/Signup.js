import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import './style.css';  // Import your custom CSS if needed

const auth = getAuth(app);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User signed up");
      navigate("/login");
    } catch (error) {
      console.error("Error signing up: ", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-conic p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 transform transition hover:scale-105 duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-center text-purple-500 mb-6">
          Sign Up
        </h2>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100 text-gray-800"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100 text-gray-800"
          />
        </div>
        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 text-white p-3 rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Sign Up
        </button>
        <div className="text-center mt-4">
          <p className="text-gray-300">
            Already signed up?{" "}
            <a
              href="/login"
              className="text-purple-400 hover:underline hover:text-purple-600"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
