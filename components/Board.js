import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import uuid from "uuid/v4";
import { RED, BLUE, BLACK, GRAY, CHOSEN, UNCHOSEN } from "../constants/Cards";

const determineCardStyle = card => {
  let style = [styles.boardCard];

  if (card.state === CHOSEN) {
    switch (card.color) {
      case RED:
        style.push(styles.boardCardRed);
        break;
      case BLUE:
        style.push(styles.boardCardBlue);
        break;
      case BLACK:
        style.push(styles.boardCardBlack);
        break;
      default:
        style.push(styles.boardCardGray);
        break;
    }
  }

  return style;
};

const determineCardTextStyle = card => {
  let style = [styles.boardCardText];

  if (card.state === CHOSEN) {
    style.push(styles.boardCardTextChosen);
  }

  return style;
};

export default ({ board, chooseCard }) => {
  return (
    <View>
      {board.length > 0 &&
        board.map(row => {
          return (
            <View style={styles.boardRow} key={uuid()}>
              {row.length > 0 &&
                row.map(card => {
                  return (
                    <View key={card.word}>
                      <TouchableOpacity
                        onPress={() => chooseCard(card.row, card.col)}
                        style={determineCardStyle(card)}
                      >
                        <Text style={determineCardTextStyle(card)}>
                          {card.word}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  boardRow: {
    flexDirection: "row"
  },
  boardCard: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
    margin: 2,
    fontWeight: "bold",
    width: 80,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  boardCardBlue: {
    backgroundColor: "blue"
  },
  boardCardRed: {
    backgroundColor: "red"
  },
  boardCardGray: {
    backgroundColor: "dimgray"
  },
  boardCardBlack: {
    backgroundColor: "black"
  },
  boardCardText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    textAlign: "center",
    color: "black"
  },
  boardCardTextChosen: {
    color: "white"
  }
});
