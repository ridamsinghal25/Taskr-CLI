import { Command } from "commander";
import { login } from "./login.js";
import { logout } from "./logout.js";
import { whoami } from "./whoami.js";

export const auth = new Command("auth").description("Manage authentication");

auth.addCommand(login);
auth.addCommand(logout);
auth.addCommand(whoami);
