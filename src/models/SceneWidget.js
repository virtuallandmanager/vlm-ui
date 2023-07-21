import { v4 as uuidv4 } from "uuid";
import { getRandomControlName } from "../helpers/widgetNamer";

export const ControlType = {
  NONE: 0,
  TOGGLE: 1,
  TEXT: 2,
  SELECTOR: 3,
  DATETIME: 4,
  TRIGGER: 5,
};

export class SceneWidget {
  sk = uuidv4();
  id;
  name = getRandomControlName();
  selections = [
    { text: "Option 1", value: "option-1" },
    { text: "Option 2", value: "option-2" },
  ];
  type = ControlType.NONE;
  value;
  range = [0, 100];
  createdAt;

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.name = config.name || this.name;
    this.id = config.id || this.name.createSlug();
    this.selections = config.selections || this.selections;
    this.type = config.type;
    this.range = config.range;
    this.value = config.value;
    this.createdAt = config.createdAt;
  }
}
