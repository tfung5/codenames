import "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import io from "socket.io-client";
import { server } from "../config";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationActions } from "react-navigation";
import Clues from "../components/Clues";
import CardsLeft from "../components/CardsLeft";
import SocketContext from "../components/SocketContext";
import GameContext from "../components/GameContext";
import {
  LEAVE_GAME,
  FETCH_TEAMS,
  JOIN_GAME,
  JOIN_LOBBY,
  JOIN_SLOT,
  REQUEST_INDIVIDUAL_START_GAME,
  START_GAME,
  UPDATE_LOBBY,
} from "../constants/Actions";
import { RED, BLUE } from "../constants/Cards";
import SnackBars from "../components/SnackBars";

export default function HomeScreen({ navigation }) {
  const { socket, setSocket } = useContext(SocketContext);

  // componentDidMount
  useEffect(() => {
    setSocket(io(server));
  }, []);

  const [name, setName] = React.useState("");

  const joinLobby = () => {
    socket.emit(JOIN_LOBBY, name);
    navigation.navigate("Lobby", { name });
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, flexDirection: "column" }}
    >
      <View
        style={{
          flex: 29,
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#EAE7F2",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            padding: 25,
          }}
        >
          <Text style={{ fontSize: 25 }}>Name:</Text>
          <TextInput
            style={{
              fontSize: 18,
              backgroundColor: "white",
              borderWidth: 2,
              borderRadius: 10,
              borderColor: "lightskyblue",
              padding: 5,
              width: 220,
              textAlign: "center",
            }}
            onChangeText={(text) => {
              setName(text);
            }}
            value={name}
          />
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              alignItems: "center",
              backgroundColor: "white",
              borderWidth: 2,
              borderRadius: 10,
              width: 250,
            }}
            onPress={joinLobby}
          >
            <Text style={{ fontSize: 25 }}>Join Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export function LobbyScreen({ navigation }) {
  const { socket } = useContext(SocketContext);
  const { game, setGame } = useContext(GameContext);

  // Initiated by the first player to hit Start Game
  const startGame = () => {
    socket.emit(START_GAME);
  };

  // Will join game by:
  const joinGame = () => {
    socket.emit(JOIN_GAME); // Join the appropriate room depending on player's role
    setGame({
      ...game,
      isGameInProgress: true,
    });
    navigateToGameScreen();
  };

  const navigateToGameScreen = () => {
    navigation.navigate(
      "GameStack",
      {},
      NavigationActions.navigate({
        routeName: "Game",
      })
    );
  };

  const navigateToHomeScreen = () => {
    navigation.navigate("Home");
  };

  const handleLeaveGame = () => {
    emitLeaveGame();
    setGame({
      ...game,
      isGameInProgress: false,
      hasLeftPreviousGame: true,
    });
    navigateToHomeScreen();
  };

  const emitLeaveGame = () => {
    socket.emit(LEAVE_GAME);
  };

  const { name } = navigation.state.params;
  const [redTeam, setRedTeam] = React.useState(new Array(4).fill(null));
  const [blueTeam, setBlueTeam] = React.useState(new Array(4).fill(null));
  const [isGameInProgress, setIsGameInProgress] = React.useState(false);

  const slotWidth = 175;
  const slotHeight = 35;

  // componentDidMount
  useEffect(() => {
    socket.emit(FETCH_TEAMS);
    subscribeToGameStart();
    subscribeToLobbyUpdates();
  }, []);

  const subscribeToLobbyUpdates = () => {
    // Handle UPDATE_LOBBY
    socket.on(UPDATE_LOBBY, (payload) => {
      const { redTeam, blueTeam, isGameInProgress } = payload;
      setRedTeam(redTeam);
      setBlueTeam(blueTeam);
      setIsGameInProgress(isGameInProgress);
    });
  };

  // Upon receiving request from the server to start game, will join game
  const subscribeToGameStart = () => {
    socket.on(REQUEST_INDIVIDUAL_START_GAME, () => {
      joinGame();
    });
  };

  const renderGameButton = () => {
    if (isGameInProgress) {
      return (
        <TouchableOpacity
          onPress={joinGame}
          style={{
            borderRadius: 10,
            margin: 16,
            borderWidth: 2,
            paddingHorizontal: 16,
            paddingVertical: 4,
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 20, width: slotWidth, textAlign: "center" }}>
            Join Game
          </Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={startGame}
          style={{
            borderRadius: 10,
            margin: 16,
            borderWidth: 2,
            paddingHorizontal: 16,
            paddingVertical: 4,
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 20, width: slotWidth, textAlign: "center" }}>
            Start Game
          </Text>
        </TouchableOpacity>
      );
    }
  };

  const renderLeaveGameScreen = () => {
    return (
      <View style={styles.centerItems}>
        <TouchableOpacity
          onPress={handleLeaveGame}
          style={styles.testingButton}
        >
          <Text style={styles.testingButtonText}>Leave Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={navigateToGameScreen}
          style={styles.testingButton}
        >
          <Text style={styles.testingButtonText}>Back to Game</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const listRedItems = redTeam.map((buttonnum, index) => {
    let slotColor = "lightgrey";
    let slotName = "Player Slot";
    let slotBorderColor = "black";
    if (index === 0) {
      slotName = "Spymaster Slot";
      slotBorderColor = "firebrick";
    }
    if (redTeam[index] === null) {
      slotColor = "white";
    } else {
      // If slot is taken
      slotColor = "lightgrey"; // Set color to gray
      slotName = redTeam[index].name; // Set name to player's name

      // But if slot is the current player
      if (redTeam[index].id === socket.id) {
        slotColor = "#FFC58E"; // Set color to orange
      }
    }

    return (
      <TouchableOpacity
        key={index}
        style={{
          backgroundColor: slotColor,
          borderColor: slotBorderColor,
          borderRadius: 10,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 3,
          width: slotWidth,
          height: slotHeight,
        }}
        onPress={() => {
          const redTeamCopy = [...redTeam];
          const blueTeamCopy = [...blueTeam];
          if (redTeam[index] === null) {
            const existingIndexR = redTeam.findIndex(
              (element) => element == name
            );
            const existingIndexB = blueTeam.findIndex(
              (element) => element == name
            );
            if (existingIndexR != -1) {
              redTeamCopy[existingIndexR] = null;
            }
            if (existingIndexB != -1) {
              blueTeamCopy[existingIndexB] = null;
            }
            redTeamCopy[index] = name;
          }
          setRedTeam(redTeamCopy);
          setBlueTeam(blueTeamCopy);
          socket.emit(JOIN_SLOT, { team: RED, index });
        }}
      >
        <Text style={{ fontSize: 20 }}>{slotName}</Text>
      </TouchableOpacity>
    );
  });
  const listBlueItems = blueTeam.map((buttonnum, index) => {
    let slotColor = "lightgrey";
    let slotName = "Player Slot";
    let slotBorderColor = "black";
    if (index === 0) {
      slotName = "Spymaster Slot";
      slotBorderColor = "dodgerblue";
    }

    if (blueTeam[index] === null) {
      slotColor = "white";
    } else {
      // If slot is taken
      slotColor = "lightgrey"; // Set color to gray
      slotName = blueTeam[index].name; // Set name to player's name

      // But if slot is the current player
      if (blueTeam[index].id === socket.id) {
        slotColor = "#A89CD0"; // Set color to purple
      }
    }

    return (
      <TouchableOpacity
        key={index}
        style={{
          backgroundColor: slotColor,
          borderColor: slotBorderColor,
          borderRadius: 10,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 3,
          width: slotWidth,
          height: slotHeight,
        }}
        onPress={() => {
          const blueTeamCopy = [...blueTeam];
          const redTeamCopy = [...redTeam];
          if (blueTeam[index] === null) {
            const existingIndexB = blueTeam.findIndex(
              (element) => element == name
            );
            const existingIndexR = redTeam.findIndex(
              (element) => element == name
            );
            if (existingIndexB != -1) {
              blueTeamCopy[existingIndexB] = null;
            }
            if (existingIndexR != -1) {
              redTeamCopy[existingIndexR] = null;
            }
            blueTeamCopy[index] = name;
          }
          setRedTeam(redTeamCopy);
          setBlueTeam(blueTeamCopy);
          socket.emit(JOIN_SLOT, { team: BLUE, index });
        }}
      >
        <Text style={{ fontSize: 20 }}>{slotName}</Text>
      </TouchableOpacity>
    );
  });

  if (game.isGameInProgress) {
    return renderLeaveGameScreen();
  } else {
    return (
      <View style={{ flex: 1, flexDirection: "column" }}>
        <View
          style={{
            flex: 29,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EAE7F2",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderColor: "firebrick",
              borderWidth: 2,
              borderRadius: 10,
              paddingHorizontal: "9%",
              paddingVertical: 10,
              marginBottom: 10,
            }}
          >
            {listRedItems}
          </View>
          <View
            style={{
              backgroundColor: "white",
              borderColor: "dodgerblue",
              borderWidth: 2,
              borderRadius: 10,
              paddingHorizontal: "9%",
              padding: 10,
              marginTop: 10,
            }}
          >
            {listBlueItems}
          </View>
          {/* <Text
            style={{ fontSize: 25 }}
            onPress={() => navigation.navigate("Test")}
          >
            Touch for Test
          </Text> */}
          {renderGameButton()}
        </View>
      </View>
    );
  }
}

export function TestScreen({ navigation }) {
  const [buttonPressed, setButtonPressed] = React.useState(false);
  const pressButton = (buttonPressed) => {
    setButtonPressed(true);
  };
  return (
    <View style={{ flex: 1 }}>
      <Clues canEdit={false} />
      <Clues canEdit={true} />
      <Text>{"\n"}</Text>
      <CardsLeft redLeft={6} blueLeft={3} canEnd={true} />
      <CardsLeft redLeft={3} blueLeft={4} canEnd={false} />
      <TouchableOpacity
        style={{ backgroundColor: "green" }}
        onPress={(buttonPressed) => {
          pressButton(buttonPressed);
        }}
      >
        <Text>Touch for Snack</Text>
      </TouchableOpacity>
      <SnackBars
        visible={buttonPressed}
        setVisible={setButtonPressed}
        correct={true}
        number={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  testingButton: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 25,
    width: 150,
    padding: 10,
    marginTop: 5,
  },
  testingButtonText: {
    textAlign: "center",
  },
  centerItems: {
    alignItems: "center",
    justifyContent: "center",
  },
});
