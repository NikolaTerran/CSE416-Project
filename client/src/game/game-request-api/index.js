import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: "https://jart.azurewebsites.net//api",
});

export const createGame = () => {
  return api.post(`/game`);
};

const apis = {
  createGame,
};

export default apis;