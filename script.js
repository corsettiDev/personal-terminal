// Page Load ->

const input = document.querySelector('[data-terminal="input"]');
const output = document.querySelector('[data-terminal="output"]');
let failedCommands = 0;
let commandHistory = [];
let commandIndex = 0;

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

// Rolls ->
const rollElements = document.querySelectorAll("[data-roll='wrapper']");

// Define a single function to update event listeners based on window width
function updateRollListeners() {
  rollElements.forEach((roll) => {
    const top = roll.querySelector("[data-roll='top']");
    const bottom = roll.querySelector("[data-roll='bottom']");

    // Define the animation toggle function here to ensure it has access to updated `top` and `bottom` variables
    function rollAnimate() {
      top.classList.toggle("roll_out");
      bottom.classList.toggle("roll_in");
    }

    // Check if event listeners should be added or removed based on window width
    if (window.innerWidth > 650) {
      // Ensure listeners are not added multiple times
      roll.removeEventListener("mouseenter", rollAnimate);
      roll.removeEventListener("mouseleave", rollAnimate);
      roll.addEventListener("mouseenter", rollAnimate);
      roll.addEventListener("mouseleave", rollAnimate);
    } else {
      roll.removeEventListener("mouseenter", rollAnimate);
      roll.removeEventListener("mouseleave", rollAnimate);
    }
  });
}

updateRollListeners();

window.addEventListener("resize", updateRollListeners);

// ===========================================================================

// Audio Player ->

let audioPlaying = false;

function playAudio(src) {
  if (!audioPlaying) {
    audioPlaying = true;
    const audio = new Audio(src);
    audio.volume = 0.1;
    audio.play();
    audio.onended = function () {
      audio.remove();
      audioPlaying = false;
    };
    audio.onerror = function () {
      audio.remove();
      audioPlaying = false;
    };
  } else {
    console.log("Audio is already playing");
  }
}

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

// Input ->
input.addEventListener("input", function () {
  const value = input.value.trim().toLowerCase();
  if (value in commandList) {
    input.style.color = "var(--terminal--okay)";
  } else {
    input.style.color = "var(--colors--white)";
  }
});

// Keyboard Control ->
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim().toLowerCase();
    handleCommand(command);
    commandHistory.push(command);
    commandIndex = commandHistory.length;
  } else if (e.ctrlKey && e.key === "l") {
    handleCommand("clear");
    commandIndex = commandHistory.length;
  } else if (e.ctrlKey && e.key === "c") {
    input.value = "";
    commandIndex = commandHistory.length;
  } else if (e.key === "ArrowUp") {
    if (commandHistory.length > 0) {
      input.value = commandHistory[commandIndex - 1] || "";
      commandIndex = Math.max(commandIndex - 1, 0);
      // Move cursor to end of input
      setTimeout(function () {
        input.selectionStart = input.selectionEnd = 10000;
      }, 0);
    }
  } else if (e.key === "ArrowDown") {
    if (commandHistory.length > 0) {
      if (commandIndex === 0) {
        input.value = commandHistory[commandIndex] || "";
      } else {
        input.value = commandHistory[commandIndex + 1] || "";
      }
      commandIndex = Math.min(commandIndex + 1, commandHistory.length);
    }
  }
});

// Output ->
function appendOutput(command, resultHTML, isError = false, isWarning = false) {
  let outputCommand = document.createElement("p");
  let outputResult = document.createElement("div");
  outputCommand.innerHTML = `> <span>${command}</span>`;
  if (isWarning) {
    outputCommand.querySelector("span").style.color =
      "var(--terminal--warning)";
  } else if (!isError) {
    outputCommand.querySelector("span").style.color = "var(--terminal--okay)";
  }
  outputResult.innerHTML = resultHTML;
  output.appendChild(outputCommand);
  output.appendChild(outputResult);
}

// Commands ->
const commandList = {
  clear: () => {
    output.innerHTML = "";
  },
  help: () =>
    appendOutput(
      input.value.trim(),
      `Need some help navigating this terminal? Here are the available commands:
    ${"<br>".repeat(2)}
    whoami - Learn more about me
    <br>
    contact - Get in touch
    <br>
    clear - Clear the terminal`,
      false,
      true,
    ),
  man: () => commandList.help(), // Alias for help
  about: () =>
    appendOutput(
      input.value.trim(),
      `I'm Patrick, a passionate web and Webflow developer based in Ontario, Canada. With nearly a decade of experience in crafting immersive digital experiences, I thrive on pushing the boundaries of creativity and innovation in web development. From designing visually stunning websites to delving into the intricacies of code and JavaScript, I'm dedicated to bringing ideas to life and making meaningful contributions to the Webflow community.
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
  greet: () =>
    appendOutput(
      input.value.trim(),
      `Hey there! This is kind of weird right? Try typing out the command 'whoami'`,
    ),
  hey: () => commandList.greet(),
  hi: () => commandList.greet(),
  hello: () => commandList.greet(),
  "what is this?": () => commandList.greet(),
  // Easter Eggs ->
  "what is love?": () => {
    playAudio(
      "https://corsetti-dev-easter-eggs.s3.us-east-2.amazonaws.com/baby-don't-hurt-me.webm",
    );
    appendOutput(
      input.value.trim(),
      `Baby don't hurt me. Don't hurt me. No more.`,
    );
  },
  shutdown: () => {
    appendOutput(
      input.value.trim(),
      `So long, and thanks for all the fish!${"<br>"}-Douglas Adams`,
      false,
      false,
    );
    setTimeout(() => {
      document.querySelector(".app-wrapper").innerHTML = "";
    }, 3000);
  },
  "sudo shutdown -h now": () => commandList.shutdown(),
  reboot: () => {
    appendOutput(input.value.trim(), `Rebooting...`, false, false);
    setTimeout(() => {
      location.reload();
    }, 3000);
  },
  "sudo reboot": () => commandList.reboot(),
  // Games ->
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
