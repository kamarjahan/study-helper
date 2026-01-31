// public/timer.worker.js
self.onmessage = (e) => {
  if (e.data === "start") {
    self.timerId = setInterval(() => {
      postMessage("tick");
    }, 1000);
  } else if (e.data === "stop") {
    clearInterval(self.timerId);
  }
};