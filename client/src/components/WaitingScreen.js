import { Grid, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { GlobalCommunityContext } from "../community";
import { GameContext } from "../game";
import AuthContext from "../auth";
import { Box, Button, List, ListItem, TextField } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import BrushIcon from "@mui/icons-material/Brush";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import ColorizeIcon from "@mui/icons-material/Colorize";
import ClearIcon from "@mui/icons-material/Clear";

import { styled } from "@mui/material/styles";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
// import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
// konva stuff
import {
  Stage,
  Layer,
  Rect,
  Text,
  Circle,
  Line,
  Star,
  Ellipse,
} from "react-konva";
import { BsEraserFill } from "react-icons/bs";

import Timer from "./Timer";

//socket
import { SocketContext } from "../socket";

export default function WaitingScreen(props) {
  const { game } = useContext(GameContext);
  const { auth } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  let {
    stageRef,
    actions,
    setActions,
    URLImage,
    storyText,
    setStoryText,
    quillRef,
  } = props;
  const handleLeave = (event) => {
    game.leaveLobby();
  };
  const flexContainer = {
    display: "flex",
    flexDirection: "row",
    padding: 25,
    align: "center",
    alignItems: "center",
    justifyContent: "center",
  };
  //TODO Alan
  const handleChat = (event) => {
    event.preventDefault();
    console.log("handleAddFriend");
    const data = new FormData(event.currentTarget);
    const message = data.get("chat")
    console.log(game.lobby)
    socket.emit("send-chat-message", message, game.lobby, auth.user.username);
    document.getElementById('chat').placeholder= "Type Something";
    document.getElementById('chat').value= "";

  };
  //#region wait elements
  let waitCenterPanel = (
    <Grid item xs="6" align="center">
      <Box
        sx={{
          pointerEvents: "none",
          width: 600,
          height: 600,
          backgroundColor: "white",
          border: 3,
        }}
      >
        {game.gamemode === "comic" ? (
          <Stage width={600} height={600} ref={stageRef}>
            <Layer>
              <Rect x={0} y={0} width={600} height={600} fill="white" />
              {actions.map((action) => {
                if (action.tool === "pen" || action.tool === "eraser") {
                  return (
                    <Line
                      points={action.points}
                      stroke={action.stroke}
                      strokeWidth={action.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        action.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  );
                } else if (action.tool === "rectangle") {
                  return (
                    <Rect
                      x={action.x}
                      y={action.y}
                      width={action.width}
                      height={action.height}
                      fill={action.fill}
                      stroke={action.stroke}
                      strokeWidth={action.strokeWidth}
                    />
                  );
                } else if (action.tool === "ellipse") {
                  return (
                    <Ellipse
                      x={action.x}
                      y={action.y}
                      width={action.width}
                      height={action.height}
                      fill={action.fill}
                      stroke={action.stroke}
                      strokeWidth={action.strokeWidth}
                    />
                  );
                } else if (action.tool === "circle") {
                  return (
                    <Circle
                      x={action.x}
                      y={action.y}
                      width={action.width}
                      height={action.height}
                      fill={action.fill}
                      stroke={action.stroke}
                      strokeWidth={action.strokeWidth}
                    />
                  );
                } else if (action.tool === "text") {
                  return (
                    <Text
                      x={action.x}
                      y={action.y}
                      text={action.text}
                      fontSize={action.fontSize}
                      fill={action.fill}
                    />
                  );
                } else {
                  return <URLImage image={action} />;
                }
              })}
            </Layer>
          </Stage>
        ) : (
          <ReactQuill
            theme="bubble"
            value={storyText}
            placeholder={"Write something awesome..."}
            sx={{
              width: 600,
              height: 600,
              backgroundColor: "white",
              border: 3,
            }}
          ></ReactQuill>
        )}
      </Box>
    </Grid>
  );

  const waitChat = (
    <Grid>
      <Box
        sx={{
          width: 600,
          height: 600,
          backgroundColor: "white",
          border: 3,
          justifyContent: "space-between",
        }}
      >
        <div className="chat-messages">

        </div>
        {/* <Typography fontSize={"32px"} sx={{ width: "100%" }}>
          Terran: Hi!
        </Typography>
        <Typography fontSize={"32px"} sx={{ width: "100%" }}>
          xx: Hi!
        </Typography> */}
        <Box component="form" onSubmit={handleChat} noValidate>
          <TextField
          id="chat"
          name="chat"
           sx={{ top: "65%", width: "60%" }}>
             Type Message
           </TextField>
            <Button
              type="submit"
              sx={{
                marginLeft: 2,
                width: "20%",
                top: "65%",
                backgroundColor: "yellow",
                "&:hover": {
                  backgroundColor: "primary.main",
                  opacity: [0.9, 0.8, 0.7],
                },
                borderRadius: 5,
                border: 3,
                color: "black",
              }}
            >

              <Typography fontSize={"32px"}>chat</Typography>
            </Button>
        </Box>
      </Box>
    </Grid>
  );
  const waitUtils = (
    <Grid item xs="3" align="center">
      <Box
        sx={{
          width: 450,
          height: 75,
          margin: 1,
          backgroundColor: "#FF7F7F",
          borderRadius: 5,
          border: 3,
          color: "black",
        }}
      >
        <Timer 
        stageRef={stageRef} 
        actions={actions} 
        setActions={setActions}  
        storyText={storyText}
        setStoryText={setStoryText}>
        {storyText}
        </Timer>
      </Box>

      <Button
        sx={{
          width: 450,
          height: 75,
          margin: 1,
          backgroundColor: "red",
          "&:hover": {
            backgroundColor: "primary.main",
            opacity: [0.9, 0.8, 0.7],
          },
          borderRadius: 5,
          border: 3,
          color: "black",
        }}
        onClick={(event) => handleLeave()}
      >
        <Typography fontSize={"32px"}>Leave</Typography>
      </Button>
    </Grid>
  );


  
const messages = [];
const user2message = [];

function outputMessage(user, message){
  for(var i =0; i<messages.length; i++){
    const div = document.createElement('div'); 
    div.classList.add('message');
    div.innerHTML =`<p> ${user2message[i]}: ${messages[i]}</p>`;
    document.querySelector('.chat-messages').appendChild(div)
  }
  // const div = document.createElement('div'); 
  // div.classList.add('message');
  // div.innerHTML =`<p> ${user}: ${message}</p>`;
  // document.querySelector('.chat-messages').appendChild(div)
}


  useEffect(() => {
    const displayMessage = async (message, username) => {
      console.log("the message is", message)
      messages.push(message)
      user2message.push(username)
      // if(game.currentPlayer == auth.user.username){
      //   console.log("is the current player")
      //   outputMessage(username,message);
      // }
      // else{
        const div = document.createElement('div'); 
        div.classList.add('message');
        div.style.width = "100%"
        div.style.height = "100%"
        div.className='inline-block'
        div.innerHTML =`<p> ${username}: ${message}</p>`;
        document.querySelector('.chat-messages').appendChild(div)
      // }
    };
    socket.on("receive-message", displayMessage);
    return () => {
      socket.off("receive-message", displayMessage);
    };
  }, []);


  return (
    <List style={flexContainer} sx={{ justifyContent: "center" }}>
      {/* Left of Canvas */}
      {waitChat}
      {/* Drawing Canvas */}
      {waitCenterPanel}
      {/* Right of Canvas */}
      {waitUtils}
    </List>
  );
  //#endregion
}
