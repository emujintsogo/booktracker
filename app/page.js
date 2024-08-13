"use client";
import { useState, useEffect } from "react";
import { firestore, auth } from "@/app/firebase/config";
import {
  AppBar,
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import IconButton from "@mui/material/IconButton";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    } else if (user) {
      updateInventory();
    }
  }, [user, loading, router]);

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async () => {
    if (!user) return;
    const docs = await getDocs(
      collection(firestore, `users/${user.uid}/inventory`)
    );
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    console.log(inventory);
  };

  const addItem = async (item) => {
    if (!user) return;
    if (item === "") return;
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const inventoryCollectionRef = collection(userDocRef, "inventory");
    const itemDocRef = doc(inventoryCollectionRef, itemName);
    await setDoc(itemDocRef, {
      name: item,
    });
    await updateInventory();
  };

  const removeItem = async (item) => {
    if (!user) return;
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const inventoryCollectionRef = collection(userDocRef, "inventory");
    const itemDocRef = doc(inventoryCollectionRef, item);
    await deleteDoc(itemDocRef);
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={7}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuBookIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1 }}>Bookkeeper</Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              signOut(auth);
              router.push("/sign-in");
            }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Modal open={open} onClose={handleClose}>
        <Box
          width={500}
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="white"
          border="2px solid black"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Log book</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box border="1px solid black">
        <Box
          minWidth="800px"
          width="80%"
          bgcolor="ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={10}
          margin="15px"
        >
          <Typography variant="h4">My Library</Typography>
          <Button variant="outlined" onClick={handleOpen}>
            Add new book
          </Button>
        </Box>
        <Stack minHeight="300px" spacing={2} overflow="auto">
          {inventory.map(({ name }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#f0f0f0"
              padding={1}
              paddingX={5}
            >
              <Typography variant="body1" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => {
                  removeItem(name);
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
