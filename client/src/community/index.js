import { createContext, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "./community-request-api";
import AuthContext from "../auth";
/*
    This is our global data Community. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR Community
export const GlobalCommunityContext = createContext({});
console.log("create GlobalCommunityContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA Community STATE THAT CAN BE PROCESSED
export const GlobalCommunityActionType = {
  CREATE_NEW_COMMUNITY: "CREATE_NEW_COMMUNITY",
  CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
  CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
  LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
  MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
  UNMARK_LIST_FOR_DELETION: "UNMARK_LIST_FOR_DELETION",
  SET_CURRENT_LIST: "SET_CURRENT_LIST",
  SET_ITEM_EDIT_ACTIVE: "SET_ITEM_EDIT_ACTIVE",
  SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
  SET_IS_GUEST: "SET_IS_GUEST",
  SET_CURRENT_LISTS: "SET_CURRENT_LISTS",
  SET_LIST_VIEW: "SET_LIST_VIEW",
  SET_SORT: "SET_SORT",
};

// WITH THIS WE'RE MAKING OUR GLOBAL DATA Community
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalCommunityContextProvider(props) {
  // THESE ARE ALL THE THINGS OUR DATA Community WILL MANAGE
  const [community, setCommunity] = useState({
    communityList: null,
    currentCommunity: null,
    // will remove in future clean-up commit @Terran
    // newListCounter: 0,
    // listNameActive: false,
    // itemActive: false,
    // listMarkedForDeletion: null,
    // isGuest: false,
    // listView: "yours",
    // currentLists: null,
    search: null,
    errorMessage: null,
    sort: "newest date",
  });
  const history = useHistory();

  const { auth } = useContext(AuthContext);
  console.log("auth: " + auth);

  const communityReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalCommunityActionType.CREATE_NEW_COMMUNITY: {
        return setCommunity({
          communityList: null,
          currentCommunity: payload
        });
      }
      default:
        return community;
    }
  };

  community.createNewCommunity = async function () {
    try{
      // hard coded community name
      let communityName = "Untitled";
      const response = await api.createCommunity(
        communityName,
        [auth.user.username]
        );
      console.log("createNewCommunity response: " + response);
      if (response.status === 201) {
        let community = response.data.community;
        communityReducer({
          type: GlobalCommunityActionType.CREATE_NEW_COMMUNITY,
          payload: community,
        });
        history.push("/community/" + community._id);
      } 
    }catch{
      console.log("API FAILED TO CREATE A NEW COMMUNITY");
    }
  };

  // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR Community AND
  // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN
  // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.
  return (
    <GlobalCommunityContext.Provider
      value={{
        community,
      }}
    >
      {props.children}
    </GlobalCommunityContext.Provider>
  );
}

export default GlobalCommunityContext;
export { GlobalCommunityContextProvider };
