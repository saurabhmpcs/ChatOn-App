import useRoom from "@/hooks/useRoom";
import { AddPhotoAlternate, MoreVert } from "@mui/icons-material";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import MediaPreview from "./MediaPreview";
import ChatFooter from "./ChatFooter";
import { nanoid } from "nanoid";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Compressor from "compressorjs";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@/utils/firebase";
import useChatMessages from "@/hooks/useChatMessages";
import ChatMessages from "./ChatMessages";

export default function Chat({ user }) {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [src, setSrc] = useState("");
  const [audioId, setAudioId] = useState("");

  const [input, setInput] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const roomId = router.query.roomId ?? "";
  const userId = user.uid;
  const room = useRoom(roomId, userId);

  const messages = useChatMessages(roomId);

  function showPreview(event) {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSrc(reader.result);
      };
    }
  }

  function closePreview() {
    setSrc("");
    setImage(null);
  }

  async function sendMessage(event) {
    event.preventDefault();

    setInput("");
    if (image) closePreview();
    const imageName = nanoid();

    await setDoc(doc(db, `users/${userId}/chats/${roomId}`), {
      name: room.name,
      photoURL: room.photoURL || null,
      timestamp: serverTimestamp(),
    });
    const newDoc = await addDoc(collection(db, `rooms/${roomId}/messages`), {
      name: user.displayName,
      message: input,
      uid: user.uid,
      timestamp: serverTimestamp(),
      time: new Date().toUTCString(),
      ...(image ? { imageUrl: "uploading`, imageName" } : {}),
    });

    if (image) {
      new Compressor(image, {
        quality: 0.8,
        maxWidth: 1920,
        async success(result) {
          setSrc("");
          setImage(null);
          await uploadBytes(ref(storage, `images/${imageName}`), result);

          const url = await getDownloadURL(ref(storage, `images/${imageName}`));

          await updateDoc(doc(db, `rooms/${roomId}/messages/${newDoc.id}`), {
            imageUrl: url,
          });
        },
      });
    }
  }

  async function deleteRoom() {
    setOpenMenu(null);
    setIsDeleting(true);

    try {
      const userChatsRef = doc(db, `users/${userId}/chats/{$roomId}`);
      const roomRef = doc(db, `rooms/${roomId}`);
      const roomMessagesRef = collection(db, `rooms/${roomId}/messages`);
      const roomMessages = await getDocs(query(roomMessagesRef));
      const audioFiles = [];
      const imageFiles = [];
      roomMessages?.docs.forEach((doc) => {
        if (doc.data().audioName) {
          audioFiles.push(doc.data().audioName);
        } else if (doc.data().imageName) {
          imageFiles.push(doc.data().imageName);
        }
      });
      await Promise.all([
        deleteDoc(userChatsRef),
        deleteDoc(roomRef),
        ...roomMessages.docs.map((doc) => deleteDoc(doc.ref)),
        ...imageFiles.map((imageName) =>
          deleteObject(ref(storage, `images/${image}`))
        ),
        ...audioFiles.map((audioName) =>
          deleteObject(ref(storage, `audio/${audio}`))
        ),
      ]);
    } catch (error) {
      console.error("Error deleting room: ", error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!room) return null;

  return (
    <div className="chat">
      <div className="chat__background" />

      {/* CHAT HEADER  */}
      <div className="chat__header">
        <div className="avatar__container">
          <Avatar src={room.photoURL} />
        </div>

        <div className="chat__header--info">
          <h3>{room.name}</h3>
        </div>

        <div className="chat__header--right">
          <input
            type="file"
            id="image"
            style={{ display: "none" }}
            accept="image/*"
            onChange={showPreview}
          />
          <IconButton>
            <label style={{ cursor: "pointer", height: 24 }} htmlFor="image">
              <AddPhotoAlternate />
            </label>
          </IconButton>

          <IconButton onClick={(event) => setOpenMenu(event.currentTarget)}>
            <MoreVert />
          </IconButton>

          <Menu
            id="menu"
            keepMounted
            anchorEl={openMenu}
            open={!!openMenu}
            onClose={() => setOpenMenu(null)}
          >
            <MenuItem onClick={deleteRoom}>Delete Room</MenuItem>
          </Menu>
        </div>
      </div>

      <div className="chat__body--container">
        <div className="chat__body">
          <ChatMessages
            messages={messages}
            user={user}
            roomId={roomId}
            audioId={audioId}
            setAudioId={setAudioId}
          />
        </div>
      </div>

      <MediaPreview src={src} closePreview={closePreview} />
      <ChatFooter
        input={input}
        onChange={(event) => setInput(event.target.value)}
        image={image}
        user={user}
        room={room}
        roomId={roomId}
        sendMessage={sendMessage}
        setAudioId={setAudioId}
      />

      {isDeleting && (
        <div className="chat__deleting">
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
