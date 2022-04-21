import "react-native-gesture-handler"; // 얘는 무조건 최상단에 있어야 함
import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Map from "./pages/Map";
import { AuthScreen } from "./pages";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import AppRoute from "./src/navigations/navigator";
import { store } from "./src/redux/store";

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Map 1"
        component={Map}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Map 2"
        component={Map}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const App = () => {
  return (
    // <NavigationContainer>
    //   <MyDrawer />
    // </NavigationContainer>
    <Provider store={store}>
      <AppRoute />
      <StatusBar style="auto" />
    </Provider>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
