class TodoItem {
  constructor(value, isCompleted = false, isEdited = false, isDone = false) {
    this.value = value;
    this.isCompleted = isCompleted;
    this.isEdited = isEdited;
    this.isDone = isDone;
  }
}

class App {
  constructor() {
    this.inputElement = document.querySelector(".input-block__input");

    this.addButton = document.querySelector(".input-block__add-button");
    this.addButton.addEventListener("click", () => {
      const dataObjectString = JSON.stringify(
        new TodoItem(this.inputElement.value)
      );
      this.clear(this.inputElement);
      this.setCookie(this.defineId(), dataObjectString, 24);
    });

    this.todoContainer = document.querySelector(".todo-container");

    this.deleteAllButton = document.querySelector(".delete-all-button");
    this.deleteAllButton.addEventListener("click", () => this.deleteAll());
  }

  defineId() {
    let counterValue = this.getCookie("counter");

    if (!counterValue) {
      this.setCookie("counter", 0);
      return 0;
    } else {
      counterValue++;
      this.setCookie("counter", counterValue, 24);

      return counterValue;
    }
  }

  getCookie(name) {
    const matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  setCookie(name, value, lifespanHours) {
    const expirationDate = new Date(Date.now() + lifespanHours * 3600e3);
    const newCookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )};expires=${expirationDate.toUTCString()};path=/;`;

    document.cookie = newCookie;
    this.render();
  }

  deleteCookie(name) {
    this.setCookie(name, "", -1);
  }

  editText(name, input) {
    const cookieObj = JSON.parse(this.getCookie(name));
    cookieObj.isEdited = !cookieObj.isEdited;
    cookieObj.value = input.value;
    const cookieObjString = JSON.stringify(cookieObj);
    this.setCookie(name, cookieObjString, 24);
  }

  completeTodo(name) {
    const cookieObj = JSON.parse(this.getCookie(name));
    cookieObj.isCompleted = !cookieObj.isCompleted;
    const cookieObjString = JSON.stringify(cookieObj);
    this.setCookie(name, cookieObjString, 24);
  }

  deleteAll() {
    const cookiesAsMultiArray = this.getMultiArray();
    for (let cookie of cookiesAsMultiArray) {
      this.deleteCookie(cookie[0]);
    }
  }

  getMultiArray() {
    const cookiesArray = document.cookie.split("; ");
    const splittedCookiesArray = cookiesArray.map((cookie) =>
      cookie.split("=")
    );
    return splittedCookiesArray;
  }

  createEditButton(stateObject, containerName, editedElement) {
    const editButton = document.createElement("button");
    editButton.classList.add("todo-item__edit");

    if (stateObject.isEdited) {
      editButton.classList.add("todo-item__edit_stop");
      editButton.classList.remove("todo-item__edit_start");
    } else {
      editButton.classList.add("todo-item__edit_start");
      editButton.classList.remove("todo-item__edit_stop");
    }

    editButton.addEventListener("click", () => {
      this.editText(containerName, editedElement);
    });

    return editButton;
  }

  createDeleteButton(itemId) {
    const deleteButton = document.createElement("button");
    deleteButton.className = "todo-item__delete";
    deleteButton.addEventListener("click", () => this.deleteCookie(itemId));

    return deleteButton;
  }

  clear(element) {
    element.value = "";
  }

  render() {
    this.todoContainer.innerHTML = "";

    const cookiesAsMultiArray = this.getMultiArray();
    if (cookiesAsMultiArray.length < 2) return;
    const sortedCookiesArray = cookiesAsMultiArray.sort((a, b) => a[0] - b[0]);

    const isAppEdited = sortedCookiesArray.some((cookie) => {
      return JSON.parse(decodeURIComponent(cookie[1])).isEdited;
    });

    for (let cookie of sortedCookiesArray) {
      const cookieContentArray = cookie.map((cookieItem) =>
        decodeURIComponent(cookieItem)
      );

      const [itemId, stateString] = cookieContentArray;
      const stateObject = JSON.parse(stateString);

      if (!stateObject.value) continue;

      const todoElement = document.createElement("li");
      todoElement.className = "todo-item";

      const checkContainer = document.createElement("aside");
      checkContainer.className = "todo-container__check-container";
      checkContainer.style.position = "relative";

      const completedMark = document.createElement("input");
      completedMark.setAttribute("type", "checkbox");
      completedMark.setAttribute("name", "completed");
      completedMark.className = "todo-container__checkbox";

      const completedLabel = document.createElement("label");
      completedLabel.setAttribute("for", "completed");
      completedLabel.className = "todo-container__label";
      completedLabel.addEventListener("click", (event) =>
        this.completeTodo(itemId)
      );

      checkContainer.appendChild(completedMark);
      checkContainer.appendChild(completedLabel);
      todoElement.appendChild(checkContainer);

      const todoText = document.createElement("textarea");
      todoText.classList.add("todo-item__text-input");

      const offset = todoText.offsetHeight - todoText.clientHeight;
      todoText.addEventListener("input", (event) => {
        event.target.style.height = "auto";
        event.target.style.height = event.target.scrollHeight + offset + "px";
      });

      if (stateObject.isCompleted) {
        completedMark.setAttribute("checked", true);
        todoText.classList.add("todo-item__text-input_line-through");

        todoElement.style.gridTemplateAreas = '"ch tt tt tt . de. "';
      } else {
        completedMark.removeAttribute("checked");
        todoText.classList.remove("todo-item__text-input_line-through");

        todoElement.appendChild(
          this.createEditButton(stateObject, itemId, todoText)
        );
      }

      if (stateObject.isEdited) {
        completedMark.setAttribute("disabled", true);
        todoText.removeAttribute("disabled");

        todoElement.style.gridTemplateAreas = '"ch tt tt tt . ed . "';
      } else {
        completedMark.removeAttribute("disabled");
        todoText.setAttribute("disabled", true);
        todoElement.appendChild(this.createDeleteButton(itemId));
      }

      todoText.value = stateObject.value;
      todoElement.appendChild(todoText);

      this.todoContainer.appendChild(todoElement);

      todoText.style.height = todoText.scrollHeight + offset + "px";
      todoText.focus();
    }
  }
}

const app = new App();
app.render();
