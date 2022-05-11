//#region imports
import { Grid, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../game";
import AuthContext from "../auth";
import { Box, Button, List, ListItem, TextField } from "@mui/material";

import { styled } from "@mui/material/styles";
// import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import WaitingScreen from "./WaitingScreen";
import GameTools from "./GameTools";
import Timer from "./Timer";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ReactQuill from "react-quill";

import api from "../community/community-request-api";
//#endregion imports

//#region konva import
import {
  Stage,
  Layer,
  Rect,
  Text,
  Circle,
  Line,
  Star,
  Shape,
  Image,
  Ellipse,
} from "react-konva";
import useImage from "use-image";
import { BsEraserFill } from "react-icons/bs";
import URLImage from "./URLImage";
//#endregion konva import

//#region quilljs import
import StoryEditor from "./StoryEditor";
//#endregion quilljs

export default function GameScreen() {
    const { game } = useContext(GameContext);

    const [actions, setActions] = React.useState([]);
    const [panels, setPanels] = useState([]) 
    const [postID, setPostID] = useState(window.location.pathname.toString().substring(14))
    
    async function getPost() {
        const postResponse = await api.getPostById(postID);
           //also need to check for story
           const comicResponse = await api.getComicById(postResponse.data.post.postComic)
           setPanels(comicResponse.data.comic.panels)
           console.log("the value of game.turn in getPost ",game.turn)
           setActions(
               actions.concat([
                   {
                   ...stageRef.current.getPointerPosition(),
                   src: comicResponse.data.comic.panels[game.turn],
                   key: actions.length + 1
                   },
               ])
           );
    }

    useEffect(() => {
        getPost()
    }, []);

  const { auth } = useContext(AuthContext);

  const [storyText, setStoryText] = React.useState("");
  const charLimit = 9999999;

  //#region css
  const buttonCSS = { color: "black", fontSize: "40pt" };
  //#endregion css

  //#region game control

  const [characterToggle, setCharacterToggle] = useState(false);
  const toggleCharacters = () => {
    if (!characterToggle) {
      setTool("image");
    }
    setCharacterToggle(!characterToggle);
  };
  const [bubbleToggle, setBubbleToggle] = useState(false);

  const nextPanel = () => {
  //TODO
  //change to next panel
  console.log("next panel method");
  let imageData = stageRef.current.toDataURL();
  const currTurn = game.turn
  if(currTurn+1 == panels.length){
    console.log("inside go to voting")
    game.enterVoting(imageData)
  }
  else{
    game.soloNextTurn(imageData)   //Updates the image Data
    setActions(
      [
          {
          ...stageRef.current.getPointerPosition(),
          src: panels[currTurn +1],
          key: actions.length + 1
          },
      ]
    );
  }
  
  };

  const [themeToggle, setThemeToggle] = useState(false);
  const toggleThemes = () => {
    if (!themeToggle) {
      setTool("image");
    }
    setThemeToggle(!themeToggle);
  };

  const charactersLeft = 147;

  const flexContainer = {
    display: "flex",
    flexDirection: "row",
    padding: 25,
    align: "center",
    alignItems: "center",
    justifyContent: "center",
  };

  const [alignment, setAlignment] = React.useState("left");
  const [formats, setFormats] = React.useState(() => ["italic"]);

  const handleFormat = (event, newFormats) => {
    setFormats(newFormats);
  };

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    "& .MuiToggleButtonGroup-grouped": {
      margin: theme.spacing(0.5),
      border: 0,
      "&.Mui-disabled": {
        border: 0,
      },
      "&:not(:first-of-type)": {
        borderRadius: theme.shape.borderRadius,
      },
      "&:first-of-type": {
        borderRadius: theme.shape.borderRadius,
      },
    },
  }));

  //#endregion game control

  //#region KONVA functions
  const [tool, setTool] = React.useState("pen");
  const [color, setColor] = React.useState("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState(15);
  const [fill, setFill] = React.useState("#ffffff");
  const [redos, setRedos] = React.useState([]);
  const [displayText, setDisplayText] = React.useState("Enter Text Here");

  const isDrawing = React.useRef(false);
  const stageRef = React.useRef(null);
  const dragUrl = React.useRef();

  const handleChangeText = (e) => {
    const text = e.target.value;
    setDisplayText(text);
  };

  const handleUndo = () => {
    if (actions.length) {
      let redo = actions.pop();
      setActions(actions);
      setRedos([...redos, redo]);
    }
  };

  const handleRedo = () => {
    if (redos.length) {
      let action = redos.pop();
      setActions([...actions, action]);
      setRedos(redos);
    }
  };

  const handleClear = () => {
    setActions([]);
    setRedos([]);
  };

  const changeColor = (event, color) => {
    event.stopPropagation();
    setColor(color);
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    if (tool == "pen" || tool == "eraser") {
      const pos = e.target.getStage().getPointerPosition();
      setActions([
        ...actions,
        {
          tool,
          key: actions.length + 1,
          strokeWidth: strokeWidth,
          stroke: color,
          points: [pos.x, pos.y],
        },
      ]);
    } else if (tool == "rectangle") {
      const { x, y } = e.target.getStage().getPointerPosition();
      setActions([
        ...actions,
        {
          tool,
          x,
          y,
          width: 0,
          height: 0,
          key: actions.length + 1,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: fill,
        },
      ]);
    } else if (tool == "ellipse") {
      const { x, y } = e.target.getStage().getPointerPosition();
      setActions([
        ...actions,
        {
          tool,
          x,
          y,
          width: 0,
          height: 0,
          key: actions.length + 1,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: fill,
        },
      ]);
    } else if (tool == "circle") {
      const { x, y } = e.target.getStage().getPointerPosition();
      setActions([
        ...actions,
        {
          tool,
          x,
          y,
          width: 0,
          height: 0,
          key: actions.length + 1,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: fill,
        },
      ]);
    } else if (tool == "text") {
      const { x, y } = e.target.getStage().getPointerPosition();
      actions.push({
        tool,
        x,
        y,
        fontSize: strokeWidth,
        fill: color,
        key: actions.length + 1,
        text: displayText,
        draggable: true,
      });
      setActions(actions);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) {
      return;
    }
    if (tool == "pen" || tool == "eraser") {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = actions[actions.length - 1];
      // add point
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      // replace last
      actions.splice(actions.length - 1, 1, lastLine);
      setActions(actions.concat());
    } else if (tool == "rectangle") {
      const sx = actions[actions.length - 1].x;
      const sy = actions[actions.length - 1].y;
      const key = actions[actions.length - 1].key;
      const { x, y } = e.target.getStage().getPointerPosition();

      let lastRectangle = {
        tool,
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: key,
        stroke: color,
        strokeWidth: strokeWidth,
        fill: fill,
      };
      actions.splice(actions.length - 1, 1, lastRectangle);
      setActions(actions.concat());
    } else if (tool == "ellipse") {
      const sx = actions[actions.length - 1].x;
      const sy = actions[actions.length - 1].y;
      const key = actions[actions.length - 1].key;
      const { x, y } = e.target.getStage().getPointerPosition();

      let lastEllipse = {
        tool,
        x: sx,
        y: sy,
        width: Math.abs(x - sx),
        height: Math.abs(y - sy),
        key: key,
        stroke: color,
        strokeWidth: strokeWidth,
        fill: fill,
      };
      actions.splice(actions.length - 1, 1, lastEllipse);
      setActions(actions.concat());
    } else if (tool == "circle") {
      const sx = actions[actions.length - 1].x;
      const sy = actions[actions.length - 1].y;
      const key = actions[actions.length - 1].key;
      const { x, y } = e.target.getStage().getPointerPosition();

      let lastCircle = {
        tool,
        x: sx,
        y: sy,
        width: Math.abs(x - sx),
        height: Math.abs(y - sy),
        key: key,
        stroke: color,
        strokeWidth: strokeWidth,
        fill: fill,
      };
      actions.splice(actions.length - 1, 1, lastCircle);
      setActions(actions.concat());
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    setRedos([]);
  };

  //#endregion

  /* List of current panels drawn goes here */
  let gamePanels = "";
  //comic check disabled
//   if (game.gamemode == "comic") {
    gamePanels = (
      <Box sx={{ width: "70%", height: "70%" }}>
        <ImageList sx={{ width: "95%" }} cols={6}>
          {panels.map((picture,index) => (
            <ImageListItem key={index}>
              <img src={picture} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
//   } else if (game.gamemode == "story") {
//     gamePanels = (
//       <Grid container spacing={2}>
//         {game.panels.map((text) => (
//           <Grid
//             item
//             key={text}
//             xs={2}
//             sx={{
//               backgroundColor: "white",
//               border: 3,
//             }}
//             style={{ height: 200 }}
//           >
//             <ReactQuill
//               style={{ maxHeight: "100%", overflow: "auto" }}
//               readOnly={true}
//               theme="bubble"
//               value={text}
//             ></ReactQuill>
//           </Grid>
//         ))}
//       </Grid>
//     );
//   }

  const isColorSelected = (buttonColor) => {
    if (color == buttonColor) {
      return "black";
    } else {
      return "white";
    }
  };

  const isFillSelected = (fillColor) => {
    if (fill == fillColor) {
      return "black";
    } else {
      return "white";
    }
  };

  const handleSetStrokeWidth = (event, width) => {
    setStrokeWidth(width);
  };

  const handleSetFill = (event, fill) => {
    setFill(fill);
  };

  const gameTools = (
    <GameTools
      buttonCSS={buttonCSS}
      setTool={setTool}
      //force comic
      gameMode={'comic'}
      flexContainer={flexContainer}
      tool={tool}
      changeColor={changeColor}
      isColorSelected={isColorSelected}
      handleSetStrokeWidth={handleSetStrokeWidth}
      strokeWidth={strokeWidth}
      fill={fill}
      handleSetFill={handleSetFill}
      isFillSelected={isFillSelected}
      handleUndo={handleUndo}
      handleRedo={handleRedo}
      handleChangeText={handleChangeText}
      handleClear={handleClear}
      setCharacterToggle={setCharacterToggle}
      setThemeToggle={setThemeToggle}
      setBubbleToggle={setBubbleToggle}
    />
  );

  /* Drawing/Writing Canvas */
  let gameWorkSpace = "";
  //force comic
//   if (game.gamemode === "comic") {
    gameWorkSpace = (
      <Grid item xs={6} align="center">
        <Box
          sx={{
            width: 600,
            height: 600,
            backgroundColor: "white",
            border: 3,
          }}
          onDrop={(e) => {
            e.preventDefault();
            // register event position
            stageRef.current.setPointersPositions(e);
            // add image
            actions.push({
              ...stageRef.current.getPointerPosition(),
              src: dragUrl.current,
              key: actions.length + 1,
              size: strokeWidth,
            });
            setActions(
              actions.concat([
                {
                  ...stageRef.current.getPointerPosition(),
                  src: dragUrl.current,
                  key: actions.length + 1,
                  size: strokeWidth,
                },
              ])
            );
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Stage
            width={600}
            height={600}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            ref={stageRef}
          >
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
        </Box>
      </Grid>
    );
//   } else {
//     gameWorkSpace = (
//       <Grid item xs={6} align="center">
//         <StoryEditor
//           storyText={storyText}
//           setStoryText={setStoryText}
//           charLimit={charLimit}
//           game={game}
//         />
//       </Grid>
//     );
//   }

  //right handside buttons
  let gameUtils = "";
//force comic
//   if (game.gamemode === "comic") {
    gameUtils = (
      <Grid item xs={3} align="center">
        {/* <Box
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
            setStoryText={setStoryText}
          />
        </Box> */}
        {/* <Button
          sx={{
            width: 450,
            height: 75,
            margin: 1,
            backgroundColor: "primary.dark",
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: [0.9, 0.8, 0.7],
            },
            borderRadius: 5,
            border: 3,
            color: "black",
          }}
          onClick={toggleThemes}
        >
          <Typography fontSize={"32px"}>Themes</Typography>
        </Button> */}
        {/* {themeToggle && (
          <Box
            sx={{
              margin: 1,
              backgroundColor: "primary.dark",
              "&:hover": {
                backgroundColor: "primary.main",
                opacity: [0.9, 0.8, 0.7],
              },
              borderRadius: 5,
              border: 3,
              color: "black",
            }}
          >
            <ImageList sx={{ width: "95%" }} cols={3}>
              <ImageListItem key={1}>
                <img
                  src={require("../images/background1.png")}
                  draggable="true"
                  onDragStart={(e) => {
                    dragUrl.current = e.target.src;
                  }}
                />
              </ImageListItem>
              <ImageListItem key={2}>
                <img
                  src={require("../images/background2.png")}
                  draggable="true"
                  onDragStart={(e) => {
                    dragUrl.current = e.target.src;
                  }}
                />
              </ImageListItem>
              <ImageListItem key={3}>
                <img
                  src={require("../images/background3.png")}
                  draggable="true"
                  onDragStart={(e) => {
                    dragUrl.current = e.target.src;
                  }}
                />
              </ImageListItem>
            </ImageList>
          </Box>
        )} */}
        {/* <Button
          sx={{
            width: 450,
            height: 75,
            margin: 1,
            backgroundColor: "primary.dark",
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: [0.9, 0.8, 0.7],
            },
            borderRadius: 5,
            border: 3,
            color: "black",
          }}
          onClick={toggleCharacters}
        >
          <Typography fontSize={"32px"}>Characters</Typography>
        </Button> */}
        {/* {characterToggle && (
          <Box
            sx={{
              margin: 1,
              backgroundColor: "primary.dark",
              "&:hover": {
                backgroundColor: "primary.main",
                opacity: [0.9, 0.8, 0.7],
              },
              borderRadius: 5,
              border: 3,
              color: "black",
            }}
          >
            <ImageList sx={{ width: "95%" }} cols={3}>
              {[1, 2, 3, 4, 5, 6].map((picture) => (
                <ImageListItem key={picture}>
                  <img
                    src={require("../images/Trollface.png")}
                    draggable="true"
                    onDragStart={(e) => {
                      dragUrl.current = e.target.src;
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )} */}
        <Button
          sx={{
            width: 450,
            height: 75,
            margin: 1,
            backgroundColor: "primary.dark",
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: [0.9, 0.8, 0.7],
            },
            borderRadius: 5,
            border: 3,
            color: "black",
          }}
          //TODO
          onClick={nextPanel}
        >
          <Typography fontSize={"32px"}>NEXT</Typography>
        </Button>
      </Grid>
    );
//   } else {
//     gameUtils = (
//       <Grid item xs={3} align="center">
//         <Box
//           sx={{
//             width: 450,
//             height: 75,
//             margin: 1,
//             backgroundColor: "#FF7F7F",
//             "&:hover": {
//               backgroundColor: "#FF7F7F",
//               opacity: [1, 1, 1],
//             },
//             borderRadius: 5,
//             border: 3,
//             color: "black",
//           }}
//         >
//           <Timer
//             stageRef={stageRef}
//             actions={actions}
//             setActions={setActions}
//             storyText={storyText}
//             setStoryText={setStoryText}
//           />
//         </Box>
//         {/* <Typography
//           fontSize={"32px"}
//           sx={{
//             width: 450,
//             height: 75,
//             margin: 1,
//             backgroundColor: "#b19cd9",
//             "&:hover": {
//               backgroundColor: "#b19cd9",
//               opacity: [1, 1, 1],
//             },
//             borderRadius: 5,
//             border: 3,
//             color: "black",
//           }}
//         >
//           {"Characters Left: "} {charLimit - storyText.replace(/<\/?[^>]+(>|$)/g, "").length}
//         </Typography> */}
//         <Button
//           sx={{
//             width: 450,
//             height: 75,
//             margin: 1,
//             backgroundColor: "green",
//             "&:hover": {
//               backgroundColor: "green",
//               opacity: [0.9, 0.8, 0.7],
//             },
//             borderRadius: 5,
//             border: 3,
//             color: "black",
//           }}
//         >
//           <Typography fontSize={"32px"}>Submit</Typography>
//         </Button>
//       </Grid>
//     );
//   }
  //#endregion render elements

  let currentDisplay = (
    <List style={flexContainer} sx={{ justifyContent: "center" }}>
      {/* Left of Canvas */}
      {gameTools}
      {/* Drawing Canvas */}
      {gameWorkSpace}
      {/* Right of Canvas */}
      {gameUtils}
    </List>
  );

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('https://i.imgur.com/FQ01edj.jpg')",
      }}
    >
      <Grid item xs={12} align="center">
        {gamePanels}
        {/* Bottom half of screen */}
        {currentDisplay}
      </Grid>
    </Grid>
  );
}
