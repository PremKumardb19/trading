var promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("🌟 Data Ready");
  }, 1000);
});
            
console.log("Start");

promise.then((data) => {
  console.log("Received:", data);
});

console.log("End");
