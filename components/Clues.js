import React, {useContext, Component } from "react";
import { TouchableOpacity, Image, Text, TextInput, View } from "react-native";
import {
  SET_CLUE
} from "../constants/Actions";
import SocketContext from "../components/SocketContext";

export default ({ canEdit }) => {
  const {socket} = useContext(SocketContext);
  const [word, setWord] = React.useState("");
  const [number, setNumber] = React.useState(0);
  const submitClues = () => {
    socket.emit(SET_CLUE, {word, number});
  }
  const hidden = canEdit => {
    if (canEdit === false) {
      return <>{null}</>;
    }
    return (
      <>
        <TouchableOpacity
          onPress={
            submitClues
          }
        >
          <Image
            style={{ margin: 4, width: 40, height: 40 }}
            source={require("../assets/images/play-icon.png")}
          />
        </TouchableOpacity>
      </>
    );
  };
  return (
    <>
      <Text>{"\n"}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ margin: 4, fontSize: 25 }}>Clue:</Text>
        <TextInput
          editable={canEdit}
          style={{
            fontSize: 18,
            margin: 4,
            backgroundColor: "white",
            borderColor: "lightskyblue",
            padding: 5,
            borderWidth: 2,
            borderRadius: 10,
            width: 180
          }}
          textAlign={"center"}
          onChangeText={(text) => {
            setWord(text)
          }}
        />
        <TextInput
          editable={canEdit}
          style={{
            fontSize: 18,
            margin: 4,
            backgroundColor: "white",
            borderColor: "lightskyblue",
            padding: 5,
            borderWidth: 2,
            borderRadius: 10,
            width: 50
          }}
          textAlign={"center"}
          keyboardType={"numeric"}
          onChangeText={(text) => {
            setNumber(text);
          }}
        />
        {hidden(canEdit)}
      </View>
    </>
  );
};
