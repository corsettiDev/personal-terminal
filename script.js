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
const toastElements = document.querySelectorAll("[data-toast='wrapper']");

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

// Toasts ->
toastElements.forEach((toast) => {
  // Define the mouseleave function outside so it can be reused
  const mouseLeaveFunction = function () {
    toast.querySelector("[data-toast='message']").classList.toggle("active");
    // Remove the mouseleave listener to clean up
    toast.removeEventListener("mouseleave", mouseLeaveFunction);
  };

  toast.addEventListener("mouseenter", function () {
    toast.querySelector("[data-toast='message']").classList.toggle("active");
    // Add the mouseleave listener
    toast.addEventListener("mouseleave", mouseLeaveFunction);
  });
});

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
  });
});

function clickTargetButton(target) {
  document.querySelector(`[data-nav='${target}']`).click();
}

// ===========================================================================

// Terminal ->
input.focus();

terminal.addEventListener("click", () => {
  input.focus();
});

input.addEventListener("input", function () {
  const value = input.value.trim().toLowerCase();
  if (value in commandList) {
    input.style.color = "var(--terminal--okay)";
  } else {
    input.style.color = "var(--colors--white)";
  }
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim().toLowerCase();
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
  help: () => appendOutput(input.value.trim(), `Need some help navigating this terminal? Here are the available commands:
    ${"<br>".repeat(2)}
    whoami - Learn more about me
    <br>
    contact - Get in touch
    <br>
    clear - Clear the terminal`),
  about: () =>
    appendOutput(
      input.value.trim(),
      `Hey there, I'm Patrick, a passionate web and Webflow developer based in Ontario, Canada. With nearly a decade of experience in crafting immersive digital experiences, I thrive on pushing the boundaries of creativity and innovation in web development. From designing visually stunning websites to delving into the intricacies of code and JavaScript, I'm dedicated to bringing ideas to life and making meaningful contributions to the Webflow community.
${"<br>".repeat(2)}
Feel free to <a class="terminal_link" onClick="clickTargetButton('contact')">get in touch</a> to discuss your next project or collaborate on something extraordinary together.`,
    ),
  whoami: () => {
    commandList.about();
  },
  contact: () =>
    appendOutput(
      input.value.trim(),
      `You can find me on X <a class="terminal_link" href="https://twitter.com/corsettiDev" target="_blank">@corsettiDev</a>
    <br>
    Connect with me on <a class="terminal_link" href="https://www.linkedin.com/in/patrick-corsetti/" target="_blank">LinkedIn</a>
    ${"<br>".repeat(2)}
    or send me an email at <a class="terminal_link text--hover-highlight" href="mailto:patrick@corsetti.dev?subject=Inquiry%20%7C%20corsettiDev&body=%2F%2F%20Let%20me%20know%20why%20you're%20reaching%20out!">patrick@corsetti.dev</a>`,
    ),
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
