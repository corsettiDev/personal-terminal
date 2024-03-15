console.log("Local scripts initialized!");
// Page Load ->

const input = document.querySelector('[data-terminal="input"]');
const output = document.querySelector('[data-terminal="output"]');
let failedCommands = 0;

const terminal = document.querySelector('[data-terminal="ui"]');
const terminalScroll = document.querySelector(
  '[data-terminal="scroll-wrapper"]',
);

const timeDisplay = document.querySelector('[data-nav="time"]');
const cloakedElements = document.querySelectorAll("[cloak]");

const navLinks = document.querySelectorAll('[data-terminal="target"]');

function updateTime() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

  setTimeout(updateTime, 1000 - date.getMilliseconds()); // Adjust to start close to the next second
}
updateTime();

async function displayDynamicData() {
  // Remove cloak attribute from all elements
  cloakedElements.forEach((element) => {
    element.removeAttribute("cloak");
  });
}
displayDynamicData();

// ===========================================================================

// Nav Links ->
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    const target = link.getAttribute("data-nav");
    input.value = target;
    input.focus();
    let event = new KeyboardEvent("keydown", {
      key: "Enter",
    });
    input.dispatchEvent(event);
    })
  });

// ===========================================================================

// Terminal ->
input.focus();

terminal.addEventListener("click", () => {
  input.focus();
});

input.addEventListener("input", function () {
  const value = input.value.trim();
  if (value in commandList) {
    input.style.color = "var(--terminal--okay)";
  } else {
    input.style.color = "var(--colors--white)";
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim();
    handleCommand(command);
  }
});

function appendOutput(command, resultHTML, isError = false) {
  let outputCommand = document.createElement("p");
  let outputResult = document.createElement("div");
  outputCommand.innerHTML = `> <span>${command}</span>`;
  if (!isError) {
    outputCommand.querySelector("span").style.color = "var(--terminal--okay)";
  }
  outputResult.innerHTML = resultHTML;
  output.appendChild(outputCommand);
  output.appendChild(outputResult);
}

const commandList = {
  clear: () => {
    output.innerHTML = "";
  },
  help: () => appendOutput(input.value.trim(), "Call patrick for help"),
  about: () =>
    appendOutput(
      input.value.trim(),
      `My name is Patrick, and I'm a web developer.
    I'm a big fan of JavaScript, and I'm always looking for new ways to improve my skills.${"<br>".repeat(2)}Welcome to my website`,
    ),
  whoami: () => {
    commandList.about();
  },
};

function handleCommand(c) {
  if (c in commandList) {
    commandList[c]();
    failedCommands = 0;
  } else {
    if (failedCommands === 2) {
      commandList.help();
      failedCommands = 0;
    } else {
      appendOutput(
        c,
        `Command not found: <span style="color:var(--terminal--error)">${c}</span>`,
        true,
      );
      failedCommands++;
    }
  }

  // Reset input and adjust terminal scroll
  input.value = "";
  input.style.color = "var(--colors--white)";
  terminalScroll.scrollTop = terminalScroll.scrollHeight;
}
