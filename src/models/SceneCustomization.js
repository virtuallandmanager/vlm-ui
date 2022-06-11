import { nanoid } from "nanoid";

export class SceneCustomization {
  id = nanoid(6);
  name = "";
  type = 0;
  value = false;
  selections = [
    { text: "Option 1", value: "option-1" },
    { text: "Option 2", value: "option-2" }
  ];

  constructor() {}
}
