"use client";
import { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import {
  useAuthState,
  useCreateUserWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth, firestore } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      const newUser = res.user;
      await setDoc(doc(firestore, "users", newUser.uid), {
        email: newUser.email,
        uid: newUser.uid,
      });
      sessionStorage.setItem("user", true);
      setEmail("");
      setPassword("");
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        marginTop="10%"
        display="flex"
        justifyContent="right"
        alignItems="center"
      >
        <Typography mr="10px" variant="body1">
          Already registered?
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => router.push("/sign-in")}
        >
          Sign in
        </Button>
      </Box>
      <Box
        sx={{
          marginTop: "3%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Sign Up</Typography>
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error.message}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
