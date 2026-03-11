import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Agradecimentos from "./src/screens/Agradecimentos";

// Importar telas
import Home from "./src/screens/Home";
import Register from "./src/screens/Register";
import Login from "./src/screens/Login"
import Initialpage from "./src/screens/Initialpage";
import Menu from "./src/screens/Menu";
import Aboutus from "./src/screens/Aboutus";
import Userterms from "./src/screens/Userterms";
import Features from "./src/screens/Features";
import Profile from "./src/screens/Profile";
import ChatbotScreen from "./src/screens/ChabotScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Initialpage" component={Initialpage} />
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Aboutus" component={Aboutus} />
        <Stack.Screen name="Userterms" component={Userterms} />
        <Stack.Screen name="Features" component={Features} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        <Stack.Screen name="Agradecimentos" component={Agradecimentos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}