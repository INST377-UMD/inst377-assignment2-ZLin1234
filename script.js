
fetch("https://zenquotes.io/api/random")
  .then((res) => res.json())
  .then((data) => {
    const quote = data[0].q;
    const author = data[0].a;
    document.getElementById("quoteText").innerHTML = `“${quote}” — ${author}`;
  })
  .catch((error) => {
    console.error("Error fetching quote:", error);
    document.getElementById("quoteText").innerHTML = "Could not fetch a quote at this time.";
  });

 
function startListening() {
  if (annyang) {
    const commands = {
      "hello": () => alert("Hello World!"),
      "change the color to *color": (color) => {
        document.body.style.backgroundColor = color;
      },
      "navigate to *page": (page) => {
        const target = page.toLowerCase().trim();
        if (target.includes("home")) {
          window.location.href = "A2.html";
        } else if (target.includes("dogs")) {
          window.location.href = "dogs.html";
        } else if (target.includes("stocks")) {
          window.location.href = "stocks.html";
        } else {
          alert("Page not found: " + page);
        }
      },
    };

    annyang.addCommands(commands);
    annyang.start();
  }
}

function stopListening() {
  if (annyang) {
    annyang.abort();
  }
}
