import "./App.css";
import { React } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthContextProvider } from "./auth";
import { GlobalCommunityContextProvider } from "./community";
import {
  WelcomeScreen
} from "./components";
/*
    This is our application's top-level component.
    
    @author McKilla Gorilla
*/
/*
  This is the entry-point for our application. Notice that we
  inject our store into all the components in our application.
  
  @author McKilla Gorilla
*/
const App = () => {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <GlobalCommunityContextProvider>
          <WelcomeScreen />
        </GlobalCommunityContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
};

export default App;
